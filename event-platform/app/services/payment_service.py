from typing import Any, Dict, Optional

import paypalrestsdk
import stripe

from app.config import settings

stripe.api_key = settings.stripe_secret_key

paypalrestsdk.configure(
    {
        "mode": settings.paypal_mode,
        "client_id": settings.paypal_client_id,
        "client_secret": settings.paypal_client_secret,
    }
)


class PaymentService:
    async def create_stripe_payment_intent(
        self,
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        try:
            amount_cents = int(amount * 100)
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True},
            )
            return {
                "success": True,
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "status": intent.status,
            }
        except stripe.error.StripeError as exc:
            return {"success": False, "error": str(exc)}

    async def confirm_stripe_payment(self, payment_intent_id: str) -> Dict[str, Any]:
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "success": True,
                "status": intent.status,
                "amount": intent.amount / 100,
                "paid": intent.status == "succeeded",
            }
        except stripe.error.StripeError as exc:
            return {"success": False, "error": str(exc)}

    async def create_paypal_payment(
        self,
        amount: float,
        currency: str = "USD",
        description: str = "Event Registration",
        return_url: Optional[str] = None,
        cancel_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        payment = paypalrestsdk.Payment(
            {
                "intent": "sale",
                "payer": {"payment_method": "paypal"},
                "redirect_urls": {
                    "return_url": return_url or f"{settings.app_url}/payment/success",
                    "cancel_url": cancel_url or f"{settings.app_url}/payment/cancel",
                },
                "transactions": [
                    {
                        "amount": {"total": f"{amount:.2f}", "currency": currency},
                        "description": description,
                    }
                ],
            }
        )

        if payment.create():
            approval_url = None
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    break
            return {
                "success": True,
                "payment_id": payment.id,
                "approval_url": approval_url,
            }
        return {"success": False, "error": payment.error}

    async def execute_paypal_payment(
        self,
        payment_id: str,
        payer_id: str,
    ) -> Dict[str, Any]:
        payment = paypalrestsdk.Payment.find(payment_id)
        if payment.execute({"payer_id": payer_id}):
            return {
                "success": True,
                "payment_id": payment.id,
                "status": payment.state,
                "amount": float(payment.transactions[0].amount.total),
            }
        return {"success": False, "error": payment.error}

    async def refund_stripe_payment(
        self,
        payment_intent_id: str,
        amount: Optional[float] = None,
    ) -> Dict[str, Any]:
        try:
            refund_params: Dict[str, Any] = {"payment_intent": payment_intent_id}
            if amount:
                refund_params["amount"] = int(amount * 100)
            refund = stripe.Refund.create(**refund_params)
            return {
                "success": True,
                "refund_id": refund.id,
                "status": refund.status,
                "amount": refund.amount / 100,
            }
        except stripe.error.StripeError as exc:
            return {"success": False, "error": str(exc)}


default_payment_service = PaymentService()

payment_service = default_payment_service
