import csv
import json
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parent
    csv_path = root.parent / 'data' / 'BankChurn.csv'
    output_path = root / 'dashboard_data.js'

    with csv_path.open(newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            rows.append({
                'customer_id': int(row['customer_id']),
                'customer_name': row['customer_name'].strip(),
                'credit_score': int(row['credit_score']),
                'geography': row['geography'].strip().title(),
                'gender': row['gender'].strip().title(),
                'age': int(row['age']),
                'tenure': int(row['tenure']),
                'balance': float(row['balance']),
                'num_of_products': int(row['num_of_products']),
                'has_credit_card': int(row['has_credit_card']),
                'is_active_member': int(row['is_active_member']),
                'estimated_salary': float(row['estimated_salary']),
                'churned': int(row['churned']),
            })

    with output_path.open('w', encoding='utf-8') as f:
        f.write('const bankData = ' + json.dumps(rows, indent=2) + ';\n')

    print(f'Created {output_path}')


if __name__ == '__main__':
    main()
