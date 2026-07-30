-- Bank Customer Churn Analysis SQL Queries

-- 1. Total customers
SELECT COUNT(*) AS total_customers
FROM bank_churn;

-- 2. Number of churned customers
SELECT SUM(CASE WHEN churned = 1 THEN 1 ELSE 0 END) AS churned_customers
FROM bank_churn;

-- 3. Churn rate
SELECT ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn;

-- 4. Average balance
SELECT ROUND(AVG(balance), 2) AS avg_balance
FROM bank_churn;

-- 5. Average salary
SELECT ROUND(AVG(estimated_salary), 2) AS avg_salary
FROM bank_churn;

-- 6. Churn by geography
SELECT geography, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY geography
ORDER BY churn_rate_pct DESC;

-- 7. Churn by gender
SELECT gender, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY gender
ORDER BY churn_rate_pct DESC;

-- 8. Churn by age group
SELECT age_group, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY age_group
ORDER BY churn_rate_pct DESC;

-- 9. Active vs inactive customers
SELECT is_active_member, COUNT(*) AS customer_count
FROM bank_churn
GROUP BY is_active_member;

-- 10. Churn by active status
SELECT is_active_member, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY is_active_member;

-- 11. Products vs churn
SELECT num_of_products, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY num_of_products
ORDER BY num_of_products;

-- 12. Average balance by geography
SELECT geography, ROUND(AVG(balance), 2) AS avg_balance
FROM bank_churn
GROUP BY geography
ORDER BY avg_balance;

-- 13. Average salary by gender
SELECT gender, ROUND(AVG(estimated_salary), 2) AS avg_salary
FROM bank_churn
GROUP BY gender;

-- 14. Churn by geography and gender
SELECT geography, gender, ROUND(AVG(CASE WHEN churned = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) AS churn_rate_pct
FROM bank_churn
GROUP BY geography, gender
ORDER BY geography, churn_rate_pct DESC;

-- 15. High-risk customers with low balance and inactive status
SELECT customer_id, geography, age, balance, estimated_salary
FROM bank_churn
WHERE churned = 1 AND is_active_member = 0 AND balance < 50000
ORDER BY balance ASC
LIMIT 20;
