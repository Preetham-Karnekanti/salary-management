package com.acme.salarymanagement.repository;

import com.acme.salarymanagement.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findByEmployee_IdAndEffectiveToIsNull(Long employeeId);

    List<Salary> findAllByEmployee_IdOrderByEffectiveFromDesc(Long employeeId);

    boolean existsByEmployee_Id(Long employeeId);
}