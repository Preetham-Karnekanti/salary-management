package com.acme.salarymanagement.dto.employee;

import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.enums.EmploymentStatus;

import java.time.LocalDate;

public record EmployeeResponse(
        Long id,
        String employeeCode,
        String firstName,
        String lastName,
        String email,
        Long countryId,
        String countryName,
        Long departmentId,
        String departmentName,
        String jobTitle,
        EmploymentStatus employmentStatus,
        LocalDate hireDate,
        SalaryResponse currentSalary
) {
}