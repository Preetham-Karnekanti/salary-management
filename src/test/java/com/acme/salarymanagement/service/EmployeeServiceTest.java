package com.acme.salarymanagement.service;

import com.acme.salarymanagement.common.exception.DuplicateResourceException;
import com.acme.salarymanagement.common.exception.ResourceNotFoundException;
import com.acme.salarymanagement.dto.employee.EmployeeDetailsResponse;
import com.acme.salarymanagement.dto.employee.EmployeeRequest;
import com.acme.salarymanagement.dto.employee.EmployeeResponse;
import com.acme.salarymanagement.dto.salary.SalaryRequest;
import com.acme.salarymanagement.dto.salary.SalaryResponse;
import com.acme.salarymanagement.entity.Country;
import com.acme.salarymanagement.entity.Department;
import com.acme.salarymanagement.entity.Employee;
import com.acme.salarymanagement.entity.Salary;
import com.acme.salarymanagement.enums.EmploymentStatus;
import com.acme.salarymanagement.mapper.EmployeeMapper;
import com.acme.salarymanagement.repository.CountryRepository;
import com.acme.salarymanagement.repository.DepartmentRepository;
import com.acme.salarymanagement.repository.EmployeeRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CountryRepository countryRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private SalaryService salaryService;

    @InjectMocks
    private EmployeeService employeeService;

    @Test
    void shouldCreateEmployeeWithInitialSalary() {

        EmployeeRequest request = createEmployeeRequest(
                createSalaryRequest("85000.00", LocalDate.of(2026, 11, 7))
        );

        Country country = Country.builder().id(1L).name("India").build();
        Department department = Department.builder().id(1L).name("Engineering").build();

        Employee employee = Employee.builder()
                .id(1L)
                .employeeCode("EMP1001")
                .email("rahul.sharma@acme.com")
                .build();

        Salary salary = createSalary(employee, "85000.00");

        EmployeeResponse expectedResponse = createEmployeeResponse();

        when(employeeRepository.findByEmployeeCode("EMP1001"))
                .thenReturn(Optional.empty());
        when(employeeRepository.findByEmail("rahul.sharma@acme.com"))
                .thenReturn(Optional.empty());

        when(countryRepository.findById(1L)).thenReturn(Optional.of(country));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        when(employeeMapper.toEntity(request, country, department))
                .thenReturn(employee);

        when(employeeRepository.save(employee)).thenReturn(employee);

        when(salaryService.createInitialSalary(employee, request.salary()))
                .thenReturn(salary);

        when(employeeMapper.toResponse(employee, salary))
                .thenReturn(expectedResponse);

        EmployeeResponse result = employeeService.createEmployee(request);

        assertSame(expectedResponse, result);

        verify(employeeRepository).save(employee);
        verify(salaryService).createInitialSalary(employee, request.salary());
        verify(employeeMapper).toResponse(employee, salary);
    }

    @Test
    void shouldRejectEmployeeCreationWhenSalaryIsMissing() {

        EmployeeRequest request = createEmployeeRequest(null);

        assertThrows(
                IllegalArgumentException.class,
                () -> employeeService.createEmployee(request)
        );

        verify(employeeRepository, never()).save(any(Employee.class));
        verifyNoInteractions(salaryService);
    }

    @Test
    void shouldReturnEmployeeDetailsWithSalaryHistory() {
        Long employeeId = 1L;

        Employee employee = mock(Employee.class);
        Salary currentSalary = mock(Salary.class);

        SalaryResponse currentSalaryResponse = new SalaryResponse(
                2L,
                new BigDecimal("120000"),
                "INR",
                LocalDate.of(2026, 11, 1),
                null
        );

        SalaryResponse previousSalaryResponse = new SalaryResponse(
                1L,
                new BigDecimal("100000"),
                "INR",
                LocalDate.of(2025, 4, 1),
                LocalDate.of(2026, 10, 31)
        );

        EmployeeResponse employeeResponse = new EmployeeResponse(
                1L,
                "EMP00001",
                "Arjun",
                "Reddy",
                "arjun@acme.com",
                1L,
                "India",
                1L,
                "Engineering",
                "Software Engineer",
                EmploymentStatus.ACTIVE,
                LocalDate.of(2024, 1, 12),
                currentSalaryResponse
        );

        List<SalaryResponse> salaryHistory =
                List.of(currentSalaryResponse, previousSalaryResponse);

        when(employeeRepository.findById(employeeId))
                .thenReturn(Optional.of(employee));

        when(salaryService.getCurrentSalary(employeeId))
                .thenReturn(currentSalary);

        when(employeeMapper.toResponse(employee, currentSalary))
                .thenReturn(employeeResponse);

        when(salaryService.getSalaryHistory(employeeId))
                .thenReturn(salaryHistory);

        EmployeeDetailsResponse result =
                employeeService.getEmployeeById(employeeId);

        assertNotNull(result);
        assertEquals(employeeResponse, result.employee());
        assertEquals(2, result.salaryHistory().size());
        assertEquals(currentSalaryResponse, result.salaryHistory().get(0));
        assertEquals(previousSalaryResponse, result.salaryHistory().get(1));

        verify(employeeRepository).findById(employeeId);
        verify(salaryService).getCurrentSalary(employeeId);
        verify(salaryService).getSalaryHistory(employeeId);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeDoesNotExist() {

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> employeeService.getEmployeeById(1L)
        );

        verifyNoInteractions(salaryService);
    }

    @Test
    void shouldReturnEmployeesWithCurrentSalaries() {

        Pageable pageable = PageRequest.of(0, 10);

        Employee firstEmployee = Employee.builder().id(1L).build();
        Employee secondEmployee = Employee.builder().id(2L).build();

        Page<Employee> employeePage = new PageImpl<>(
                List.of(firstEmployee, secondEmployee),
                pageable,
                2
        );

        Salary firstSalary = createSalary(firstEmployee, "85000.00");
        Salary secondSalary = createSalary(secondEmployee, "95000.00");

        Map<Long, Salary> salaryMap = Map.of(
                1L, firstSalary,
                2L, secondSalary
        );

        EmployeeResponse firstResponse = createEmployeeResponse();
        EmployeeResponse secondResponse = createEmployeeResponse();

        when(employeeRepository.findAll(pageable)).thenReturn(employeePage);

        when(salaryService.getCurrentSalaries(List.of(1L, 2L)))
                .thenReturn(salaryMap);

        when(employeeMapper.toResponse(firstEmployee, firstSalary))
                .thenReturn(firstResponse);

        when(employeeMapper.toResponse(secondEmployee, secondSalary))
                .thenReturn(secondResponse);

        Page<EmployeeResponse> result = employeeService.getAllEmployees(pageable);

        assertEquals(2, result.getTotalElements());
        assertEquals(firstResponse, result.getContent().get(0));
        assertEquals(secondResponse, result.getContent().get(1));

        verify(employeeRepository).findAll(pageable);
        verify(salaryService).getCurrentSalaries(List.of(1L, 2L));
        verify(salaryService, never()).getCurrentSalary(anyLong());
    }

    private EmployeeRequest createEmployeeRequest(SalaryRequest salaryRequest) {

        return new EmployeeRequest(
                "EMP1001",
                "Rahul",
                "Sharma",
                "rahul.sharma@acme.com",
                1L,
                1L,
                "Senior Software Engineer",
                EmploymentStatus.ACTIVE,
                LocalDate.of(2026, 11, 7),
                salaryRequest
        );
    }

    @Test
    void shouldUpdateEmployeeWithoutChangingSalary() {

        EmployeeRequest request = createEmployeeRequest(null);

        Employee employee = Employee.builder()
                .id(1L)
                .employeeCode("EMP1001")
                .email("rahul.sharma@acme.com")
                .build();

        Country country = Country.builder().id(1L).name("India").build();
        Department department = Department.builder().id(1L).name("Engineering").build();

        Salary currentSalary = createSalary(employee, "85000.00");

        EmployeeResponse expectedResponse = createEmployeeResponse();

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.findByEmployeeCode("EMP1001"))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.findByEmail("rahul.sharma@acme.com"))
                .thenReturn(Optional.of(employee));

        when(countryRepository.findById(1L)).thenReturn(Optional.of(country));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        when(employeeRepository.save(employee)).thenReturn(employee);

        when(salaryService.getCurrentSalary(1L)).thenReturn(currentSalary);

        when(employeeMapper.toResponse(employee, currentSalary))
                .thenReturn(expectedResponse);

        employeeMapper.updateEntity(employee, request, country, department);

        EmployeeResponse result = employeeService.updateEmployee(1L, request);

        assertSame(expectedResponse, result);

        verify(employeeRepository).save(employee);
        verify(salaryService).getCurrentSalary(1L);
        verify(salaryService, never()).updateSalary(anyLong(), any());
    }

    @Test
    void shouldUpdateEmployeeAndSalary() {

        SalaryRequest salaryRequest = createSalaryRequest(
                "100000.00",
                LocalDate.of(2026, 12, 1)
        );

        EmployeeRequest request = createEmployeeRequest(salaryRequest);

        Employee employee = Employee.builder()
                .id(1L)
                .employeeCode("EMP1001")
                .email("rahul.sharma@acme.com")
                .build();

        Country country = Country.builder().id(1L).name("India").build();
        Department department = Department.builder().id(1L).name("Engineering").build();

        Salary currentSalary = createSalary(employee, "85000.00");
        Salary updatedSalary = createSalary(employee, "100000.00");

        EmployeeResponse expectedResponse = createEmployeeResponse();

        when(employeeRepository.findById(1L))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.findByEmployeeCode("EMP1001"))
                .thenReturn(Optional.of(employee));

        when(employeeRepository.findByEmail("rahul.sharma@acme.com"))
                .thenReturn(Optional.of(employee));

        when(countryRepository.findById(1L)).thenReturn(Optional.of(country));
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        when(employeeRepository.save(employee)).thenReturn(employee);

        when(salaryService.getCurrentSalary(1L)).thenReturn(currentSalary);

        when(salaryService.hasSalaryChanged(currentSalary, salaryRequest))
                .thenReturn(true);

        when(salaryService.updateSalary(1L, salaryRequest))
                .thenReturn(updatedSalary);

        when(employeeMapper.toResponse(employee, updatedSalary))
                .thenReturn(expectedResponse);

        EmployeeResponse result = employeeService.updateEmployee(1L, request);

        assertSame(expectedResponse, result);

        verify(employeeRepository).save(employee);
        verify(salaryService).updateSalary(1L, salaryRequest);
        verify(employeeMapper).toResponse(employee, updatedSalary);
    }

    @Test
    void shouldThrowExceptionWhenEmployeeCodeAlreadyExists() {
        SalaryRequest salaryRequest = createSalaryRequest(
                "100000.00",
                LocalDate.of(2026, 12, 1)
        );
        EmployeeRequest request = createEmployeeRequest(salaryRequest);

        Employee existingEmployee = Employee.builder()
                .id(2L)
                .employeeCode("EMP1001")
                .build();

        when(employeeRepository.findByEmployeeCode("EMP1001"))
                .thenReturn(Optional.of(existingEmployee));

        assertThrows(
                DuplicateResourceException.class,
                () -> employeeService.createEmployee(request)
        );

        verify(employeeRepository, never()).save(any(Employee.class));
    }

    private SalaryRequest createSalaryRequest(String amount, LocalDate effectiveFrom) {

        return new SalaryRequest(
                new BigDecimal(amount),
                "INR",
                effectiveFrom
        );
    }

    private Salary createSalary(Employee employee, String amount) {

        return Salary.builder()
                .id(1L)
                .employee(employee)
                .baseSalary(new BigDecimal(amount))
                .currencyCode("INR")
                .effectiveFrom(LocalDate.of(2026, 11, 7))
                .createdBy("SYSTEM")
                .build();
    }

    private EmployeeResponse createEmployeeResponse() {

        return new EmployeeResponse(
                1L,
                "EMP1001",
                "Rahul",
                "Sharma",
                "rahul.sharma@acme.com",
                1L,
                "India",
                1L,
                "Engineering",
                "Senior Software Engineer",
                EmploymentStatus.ACTIVE,
                LocalDate.of(2026, 11, 7),
                new SalaryResponse(
                        1L,
                        new BigDecimal("85000.00"),
                        "INR",
                        LocalDate.of(2026, 11, 7),
                        null
                )
        );
    }
}