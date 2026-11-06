package com.acme.salarymanagement.repository;

import com.acme.salarymanagement.entity.Country;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {

    Optional<Country> findByCountryCode(String countryCode);

    boolean existsByCountryCode(String countryCode);
}