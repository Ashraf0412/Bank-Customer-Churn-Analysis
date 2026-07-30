# Power BI Dashboard Specification

## Page Layout

- One-page dashboard with KPI cards at the top
- Four or five charts below the cards
- Slicers on the left or top

## KPI Cards

- Total Customers
- Churn Rate
- Average Balance
- Average Salary

## Charts

- Churn by Geography
- Churn by Gender
- Churn by Age Group
- Churn by Products
- Active Members vs Inactive Members

## Slicers

- Geography
- Gender
- Age Group

## Suggested Fields

- Total Customers: Count of customer_id
- Churn Rate: Average of churned
- Average Balance: Average of balance
- Average Salary: Average of estimated_salary
- Churn by Geography: geography + churned
- Churn by Gender: gender + churned
- Churn by Age Group: age_group + churned
- Churn by Products: num_of_products + churned
- Active Members: is_active_member + customer_id
