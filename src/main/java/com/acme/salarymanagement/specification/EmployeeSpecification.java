
package com.acme.salarymanagement.specification;

import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.enums.EmploymentStatus;

import org.springframework.data.jpa.domain.Specification;

public final class EmployeeSpecification {

    private EmployeeSpecification() {
    }

    public static Specification<Employee> hasEmploymentStatus(
            EmploymentStatus employmentStatus
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("employmentStatus"),
                        employmentStatus
                );
    }

    public static Specification<Employee> belongsToCountry(
            Long countryId
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("country").get("id"),
                        countryId
                );
    }

    public static Specification<Employee> belongsToDepartment(
            Long departmentId
    ) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("department").get("id"),
                        departmentId
                );
    }
}
