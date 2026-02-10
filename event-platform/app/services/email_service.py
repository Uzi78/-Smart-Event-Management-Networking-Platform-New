import base64
import smtplib
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, Optional

from jinja2 import Template

from app.config import settings


class EmailService:
    def __init__(self) -> None:
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.email_from = settings.email_from

    async def send_confirmation_email(
        self,
        to_email: str,
        registration_data: Dict[str, Any],
        qr_code_base64: str,
    ) -> bool:
        subject = f"Registration Confirmed - {registration_data['event_name']}"

        template = Template(
            """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; background: #f9fafb; }
                    .ticket { background: white; border: 2px solid #2563eb; border-radius: 10px; padding: 20px; margin: 20px 0; }
                    .qr-code { text-align: center; margin: 20px 0; }
                    .qr-code img { max-width: 250px; }
                    .details { margin: 20px 0; }
                    .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                    .label { font-weight: bold; color: #6b7280; }
                    .value { color: #111827; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Registration Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi {{ first_name }},</p>
                        <p>Thank you for registering for <strong>{{ event_name }}</strong>!</p>
                        <div class="ticket">
                            <h2>Your Ticket</h2>
                            <div class="qr-code">
                                <img src="cid:qrcode" alt="QR Code">
                                <p><strong>{{ qr_code }}</strong></p>
                                <p style="color: #6b7280;">Present this QR code at check-in</p>
                            </div>
                            <div class="details">
                                <div class="details-row">
                                    <span class="label">Name:</span>
                                    <span class="value">{{ first_name }} {{ last_name }}</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Email:</span>
                                    <span class="value">{{ email }}</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Ticket Type:</span>
                                    <span class="value">{{ ticket_type }}</span>
                                </div>
                                <div class="details-row">
                                    <span class="label">Amount Paid:</span>
                                    <span class="value">${{ final_price }}</span>
                                </div>
                                {% if discount_amount > 0 %}
                                <div class="details-row">
                                    <span class="label">Discount Applied:</span>
                                    <span class="value" style="color: #10b981;">-${{ discount_amount }}</span>
                                </div>
                                {% endif %}
                                <div class="details-row">
                                    <span class="label">Registration ID:</span>
                                    <span class="value">{{ registration_id }}</span>
                                </div>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <a href="{{ event_url }}" class="button">View Event Details</a>
                        </div>
                        <p><strong>Important Information:</strong></p>
                        <ul>
                            <li>Save this email - you'll need the QR code for check-in</li>
                            <li>Arrive 15 minutes early for smooth check-in</li>
                            <li>Event Date: {{ event_date }}</li>
                            <li>Venue: {{ venue }}</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>Questions? Contact us at support@eventplatform.com</p>
                        <p>&copy; 2024 EventPlatform. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        )

        html_content = template.render(**registration_data)

        message = MIMEMultipart("related")
        message["Subject"] = subject
        message["From"] = self.email_from
        message["To"] = to_email

        alt = MIMEMultipart("alternative")
        message.attach(alt)
        alt.attach(MIMEText(html_content, "html"))

        if qr_code_base64:
            img_data = qr_code_base64.split(",")[1] if "," in qr_code_base64 else qr_code_base64
            img_binary = base64.b64decode(img_data)
            img = MIMEImage(img_binary)
            img.add_header("Content-ID", "<qrcode>")
            img.add_header("Content-Disposition", "inline", filename="qrcode.png")
            message.attach(img)

        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)
            return True
        except Exception as exc:  # pragma: no cover
            print(f"Error sending email: {exc}")
            return False

    async def send_waitlist_notification(
        self,
        to_email: str,
        event_name: str,
        ticket_type: str,
        position: int,
        expires_at: Optional[str] = None,
    ) -> bool:
        subject = f"Ticket Available - {event_name}"

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">Great News! A Ticket is Available</h2>
                <p>A spot has opened up for <strong>{event_name}</strong>!</p>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Event:</strong> {event_name}</p>
                    <p><strong>Ticket Type:</strong> {ticket_type}</p>
                    <p><strong>Your Waitlist Position:</strong> #{position}</p>
                    {f'<p><strong>Expires:</strong> {expires_at}</p>' if expires_at else ''}
                </div>
                <p style="text-align: center;">
                    <a href="{settings.app_url}/claim-ticket" 
                       style="display: inline-block; background: #2563eb; color: white; 
                              padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                        Claim Your Ticket Now
                    </a>
                </p>
                <p style="color: #dc2626;"><strong>Important:</strong> This opportunity expires in 24 hours!</p>
            </div>
        </body>
        </html>
        """

        message = MIMEMultipart()
        message["Subject"] = subject
        message["From"] = self.email_from
        message["To"] = to_email
        message.attach(MIMEText(html_content, "html"))

        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)
            return True
        except Exception as exc:  # pragma: no cover
            print(f"Error sending waitlist email: {exc}")
            return False


default_email_service = EmailService()

email_service = default_email_service
