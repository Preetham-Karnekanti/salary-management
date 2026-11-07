package com.acme.salarymanagement.mapper;

import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.entity.Salary;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class SalaryMapperTest {

    private SalaryMapper salaryMapper;

    @BeforeEach
    void setUp() {
        salaryMapper = new SalaryMapper();
    }

    @Test
    void shouldMapSalaryEntityToResponse() {
        Salary salary = Salary.builder()
                .id(1L)
                .baseSalary(new BigDecimal("85000.00"))
                .currencyCode("INR")
                .effectiveFrom(LocalDate.of(2026, 11, 7))
                .createdBy("SYSTEM")
                .build();

        SalaryResponse response = salaryMapper.toResponse(salary);

        assertNotNull(response);
        assertEquals(1L, response.id());
        assertEquals(new BigDecimal("85000.00"), response.baseSalary());
        assertEquals("INR", response.currencyCode());
        assertEquals(LocalDate.of(2026, 11, 7), response.effectiveFrom());
    }

    @Test
    void shouldReturnNullWhenSalaryIsNull() {
        SalaryResponse response = salaryMapper.toResponse(null);

        assertNull(response);
    }
}