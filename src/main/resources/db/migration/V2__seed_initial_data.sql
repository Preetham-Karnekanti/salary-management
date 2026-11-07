MERGE INTO countries (country_code, name, default_currency_code)
KEY (country_code)
VALUES
('IN', 'India', 'INR'),
('US', 'United States', 'USD'),
('GB', 'United Kingdom', 'GBP'),
('DE', 'Germany', 'EUR'),
('CA', 'Canada', 'CAD'),
('AU', 'Australia', 'AUD'),
('SG', 'Singapore', 'SGD'),
('JP', 'Japan', 'JPY'),
('AE', 'United Arab Emirates', 'AED'),
('FR', 'France', 'EUR');

MERGE INTO departments (name)
KEY (name)
VALUES
('Engineering'),
('Human Resources'),
('Finance'),
('Marketing'),
('Sales'),
('Operations'),
('Product Management'),
('Customer Support'),
('Legal'),
('IT');

INSERT INTO employees (
    employee_code,
    first_name,
    last_name,
    email,
    country_id,
    department_id,
    job_title,
    employment_status,
    hire_date
)
SELECT
    'EMP' || LPAD(CAST(r.X AS VARCHAR), 5, '0'),

    CASE MOD(r.X, 10)
        WHEN 0 THEN 'John'
        WHEN 1 THEN 'David'
        WHEN 2 THEN 'Michael'
        WHEN 3 THEN 'Sarah'
        WHEN 4 THEN 'Emma'
        WHEN 5 THEN 'James'
        WHEN 6 THEN 'Sophia'
        WHEN 7 THEN 'Daniel'
        WHEN 8 THEN 'Olivia'
        ELSE 'Robert'
    END,

    CASE MOD(r.X, 8)
        WHEN 0 THEN 'Smith'
        WHEN 1 THEN 'Johnson'
        WHEN 2 THEN 'Williams'
        WHEN 3 THEN 'Brown'
        WHEN 4 THEN 'Jones'
        WHEN 5 THEN 'Garcia'
        WHEN 6 THEN 'Miller'
        ELSE 'Davis'
    END,

    'employee' || r.X || '@acme.com',

    c.id,
    d.id,

    CASE MOD(r.X, 6)
        WHEN 0 THEN 'Software Engineer'
        WHEN 1 THEN 'Senior Engineer'
        WHEN 2 THEN 'Product Manager'
        WHEN 3 THEN 'HR Specialist'
        WHEN 4 THEN 'Financial Analyst'
        ELSE 'Business Analyst'
    END,

    CASE
        WHEN MOD(r.X, 20) = 0 THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END,

    DATEADD('DAY', -MOD(r.X, 3650), CURRENT_DATE)

FROM SYSTEM_RANGE(1, 10000) r

JOIN countries c
    ON c.country_code = CASE MOD(r.X, 10)
        WHEN 0 THEN 'IN'
        WHEN 1 THEN 'US'
        WHEN 2 THEN 'GB'
        WHEN 3 THEN 'DE'
        WHEN 4 THEN 'CA'
        WHEN 5 THEN 'AU'
        WHEN 6 THEN 'SG'
        WHEN 7 THEN 'JP'
        WHEN 8 THEN 'AE'
        ELSE 'FR'
    END

JOIN departments d
    ON d.name = CASE MOD(r.X, 10)
        WHEN 0 THEN 'Engineering'
        WHEN 1 THEN 'Human Resources'
        WHEN 2 THEN 'Finance'
        WHEN 3 THEN 'Marketing'
        WHEN 4 THEN 'Sales'
        WHEN 5 THEN 'Operations'
        WHEN 6 THEN 'Product Management'
        WHEN 7 THEN 'Customer Support'
        WHEN 8 THEN 'Legal'
        ELSE 'IT'
    END;

INSERT INTO salaries (
    employee_id,
    base_salary,
    currency_code,
    effective_from,
    effective_to,
    created_by
)
SELECT
    e.id,

    CASE c.default_currency_code
        WHEN 'INR' THEN 60000 + MOD(e.id, 20) * 2500
        WHEN 'USD' THEN 5000 + MOD(e.id, 20) * 250
        WHEN 'GBP' THEN 3500 + MOD(e.id, 20) * 150
        WHEN 'EUR' THEN 4000 + MOD(e.id, 20) * 200
        WHEN 'CAD' THEN 5500 + MOD(e.id, 20) * 250
        WHEN 'AUD' THEN 6000 + MOD(e.id, 20) * 250
        WHEN 'SGD' THEN 5000 + MOD(e.id, 20) * 200
        WHEN 'JPY' THEN 500000 + MOD(e.id, 20) * 25000
        WHEN 'AED' THEN 15000 + MOD(e.id, 20) * 750
        ELSE 4000 + MOD(e.id, 20) * 200
    END,

    c.default_currency_code,
    e.hire_date,
    NULL,
    'SEED'

FROM employees e
JOIN countries c ON c.id = e.country_id;