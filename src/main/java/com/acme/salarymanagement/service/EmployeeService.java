package com.acme.salarymanagement.service;

import com.acme.salarymanagement.common.exception.DuplicateResourceException;
import com.acme.salarymanagement.common.exception.ResourceNotFoundException;
import com.acme.salarymanagement.dto.employee.EmployeeRequest;
import com.acme.salarymanagement.dto.employee.EmployeeResponse;
import com.acme.salarymanagement.entity.Country;
import com.acme.salarymanagement.entity.Department;
import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.mapper.EmployeeMapper;
import com.acme.salarymanagement.repository.CountryRepository;
import com.acme.salarymanagement.repository.DepartmentRepository;
import com.acme.salarymanagement.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final CountryRepository countryRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeMapper employeeMapper;

    public EmployeeResponse createEmployee(EmployeeRequest request) {

        validateUniqueFields(request, null);

        Country country = countryRepository.findById(request.countryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found"));

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        Employee employee = employeeMapper.toEntity(request, country, department);

        Employee savedEmployee = employeeRepository.save(employee);

        return employeeMapper.toResponse(savedEmployee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return employeeMapper.toResponse(employee);
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> getAllEmployees(Pageable pageable) {

        return employeeRepository.findAll(pageable)
                .map(employeeMapper::toResponse);
    }

    public EmployeeResponse updateEmployee(Long employeeId, EmployeeRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        validateUniqueFields(request, employeeId);

        Country country = countryRepository.findById(request.countryId())
                .orElseThrow(() -> new ResourceNotFoundException("Country not found"));

        Department department = departmentRepository.findById(request.departmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        employeeMapper.updateEntity(employee, request, country, department);

        Employee updatedEmployee = employeeRepository.save(employee);

        return employeeMapper.toResponse(updatedEmployee);
    }

    private void validateUniqueFields(EmployeeRequest request, Long employeeId) {

        employeeRepository.findByEmployeeCode(request.employeeCode())
                .filter(existing -> !existing.getId().equals(employeeId))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Employee code already exists");
                });

        employeeRepository.findByEmail(request.email())
                .filter(existing -> !existing.getId().equals(employeeId))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Email already exists");
                });
    }
}