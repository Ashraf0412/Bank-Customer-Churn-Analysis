import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path


def load_data(data_path: str) -> pd.DataFrame:
    """Load the bank churn dataset from a CSV file."""
    df = pd.read_csv(data_path)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean column names, remove duplicates, and create simple grouping fields."""
    df = df.copy()
    df.columns = [col.strip().lower().replace(' ', '_') for col in df.columns]
    df['gender'] = df['gender'].astype(str).str.strip().str.title()
    df['geography'] = df['geography'].astype(str).str.strip().str.title()

    bins = [0, 30, 40, 50, 100]
    labels = ['Under 30', '31-40', '41-50', '51+']
    df['age_group'] = pd.cut(df['age'], bins=bins, labels=labels, include_lowest=True)

    for col in ['credit_score', 'age', 'balance', 'estimated_salary']:
        if df[col].isna().sum() > 0:
            df[col] = df[col].fillna(df[col].median())

    df = df.drop_duplicates()
    return df


def create_dashboard_image(df: pd.DataFrame, output_path: Path) -> None:
    """Create a simple dashboard-style chart image for the portfolio."""
    sns.set(style='whitegrid')
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    fig.suptitle('Bank Customer Churn Dashboard Preview', fontsize=14)

    sns.barplot(data=df.groupby('geography')['churned'].mean().reset_index(),
                x='geography', y='churned', ax=axes[0, 0])
    axes[0, 0].set_title('Churn by Geography')
    axes[0, 0].set_ylabel('Churn Rate')

    sns.barplot(data=df.groupby('gender')['churned'].mean().reset_index(),
                x='gender', y='churned', ax=axes[0, 1])
    axes[0, 1].set_title('Churn by Gender')
    axes[0, 1].set_ylabel('Churn Rate')

    sns.barplot(data=df.groupby('age_group')['churned'].mean().reset_index(),
                x='age_group', y='churned', ax=axes[1, 0])
    axes[1, 0].set_title('Churn by Age Group')
    axes[1, 0].set_ylabel('Churn Rate')

    sns.barplot(data=df.groupby('num_of_products')['churned'].mean().reset_index(),
                x='num_of_products', y='churned', ax=axes[1, 1])
    axes[1, 1].set_title('Churn by Products')
    axes[1, 1].set_ylabel('Churn Rate')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close(fig)


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    data_path = project_root / 'data' / 'BankChurn.csv'
    output_path = project_root / 'images' / 'dashboard.png'

    df = load_data(str(data_path))
    df = clean_data(df)
    create_dashboard_image(df, output_path)

    print(f'Loaded {len(df)} rows from {data_path}')
    print(f'Created dashboard image at {output_path}')


if __name__ == '__main__':
    main()
