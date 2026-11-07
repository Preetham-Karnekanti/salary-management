package com.acme.salarymanagement.dto.salary;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalaryRequest(

        @NotNull
        @DecimalMin("0.01")
        BigDecimal baseSalary,

        @NotBlank
        @Size(min = 3, max = 3)
        String currencyCode,

        @NotNull
        LocalDate effectiveFrom

) {
}