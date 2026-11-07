package com.acme.salarymanagement.mapper;

import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.entity.Salary;
import org.springframework.stereotype.Component;

@Component
public class SalaryMapper {

    public SalaryResponse toResponse(Salary salary) {
        if (salary == null) {
            return null;
        }

        return new SalaryResponse(
                salary.getId(),
                salary.getBaseSalary(),
                salary.getCurrencyCode(),
                salary.getEffectiveFrom()
        );
    }
}