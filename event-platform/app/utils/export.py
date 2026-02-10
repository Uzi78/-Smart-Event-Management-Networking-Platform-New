import io
from datetime import datetime
from typing import Any, Dict, List

import pandas as pd


class ExportService:
    async def export_registrations_csv(self, registrations: List[Dict[str, Any]]) -> bytes:
        flattened = []
        for reg in registrations:
            row = {
                "Registration ID": str(reg.get("_id", "")),
                "First Name": reg.get("first_name", ""),
                "Last Name": reg.get("last_name", ""),
                "Email": reg.get("email", ""),
                "Phone": reg.get("phone", ""),
                "Company": reg.get("company", ""),
                "Job Title": reg.get("job_title", ""),
                "Ticket Type": reg.get("ticket_type_name", ""),
                "Status": reg.get("status", ""),
                "Payment Status": reg.get("payment_status", ""),
                "Original Price": f"${reg.get('original_price', 0):.2f}",
                "Discount": f"${reg.get('discount_amount', 0):.2f}",
                "Final Price": f"${reg.get('final_price', 0):.2f}",
                "QR Code": reg.get("qr_code", ""),
                "Checked In": "Yes" if reg.get("checked_in") else "No",
                "Check-in Time": reg.get("check_in_time", ""),
                "Registration Date": reg.get("created_at", ""),
            }
            if reg.get("form_responses"):
                for key, value in reg["form_responses"].items():
                    row[f"Custom: {key}"] = value
            flattened.append(row)

        df = pd.DataFrame(flattened)
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        return buffer.getvalue().encode("utf-8")

    async def export_registrations_excel(self, registrations: List[Dict[str, Any]]) -> bytes:
        flattened = []
        for reg in registrations:
            row = {
                "Registration ID": str(reg.get("_id", "")),
                "First Name": reg.get("first_name", ""),
                "Last Name": reg.get("last_name", ""),
                "Email": reg.get("email", ""),
                "Phone": reg.get("phone", ""),
                "Company": reg.get("company", ""),
                "Job Title": reg.get("job_title", ""),
                "Ticket Type": reg.get("ticket_type_name", ""),
                "Status": reg.get("status", ""),
                "Payment Status": reg.get("payment_status", ""),
                "Original Price": reg.get("original_price", 0),
                "Discount": reg.get("discount_amount", 0),
                "Final Price": reg.get("final_price", 0),
                "QR Code": reg.get("qr_code", ""),
                "Checked In": "Yes" if reg.get("checked_in") else "No",
                "Check-in Time": reg.get("check_in_time", ""),
                "Registration Date": reg.get("created_at", ""),
            }
            if reg.get("form_responses"):
                for key, value in reg["form_responses"].items():
                    row[f"Custom: {key}"] = value
            flattened.append(row)

        df = pd.DataFrame(flattened)
        excel_buffer = io.BytesIO()
        with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:
            df.to_excel(writer, sheet_name="Registrations", index=False)
            worksheet = writer.sheets["Registrations"]
            for idx, column in enumerate(df.columns, start=1):
                max_length = max(df[column].astype(str).map(len).max(), len(column))
                worksheet.column_dimensions[chr(64 + idx)].width = min(max_length + 2, 50)

        excel_buffer.seek(0)
        return excel_buffer.getvalue()


export_service = ExportService()
