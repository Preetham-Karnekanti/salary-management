
package com.acme.salarymanagement.specification;

import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.enums.EmploymentStatus;

import jakarta.persistence.criteria.Expression;
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


    public static Specification<Employee> hasFirstNameContaining(String firstName) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("firstName")),
                        "%" + firstName.toLowerCase() + "%"
                );
    }

    public static Specification<Employee> hasLastNameContaining(String lastName) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("lastName")),
                        "%" + lastName.toLowerCase() + "%"
                );
    }

    public static Specification<Employee> hasFullNameContaining(String fullName) {
        return (root, query, criteriaBuilder) -> {

            Expression<String> employeeFullName = criteriaBuilder.concat(
                    criteriaBuilder.concat(
                            criteriaBuilder.lower(root.<String>get("firstName")),
                            " "
                    ),
                    criteriaBuilder.lower(root.<String>get("lastName"))
            );

            return criteriaBuilder.like(
                    employeeFullName,
                    "%" + fullName.toLowerCase() + "%"
            );
        };
    }

    public static Specification<Employee> hasEmployeeCodeContaining(String employeeCode) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("employeeCode")),
                        "%" + employeeCode.toLowerCase() + "%"
                );
    }

    public static Specification<Employee> hasEmailContaining(String email) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.like(
                        criteriaBuilder.lower(root.<String>get("email")),
                        "%" + email.toLowerCase() + "%"
                );
    }

}
