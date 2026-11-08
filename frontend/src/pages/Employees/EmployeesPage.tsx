
import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Typography,
} from '@mui/material';

import EmployeeTable from '@/pages/Employees/components/EmployeeTable';
import EmployeeFilters from '@/pages/Employees/components/EmployeeFilters';
import EmployeeDetailsDialog from '@/pages/Employees/components/EmployeeDetailsDialog';

import { useEmployees } from '@/pages/Employees/hooks/useEmployees';

import {
  getCountries,
  getDepartments,
  type ReferenceOption,
} from '@/api/referenceDataApi';

function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    page,
    pageSize,
    totalElements,
    sort,
    goToPage,
    changePageSize,
    changeSort,
    applyFilters,
    refresh,
  } = useEmployees();

  const [countries, setCountries] = useState<ReferenceOption[]>([]);
  const [departments, setDepartments] = useState<ReferenceOption[]>([]);

  const [referenceDataError, setReferenceDataError] =
    useState<string | null>(null);

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<number | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  // Load reference data for the filters.
  useEffect(() => {
    const controller = new AbortController();

    const fetchReferenceData = async () => {
      try {
        setReferenceDataError(null);

        const [countryOptions, departmentOptions] = await Promise.all([
          getCountries(controller.signal),
          getDepartments(controller.signal),
        ]);

        setCountries(countryOptions);
        setDepartments(departmentOptions);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setReferenceDataError(
          error instanceof Error
            ? error.message
            : 'Failed to load filter options'
        );
      }
    };

    fetchReferenceData();

    return () => {
      controller.abort();
    };
  }, []);

  const handleViewEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEmployeeId(null);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* Page heading */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 0.5 }}
          >
            Employee Management
          </Typography>

          <Typography variant="body2" color="text.secondary">
            View and manage employees across your organization.
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
          }}
        >
          {totalElements.toLocaleString()} Employees
        </Typography>
      </Box>

      {/* Reference data error */}
      {referenceDataError && (
        <Alert severity="error">
          Unable to load country and department options: {referenceDataError}
        </Alert>
      )}

      {/* Employee filters */}
      <EmployeeFilters
        countries={countries}
        departments={departments}
        onApply={applyFilters}
      />

      {/* Employee API error */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={refresh}
            >
              Retry
            </Button>
          }
        >
          Failed to load employees: {error}
        </Alert>
      )}

      {/* Employee table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalElements={totalElements}
        sort={sort}
        onPageChange={goToPage}
        onPageSizeChange={changePageSize}
        onSortChange={changeSort}
        onViewEmployee={handleViewEmployee}
      />

      {/* Employee details dialog */}
      <EmployeeDetailsDialog
        open={detailsOpen}
        employeeId={selectedEmployeeId}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}

export default EmployeesPage;
