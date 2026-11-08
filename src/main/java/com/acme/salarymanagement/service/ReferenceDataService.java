package com.acme.salarymanagement.service;

import com.acme.salarymanagement.dto.common.OptionResponse;
import com.acme.salarymanagement.repository.CountryRepository;
import com.acme.salarymanagement.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReferenceDataService {

    private final CountryRepository countryRepository;
    private final DepartmentRepository departmentRepository;

    public ReferenceDataService(CountryRepository countryRepository, DepartmentRepository departmentRepository) {
        this.countryRepository = countryRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<OptionResponse> getCountries() {
        return countryRepository.findAll(
                        Sort.by(Sort.Direction.ASC, "name")
                )
                .stream()
                .map(country -> new OptionResponse(
                        country.getId(),
                        country.getName()
                ))
                .toList();
    }

    public List<OptionResponse> getDepartments() {
        return departmentRepository.findAll(
                        Sort.by(Sort.Direction.ASC, "name")
                )
                .stream()
                .map(department -> new OptionResponse(
                        department.getId(),
                        department.getName()
                ))
                .toList();
    }
}