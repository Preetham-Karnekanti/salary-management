package com.acme.salarymanagement.dto.employee;

import com.acme.salarymanagement.enums.EmploymentStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record EmployeeRequest(

        @NotBlank
        @Size(max = 30)
        String employeeCode,

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @NotBlank
        @Email
        String email,

        @NotNull
        Long countryId,

        @NotNull
        Long departmentId,

        @NotBlank
        @Size(max = 150)
        String jobTitle,

        @NotNull
        EmploymentStatus employmentStatus,

        @NotNull
        @PastOrPresent
        LocalDate hireDate
) {
}