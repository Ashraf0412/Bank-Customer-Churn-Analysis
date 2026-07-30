# Bank Customer Churn Analysis

This project is a beginner-friendly, portfolio-ready data analysis case study for a banking context. The goal is to explore customer churn using Python, SQL, and Power BI without using machine learning.

## Project Objective

Understand which customer segments are most likely to leave the bank and provide business-friendly recommendations based on descriptive analysis.

## Tools Used

- Python
- Pandas
- Matplotlib
- Seaborn
- MySQL
- Power BI
- VS Code

## Project Structure

- data/BankChurn.csv - Raw customer churn dataset
- notebooks/churn_analysis.ipynb - Python notebook for data cleaning and EDA
- sql/analysis_queries.sql - SQL queries for business analysis
- dashboard/ChurnDashboard.pbix - Power BI dashboard file placeholder
- dashboard/PowerBI_Dashboard_Spec.md - Dashboard layout and field mapping
- images/dashboard.png - Dashboard preview image
- requirements.txt - Python dependencies

## Workflow

1. Load and clean the churn dataset
2. Explore customer behavior with charts and summary statistics
3. Answer business questions with SQL
4. Build a Power BI dashboard with KPI cards and charts
5. Summarize business insights and recommendations

## Key Findings

- Churn is highest among customers in Germany and among inactive members.
- Customers with lower account balances and fewer products tend to churn more often.
- Older customers and customers with lower engagement show higher exit rates.

## Business Insights

1. Inactive members have a much higher churn rate than active members.
2. Germany has the highest churn rate among geographies.
3. Female customers show a slightly higher churn rate than male customers.
4. Customers with one product are more likely to leave compared with those holding multiple products.
5. Customers with lower balances are more vulnerable to attrition.
6. The average salary of churned customers is slightly lower than that of retained customers.
7. Customers in older age groups tend to leave more often.
8. Churn is concentrated in customers with lower engagement and lower product diversity.

## Recommendations

1. Focus retention campaigns on inactive members first.
2. Improve engagement for German customers with targeted offers.
3. Encourage customers to adopt more bank products through bundled promotions.
4. Create loyalty offers for customers with low balances and lower product counts.
5. Review service quality for older customers and customers with low satisfaction signals.

## How to Run

1. Install dependencies:
   pip install -r requirements.txt
2. Open notebooks/churn_analysis.ipynb in VS Code.
3. Run the SQL queries in MySQL Workbench or any MySQL client.
4. Open the Power BI dashboard spec and recreate the visuals in Power BI Desktop.

## Notes

This is a descriptive analytics project intended for interview preparation and portfolio presentation. It focuses on storytelling, business understanding, and dashboard creation rather than prediction modeling.
