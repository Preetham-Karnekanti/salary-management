package com.acme.salarymanagement.dto.salary;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalaryResponse(
        Long id,
        BigDecimal baseSalary,
        String currencyCode,
        LocalDate effectiveFrom
) {
}