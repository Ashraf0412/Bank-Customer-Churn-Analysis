import csv
import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR.parent / 'data' / 'BankChurn.csv'
FIELD_NAMES = [
    'customer_id',
    'customer_name',
    'credit_score',
    'geography',
    'gender',
    'age',
    'tenure',
    'balance',
    'num_of_products',
    'has_credit_card',
    'is_active_member',
    'estimated_salary',
    'churned',
]

class DashboardRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_POST(self):
        if self.path != '/api/add-record':
            self.send_error(404, 'Endpoint not found')
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            record = json.loads(body)
        except json.JSONDecodeError:
            self.send_error(400, 'Invalid JSON')
            return

        missing = [key for key in FIELD_NAMES if key not in record]
        if missing:
            self.send_error(400, f"Missing fields: {', '.join(missing)}")
            return

        try:
            self.append_record(record)
        except Exception as exc:
            self.send_error(500, f'Unable to save record: {exc}')
            return

        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'Record added')

    def append_record(self, record):
        row = {field: record[field] for field in FIELD_NAMES}
        with DATA_FILE.open('a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=FIELD_NAMES)
            writer.writerow(row)


def main():
    server_address = ('', 8000)
    httpd = HTTPServer(server_address, DashboardRequestHandler)
    print('Serving dashboard at http://localhost:8000')
    httpd.serve_forever()


if __name__ == '__main__':
    main()
