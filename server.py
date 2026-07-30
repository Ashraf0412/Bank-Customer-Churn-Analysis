import csv
import json
import os
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Project root
BASE_DIR = Path(__file__).resolve().parent

# Dashboard folder (contains index.html, CSS, JS)
DASHBOARD_DIR = BASE_DIR / "dashboard"

# CSV dataset
DATA_FILE = BASE_DIR / "data" / "BankChurn.csv"

FIELD_NAMES = [
    "customer_id",
    "customer_name",
    "credit_score",
    "geography",
    "gender",
    "age",
    "tenure",
    "balance",
    "num_of_products",
    "has_credit_card",
    "is_active_member",
    "estimated_salary",
    "churned",
]


class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DASHBOARD_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/add-record":
            self.send_error(404, "Endpoint not found")
            return

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)

        try:
            record = json.loads(body)
        except json.JSONDecodeError:
            self.send_error(400, "Invalid JSON")
            return

        missing = [field for field in FIELD_NAMES if field not in record]
        if missing:
            self.send_error(400, f"Missing fields: {', '.join(missing)}")
            return

        try:
            self.append_record(record)
        except Exception as e:
            self.send_error(500, f"Unable to save record: {e}")
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(
            json.dumps(
                {
                    "status": "success",
                    "message": "Record added successfully"
                }
            ).encode("utf-8")
        )

    def append_record(self, record):
        row = {field: record[field] for field in FIELD_NAMES}

        file_exists = DATA_FILE.exists()

        with DATA_FILE.open("a", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=FIELD_NAMES)

            if not file_exists:
                writer.writeheader()

            writer.writerow(row)


def main():
    port = int(os.environ.get("PORT", 8000))

    server_address = ("0.0.0.0", port)

    httpd = HTTPServer(server_address, DashboardRequestHandler)

    print("=" * 60)
    print("Bank Customer Churn Dashboard")
    print(f"Serving dashboard on port {port}")
    print("=" * 60)

    httpd.serve_forever()


if __name__ == "__main__":
    main()