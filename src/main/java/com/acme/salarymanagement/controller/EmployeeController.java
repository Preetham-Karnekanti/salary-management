package com.acme.salarymanagement.controller;

import com.acme.salarymanagement.dto.employee.EmployeeDetailsResponse;
import com.acme.salarymanagement.dto.employee.EmployeeRequest;
import com.acme.salarymanagement.dto.employee.EmployeeResponse;
import com.acme.salarymanagement.dto.employee.EmployeeSearchRequest;
import com.acme.salarymanagement.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse response = employeeService.createEmployee(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{employeeId}")
    public ResponseEntity<EmployeeDetailsResponse> getEmployeeById(
            @PathVariable Long employeeId) {
        EmployeeDetailsResponse response = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<EmployeeResponse>> getAllEmployees(
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {

        Page<EmployeeResponse> response = employeeService.getAllEmployees(pageable);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/search")
    public ResponseEntity<Page<EmployeeResponse>> searchEmployees(@Valid @RequestBody EmployeeSearchRequest searchRequest) {
        return ResponseEntity.ok(
                employeeService.searchEmployees(searchRequest)
        );
    }

    @PutMapping("/{employeeId}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long employeeId,
            @Valid @RequestBody EmployeeRequest request) {

        EmployeeResponse response = employeeService.updateEmployee(employeeId, request);

        return ResponseEntity.ok(response);
    }
}