from fastapi import APIRouter, HTTPException, Request
import stripe

from app.config import settings
from app.services.payment_service import payment_service
from app.services.registration_service import registration_service

router = APIRouter(prefix="/api/payment", tags=["payment"])


@router.post("/stripe/create-intent")
async def create_stripe_payment_intent(
    amount: float,
    registration_id: str,
    currency: str = "usd",
):
    try:
        result = await payment_service.create_stripe_payment_intent(
            amount,
            currency,
            metadata={"registration_id": registration_id},
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError as exc:  # pragma: no cover
        raise HTTPException(status_code=400, detail="Invalid payload") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid signature") from exc

    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        registration_id = payment_intent["metadata"].get("registration_id")
        if registration_id:
            await registration_service.confirm_payment(
                registration_id,
                {
                    "payment_method": "stripe",
                    "payment_intent_id": payment_intent["id"],
                    "transaction_id": payment_intent["id"],
                },
            )

    return {"success": True}


@router.post("/paypal/create-payment")
async def create_paypal_payment(
    amount: float,
    description: str = "Event Registration",
    registration_id: str | None = None,
):
    try:
        result = await payment_service.create_paypal_payment(
            amount,
            description=description,
            return_url=f"{settings.app_url}/payment/paypal/success?registration_id={registration_id}",
            cancel_url=f"{settings.app_url}/payment/paypal/cancel",
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/paypal/execute-payment")
async def execute_paypal_payment(payment_id: str, payer_id: str, registration_id: str):
    try:
        result = await payment_service.execute_paypal_payment(payment_id, payer_id)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])

        await registration_service.confirm_payment(
            registration_id,
            {
                "payment_method": "paypal",
                "paypal_order_id": payment_id,
                "transaction_id": payment_id,
            },
        )

        return {"success": True, "message": "Payment completed successfully"}
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=str(exc)) from exc
