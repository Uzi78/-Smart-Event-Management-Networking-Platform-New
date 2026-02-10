import base64
import io
import uuid

import qrcode


class QRCodeService:
    def generate_qr_code(self, registration_id: str) -> tuple[str, str]:
        qr_code_string = f"REG-{registration_id}-{uuid.uuid4().hex[:8].upper()}"

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_code_string)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return qr_code_string, f"data:image/png;base64,{img_base64}"

    def verify_qr_code(self, qr_code: str) -> bool:
        return qr_code.startswith("REG-") and len(qr_code.split("-")) == 3


qrcode_service = QRCodeService()
