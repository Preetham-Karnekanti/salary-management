
import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import type { EmploymentStatus } from '@/types/employee';
import type { ReferenceOption } from '@/api/referenceDataApi';
import type { EmployeeSearchFilters } from '@/api/employeeApi';

interface EmployeeFiltersProps {
  countries: ReferenceOption[];
  departments: ReferenceOption[];
  onApply: (filters: EmployeeSearchFilters) => void;
}

function EmployeeFilters({
  countries,
  departments,
  onApply,
}: EmployeeFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const [employmentStatus, setEmploymentStatus] =
    useState<EmploymentStatus | ''>('');

  const [countryId, setCountryId] = useState<number | ''>('');

  const [departmentId, setDepartmentId] = useState<number | ''>('');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Keep the latest dropdown selections available to the debounce callback.
  const selectedFiltersRef = useRef({
    employmentStatus,
    countryId,
    departmentId,
  });

  selectedFiltersRef.current = {
    employmentStatus,
    countryId,
    departmentId,
  };

  // Keep the latest callback without restarting the debounce timer.
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;

  const buildFilters = (term: string): EmployeeSearchFilters => {
    const selectedFilters = selectedFiltersRef.current;

    const filters: EmployeeSearchFilters = {};

    if (term.trim()) {
      filters.searchTerm = term.trim();
    }

    if (selectedFilters.employmentStatus) {
      filters.employmentStatus = selectedFilters.employmentStatus;
    }

    if (selectedFilters.countryId !== '') {
      filters.countryId = selectedFilters.countryId;
    }

    if (selectedFilters.departmentId !== '') {
      filters.departmentId = selectedFilters.departmentId;
    }

    return filters;
  };

  // Clean up any pending timer when the component unmounts.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);

    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onApplyRef.current(buildFilters(value));
      debounceTimerRef.current = null;
    }, 400);
  };

  const handleApply = () => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    onApply(buildFilters(searchTerm));
  };

  const handleReset = () => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setSearchTerm('');
    setEmploymentStatus('');
    setCountryId('');
    setDepartmentId('');

    onApply({});
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          Search and Filters
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Search by name, employee code or email and refine your results.
        </Typography>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        label="Search employees"
        placeholder="Enter name, employee code or email"
        value={searchTerm}
        onChange={(event) => handleSearchChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleApply();
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Filters */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
          alignItems: 'center',
        }}
      >
        {/* Employment Status */}
        <FormControl fullWidth size="small">
          <InputLabel id="employment-status-label">
            Employment Status
          </InputLabel>

          <Select
            labelId="employment-status-label"
            value={employmentStatus}
            label="Employment Status"
            onChange={(event) =>
              setEmploymentStatus(
                event.target.value as EmploymentStatus | ''
              )
            }
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INACTIVE">Inactive</MenuItem>
          </Select>
        </FormControl>

        {/* Country */}
        <FormControl fullWidth size="small">
          <InputLabel id="country-label">Country</InputLabel>

          <Select
            labelId="country-label"
            value={countryId}
            label="Country"
            onChange={(event) =>
              setCountryId(
                event.target.value === ''
                  ? ''
                  : Number(event.target.value)
              )
            }
          >
            <MenuItem value="">All countries</MenuItem>

            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Department */}
        <FormControl fullWidth size="small">
          <InputLabel id="department-label">Department</InputLabel>

          <Select
            labelId="department-label"
            value={departmentId}
            label="Department"
            onChange={(event) =>
              setDepartmentId(
                event.target.value === ''
                  ? ''
                  : Number(event.target.value)
              )
            }
          >
            <MenuItem value="">All departments</MenuItem>

            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={handleApply}
            sx={{ flex: 1 }}
          >
            Apply
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            onClick={handleReset}
            sx={{ flex: 1 }}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default EmployeeFilters;
