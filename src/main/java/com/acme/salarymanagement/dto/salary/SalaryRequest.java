package com.acme.salarymanagement.dto.salary;

import jakarta.validation.constraints.*;

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
        @PastOrPresent
        LocalDate effectiveFrom

) {
}