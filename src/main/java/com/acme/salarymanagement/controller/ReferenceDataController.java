package com.acme.salarymanagement.controller;

import com.acme.salarymanagement.dto.common.OptionResponse;
import com.acme.salarymanagement.service.ReferenceDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    public ReferenceDataController(
            ReferenceDataService referenceDataService
    ) {
        this.referenceDataService = referenceDataService;
    }

    @GetMapping("/countries")
    public ResponseEntity<List<OptionResponse>> getCountries() {
        return ResponseEntity.ok(
                referenceDataService.getCountries()
        );
    }

    @GetMapping("/departments")
    public ResponseEntity<List<OptionResponse>> getDepartments() {
        return ResponseEntity.ok(
                referenceDataService.getDepartments()
        );
    }
}