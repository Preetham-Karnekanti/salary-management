
import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Snackbar,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import axios from 'axios';

import EmployeeTable from '@/pages/Employees/components/EmployeeTable';
import EmployeeFilters from '@/pages/Employees/components/EmployeeFilters';
import EmployeeDetailsDialog from '@/pages/Employees/components/EmployeeDetailsDialog';
import EmployeeFormDialog from '@/pages/Employees/components/EmployeeFormDialog';

import { useEmployees } from '@/pages/Employees/hooks/useEmployees';

import {
  getCountries,
  getDepartments,
  type ReferenceOption,
} from '@/api/referenceDataApi';
import { createEmployee } from '@/api/employeeApi';
import type { EmployeeCreateRequest } from '@/types/employee';

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

  // Employee details dialog state
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState<number | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success notification state
  const [successOpen, setSuccessOpen] = useState(false);

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

  // Open employee details
  const handleViewEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setDetailsOpen(true);
  };

  // Close employee details
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedEmployeeId(null);
  };

  // Open employee creation dialog
  const handleOpenCreateDialog = () => {
    setSubmitError(null);
    setCreateDialogOpen(true);
  };

  // Close employee creation dialog
  const handleCloseCreateDialog = () => {
    if (submitting) {
      return;
    }

    setCreateDialogOpen(false);
    setSubmitError(null);
  };

  // Create employee
  const handleCreateEmployee = async (
    request: EmployeeCreateRequest
  ) => {
    try {
      setSubmitting(true);
      setSubmitError(null);

      await createEmployee(request);

      setCreateDialogOpen(false);

      // Refresh the existing employee listing.
      refresh();

      // Display success notification.
      setSuccessOpen(true);
    } catch (error: unknown) {
      let message = 'Failed to create employee. Please try again.';

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message =
          error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
          >
            {totalElements.toLocaleString()} Employees
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreateDialog}
          >
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Reference data error */}
      {referenceDataError && (
        <Alert severity="error">
          Unable to load country and department options:{' '}
          {referenceDataError}
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

      <EmployeeFormDialog
        open={createDialogOpen}
        countries={countries}
        departments={departments}
        submitting={submitting}
        submitError={submitError}
        onClose={handleCloseCreateDialog}
        onSubmit={handleCreateEmployee}
      />

      <Snackbar
        open={successOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') {
            setSuccessOpen(false);
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Employee created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeesPage;
