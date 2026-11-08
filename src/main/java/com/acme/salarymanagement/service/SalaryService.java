package com.acme.salarymanagement.service;

import com.acme.salarymanagement.common.exception.ResourceNotFoundException;
import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.entity.Salary;
import com.acme.salarymanagement.mapper.SalaryMapper;
import com.acme.salarymanagement.repository.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.acme.salarymanagement.dto.salary.SalaryRequest;
import com.acme.salarymanagement.entity.Employee;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class SalaryService {

    private final SalaryRepository salaryRepository;
    private final SalaryMapper salaryMapper;

    public SalaryService(SalaryRepository salaryRepository, SalaryMapper salaryMapper) {
        this.salaryRepository = salaryRepository;
        this.salaryMapper = salaryMapper;
    }

    public Salary getCurrentSalary(Long employeeId) {
        return salaryRepository.findByEmployee_IdAndEffectiveToIsNull(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Current salary not found"));
    }

    public Map<Long, Salary> getCurrentSalaries(List<Long> employeeIds) {

        return salaryRepository.findCurrentSalariesByEmployeeIds(employeeIds)
                .stream()
                .collect(Collectors.toMap(
                        salary -> salary.getEmployee().getId(),
                        Function.identity()
                ));
    }

    public Salary createInitialSalary(Employee employee, SalaryRequest request) {

        Salary salary = Salary.builder()
                .employee(employee)
                .baseSalary(request.baseSalary())
                .currencyCode(request.currencyCode())
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(null)
                .createdBy("SYSTEM")
                .build();

        return salaryRepository.save(salary);
    }

    public Salary updateSalary(Long employeeId, SalaryRequest request) {

        Salary currentSalary = getCurrentSalary(employeeId);

        if (!request.effectiveFrom().isAfter(currentSalary.getEffectiveFrom())) {
            throw new IllegalArgumentException(
                    "New salary effective date must be after current salary effective date"
            );
        }

        currentSalary.setEffectiveTo(request.effectiveFrom().minusDays(1));

        Salary newSalary = Salary.builder()
                .employee(currentSalary.getEmployee())
                .baseSalary(request.baseSalary())
                .currencyCode(request.currencyCode())
                .effectiveFrom(request.effectiveFrom())
                .effectiveTo(null)
                .createdBy("SYSTEM")
                .build();

        return salaryRepository.save(newSalary);
    }

    @Transactional(readOnly = true)
    public List<SalaryResponse> getSalaryHistory(Long employeeId) {
        return salaryRepository
                .findAllByEmployee_IdOrderByEffectiveFromDesc(employeeId)
                .stream()
                .map(salaryMapper::toResponse)
                .toList();
    }

    public boolean hasSalaryChanged(Salary currentSalary, SalaryRequest request) {

        return currentSalary.getBaseSalary().compareTo(request.baseSalary()) != 0
                || !currentSalary.getCurrencyCode().equals(request.currencyCode())
                || !currentSalary.getEffectiveFrom().equals(request.effectiveFrom());
    }
}