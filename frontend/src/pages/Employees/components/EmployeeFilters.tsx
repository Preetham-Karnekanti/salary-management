
import { useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';

import type { EmploymentStatus } from '@/types/employee';
import type { ReferenceOption } from '@/api/referenceDataApi';

export interface EmployeeFilterValues {
  employmentStatus?: EmploymentStatus;
  countryId?: number;
  departmentId?: number;
}

interface EmployeeFiltersProps {
  countries: ReferenceOption[];
  departments: ReferenceOption[];
  onApply: (filters: EmployeeFilterValues) => void;
}

function EmployeeFilters({
  countries,
  departments,
  onApply,
}: EmployeeFiltersProps) {
  const [employmentStatus, setEmploymentStatus] =
    useState<EmploymentStatus | ''>('');

  const [countryId, setCountryId] = useState<number | ''>('');

  const [departmentId, setDepartmentId] = useState<number | ''>('');

  const handleApply = () => {
    onApply({
      ...(employmentStatus && { employmentStatus }),
      ...(countryId !== '' && { countryId }),
      ...(departmentId !== '' && { departmentId }),
    });
  };

  const handleReset = () => {
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
          Filters
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Narrow down employees using the available criteria.
        </Typography>
      </Box>

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
          <InputLabel id="country-label">
            Country
          </InputLabel>

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
          <InputLabel id="department-label">
            Department
          </InputLabel>

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
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: { xs: 'stretch', lg: 'flex-end' },
          }}
        >
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
