package com.acme.salarymanagement.service;

import com.acme.salarymanagement.common.exception.ResourceNotFoundException;
import com.acme.salarymanagement.dto.salary.SalaryRequest;
import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.entity.Salary;
import com.acme.salarymanagement.repository.SalaryRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalaryServiceTest {

    @Mock
    private SalaryRepository salaryRepository;

    @InjectMocks
    private SalaryService salaryService;

    @Test
    void shouldReturnCurrentSalary() {

        Salary salary = createSalary(1L, 1L, "85000.00");

        when(salaryRepository.findByEmployee_IdAndEffectiveToIsNull(1L))
                .thenReturn(Optional.of(salary));

        Salary result = salaryService.getCurrentSalary(1L);

        assertNotNull(result);
        assertEquals(new BigDecimal("85000.00"), result.getBaseSalary());

        verify(salaryRepository).findByEmployee_IdAndEffectiveToIsNull(1L);
    }

    @Test
    void shouldThrowExceptionWhenCurrentSalaryDoesNotExist() {

        when(salaryRepository.findByEmployee_IdAndEffectiveToIsNull(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> salaryService.getCurrentSalary(1L)
        );
    }

    @Test
    void shouldReturnCurrentSalariesForMultipleEmployees() {

        Salary firstSalary = createSalary(1L, 1L, "85000.00");
        Salary secondSalary = createSalary(2L, 2L, "95000.00");

        when(salaryRepository.findCurrentSalariesByEmployeeIds(List.of(1L, 2L)))
                .thenReturn(List.of(firstSalary, secondSalary));

        Map<Long, Salary> result =
                salaryService.getCurrentSalaries(List.of(1L, 2L));

        assertEquals(2, result.size());
        assertEquals(new BigDecimal("85000.00"), result.get(1L).getBaseSalary());
        assertEquals(new BigDecimal("95000.00"), result.get(2L).getBaseSalary());
    }

    @Test
    void shouldCreateInitialSalary() {

        Employee employee = Employee.builder()
                .id(1L)
                .build();

        SalaryRequest request = new SalaryRequest(
                new BigDecimal("85000.00"),
                "INR",
                LocalDate.of(2026, 11, 7)
        );

        when(salaryRepository.save(any(Salary.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Salary result = salaryService.createInitialSalary(employee, request);

        assertEquals(employee, result.getEmployee());
        assertEquals(new BigDecimal("85000.00"), result.getBaseSalary());
        assertEquals("INR", result.getCurrencyCode());
        assertEquals(LocalDate.of(2026, 11, 7), result.getEffectiveFrom());
        assertNull(result.getEffectiveTo());

        verify(salaryRepository).save(any(Salary.class));
    }

    @Test
    void shouldUpdateSalaryAndMaintainSalaryHistory() {

        Salary currentSalary = createSalary(1L, 1L, "85000.00");
        LocalDate newEffectiveDate = LocalDate.of(2026, 12, 1);

        SalaryRequest request = new SalaryRequest(
                new BigDecimal("100000.00"),
                "INR",
                newEffectiveDate
        );

        when(salaryRepository.findByEmployee_IdAndEffectiveToIsNull(1L))
                .thenReturn(Optional.of(currentSalary));

        when(salaryRepository.save(any(Salary.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Salary result = salaryService.updateSalary(1L, request);

        // Previous salary should be closed.
        assertEquals(
                LocalDate.of(2026, 11, 30),
                currentSalary.getEffectiveTo()
        );

        // New salary should be created.
        assertEquals(new BigDecimal("100000.00"), result.getBaseSalary());
        assertEquals("INR", result.getCurrencyCode());
        assertEquals(newEffectiveDate, result.getEffectiveFrom());
        assertNull(result.getEffectiveTo());

        verify(salaryRepository).save(any(Salary.class));
    }

    @Test
    void shouldRejectSalaryUpdateWithInvalidEffectiveDate() {

        Salary currentSalary = createSalary(1L, 1L, "85000.00");

        SalaryRequest request = new SalaryRequest(
                new BigDecimal("100000.00"),
                "INR",
                LocalDate.of(2026, 1, 1)
        );

        when(salaryRepository.findByEmployee_IdAndEffectiveToIsNull(1L))
                .thenReturn(Optional.of(currentSalary));

        assertThrows(
                IllegalArgumentException.class,
                () -> salaryService.updateSalary(1L, request)
        );

        verify(salaryRepository, never()).save(any(Salary.class));
    }

    private Salary createSalary(Long salaryId, Long employeeId, String amount) {

        Employee employee = Employee.builder()
                .id(employeeId)
                .build();

        return Salary.builder()
                .id(salaryId)
                .employee(employee)
                .baseSalary(new BigDecimal(amount))
                .currencyCode("INR")
                .effectiveFrom(LocalDate.of(2026, 11, 7))
                .createdBy("SYSTEM")
                .build();
    }
}