package com.acme.salarymanagement.enums;

public enum EmployeeSortField {

    EMPLOYEE_CODE("employeeCode"),
    FIRST_NAME("firstName"),
    EMAIL("email"),
    JOB_TITLE("jobTitle"),
    EMPLOYMENT_STATUS("employmentStatus");

    private final String property;

    EmployeeSortField(String property) {
        this.property = property;
    }

    public String getProperty() {
        return property;
    }
}