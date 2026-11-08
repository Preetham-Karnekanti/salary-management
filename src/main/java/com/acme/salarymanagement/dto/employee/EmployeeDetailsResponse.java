package com.acme.salarymanagement.dto.employee;

import com.acme.salarymanagement.dto.salary.SalaryResponse;

import java.util.List;

public record EmployeeDetailsResponse(
        EmployeeResponse employee,
        List<SalaryResponse> salaryHistory
) {}