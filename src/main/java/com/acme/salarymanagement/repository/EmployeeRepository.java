package com.acme.salarymanagement.repository;

import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.enums.EmploymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmail(String email);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmail(String email);

    long countByEmploymentStatus(EmploymentStatus employmentStatus);
}