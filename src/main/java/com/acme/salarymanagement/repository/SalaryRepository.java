package com.acme.salarymanagement.repository;

import com.acme.salarymanagement.entity.Salary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SalaryRepository extends JpaRepository<Salary, Long> {

    Optional<Salary> findByEmployee_IdAndEffectiveToIsNull(Long employeeId);

    List<Salary> findAllByEmployee_IdOrderByEffectiveFromDesc(Long employeeId);

    boolean existsByEmployee_Id(Long employeeId);

    @Query("""
    SELECT s
    FROM Salary s
    WHERE s.employee.id IN :employeeIds
      AND s.effectiveTo IS NULL
    """)
    List<Salary> findCurrentSalariesByEmployeeIds(
            @Param("employeeIds") List<Long> employeeIds
    );
}