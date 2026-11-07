package com.acme.salarymanagement.mapper;

import com.acme.salarymanagement.dto.employee.EmployeeRequest;
import com.acme.salarymanagement.dto.employee.EmployeeResponse;
import com.acme.salarymanagement.dto.salary.SalaryRequest;
import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.entity.Country;
import com.acme.salarymanagement.entity.Department;
import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.entity.Salary;
import com.acme.salarymanagement.enums.EmploymentStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class EmployeeMapperTest {

    private EmployeeMapper employeeMapper;

    @BeforeEach
    void setUp() {
        SalaryMapper salaryMapper = new SalaryMapper();
        employeeMapper = new EmployeeMapper(salaryMapper);
    }

    @Test
    void shouldMapEmployeeRequestToEntity() {
        EmployeeRequest request = createEmployeeRequest(null);

        Country country = Country.builder()
                .id(1L)
                .countryCode("IN")
                .name("India")
                .defaultCurrencyCode("INR")
                .build();

        Department department = Department.builder()
                .id(1L)
                .name("Engineering")
                .build();

        Employee employee = employeeMapper.toEntity(request, country, department);

        assertEquals("EMP001", employee.getEmployeeCode());
        assertEquals("John", employee.getFirstName());
        assertEquals("Doe", employee.getLastName());
        assertEquals("john@example.com", employee.getEmail());
        assertEquals(country, employee.getCountry());
        assertEquals(department, employee.getDepartment());
        assertEquals("Software Engineer", employee.getJobTitle());
        assertEquals(EmploymentStatus.ACTIVE, employee.getEmploymentStatus());
        assertEquals(LocalDate.of(2024, 1, 15), employee.getHireDate());
    }

    @Test
    void shouldMapEmployeeAndSalaryToResponse() {
        Employee employee = createEmployee();

        Salary salary = createSalary(employee);

        EmployeeResponse response = employeeMapper.toResponse(employee, salary);

        assertEquals(1L, response.id());
        assertEquals("EMP001", response.employeeCode());
        assertEquals("John", response.firstName());
        assertEquals("Doe", response.lastName());
        assertEquals("john@example.com", response.email());

        assertEquals(1L, response.countryId());
        assertEquals("India", response.countryName());

        assertEquals(1L, response.departmentId());
        assertEquals("Engineering", response.departmentName());

        assertEquals("Software Engineer", response.jobTitle());
        assertEquals(EmploymentStatus.ACTIVE, response.employmentStatus());

        assertNotNull(response.currentSalary());
        assertEquals(1L, response.currentSalary().id());
        assertEquals(new BigDecimal("85000.00"), response.currentSalary().baseSalary());
        assertEquals("INR", response.currentSalary().currencyCode());
    }

    @Test
    void shouldReturnNullCurrentSalaryWhenSalaryIsNull() {
        Employee employee = createEmployee();

        EmployeeResponse response = employeeMapper.toResponse(employee, null);

        assertNotNull(response);
        assertNull(response.currentSalary());
    }

    @Test
    void shouldUpdateEmployeeEntityFromRequest() {
        Employee employee = createEmployee();

        EmployeeRequest request = new EmployeeRequest(
                "EMP001",
                "John",
                "Doe",
                "john@example.com",
                2L,
                2L,
                "Senior Software Engineer",
                EmploymentStatus.ACTIVE,
                LocalDate.of(2024, 1, 15),
                null
        );

        Country updatedCountry = Country.builder()
                .id(2L)
                .countryCode("US")
                .name("United States")
                .defaultCurrencyCode("USD")
                .build();

        Department updatedDepartment = Department.builder()
                .id(2L)
                .name("Product")
                .build();

        employeeMapper.updateEntity(
                employee,
                request,
                updatedCountry,
                updatedDepartment
        );

        assertEquals("Senior Software Engineer", employee.getJobTitle());
        assertEquals(updatedCountry, employee.getCountry());
        assertEquals(updatedDepartment, employee.getDepartment());

        // Fields not changed by the request remain unchanged.
        assertEquals("EMP001", employee.getEmployeeCode());
        assertEquals("john@example.com", employee.getEmail());
    }

    private EmployeeRequest createEmployeeRequest(SalaryRequest salary) {
        return new EmployeeRequest(
                "EMP001",
                "John",
                "Doe",
                "john@example.com",
                1L,
                1L,
                "Software Engineer",
                EmploymentStatus.ACTIVE,
                LocalDate.of(2024, 1, 15),
                salary
        );
    }

    private Employee createEmployee() {
        Country country = Country.builder()
                .id(1L)
                .countryCode("IN")
                .name("India")
                .defaultCurrencyCode("INR")
                .build();

        Department department = Department.builder()
                .id(1L)
                .name("Engineering")
                .build();

        return Employee.builder()
                .id(1L)
                .employeeCode("EMP001")
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .country(country)
                .department(department)
                .jobTitle("Software Engineer")
                .employmentStatus(EmploymentStatus.ACTIVE)
                .hireDate(LocalDate.of(2024, 1, 15))
                .build();
    }

    private Salary createSalary(Employee employee) {
        return Salary.builder()
                .id(1L)
                .employee(employee)
                .baseSalary(new BigDecimal("85000.00"))
                .currencyCode("INR")
                .effectiveFrom(LocalDate.of(2026, 11, 7))
                .createdBy("SYSTEM")
                .build();
    }
}