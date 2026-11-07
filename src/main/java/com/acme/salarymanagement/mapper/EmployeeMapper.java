package com.acme.salarymanagement.mapper;

import com.acme.salarymanagement.dto.employee.EmployeeRequest;
import com.acme.salarymanagement.dto.employee.EmployeeResponse;
import com.acme.salarymanagement.entity.Country;
import com.acme.salarymanagement.entity.Department;
import com.acme.salarymanagement.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public Employee toEntity(
            EmployeeRequest request,
            Country country,
            Department department
    ) {
        return Employee.builder()
                .employeeCode(request.employeeCode())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .country(country)
                .department(department)
                .jobTitle(request.jobTitle())
                .employmentStatus(request.employmentStatus())
                .hireDate(request.hireDate())
                .build();
    }

    public EmployeeResponse toResponse(Employee employee) {
        return new EmployeeResponse(
                employee.getId(),
                employee.getEmployeeCode(),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getCountry().getId(),
                employee.getCountry().getName(),
                employee.getDepartment().getId(),
                employee.getDepartment().getName(),
                employee.getJobTitle(),
                employee.getEmploymentStatus(),
                employee.getHireDate()
        );
    }

    public void updateEntity(
            Employee employee,
            EmployeeRequest request,
            Country country,
            Department department
    ) {
        employee.setEmployeeCode(request.employeeCode());
        employee.setFirstName(request.firstName());
        employee.setLastName(request.lastName());
        employee.setEmail(request.email());
        employee.setCountry(country);
        employee.setDepartment(department);
        employee.setJobTitle(request.jobTitle());
        employee.setEmploymentStatus(request.employmentStatus());
        employee.setHireDate(request.hireDate());
    }
}