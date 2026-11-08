package com.acme.salarymanagement.dto.employee;

import com.acme.salarymanagement.enums.EmployeeSortField;
import com.acme.salarymanagement.enums.EmploymentStatus;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import org.springframework.data.domain.Sort;

public record EmployeeSearchRequest(
        EmploymentStatus employmentStatus,
        Long countryId,
        Long departmentId,

        @Min(0)
        Integer page,

        @Min(1)
        @Max(100)
        Integer size,

        EmployeeSortField sortBy,
        Sort.Direction sortDirection
) {
    public EmployeeSearchRequest {
        page = page == null ? 0 : page;
        size = size == null ? 10 : size;
        sortBy = sortBy == null
                ? EmployeeSortField.EMPLOYEE_CODE
                : sortBy;
        sortDirection = sortDirection == null
                ? Sort.Direction.ASC
                : sortDirection;
    }
}