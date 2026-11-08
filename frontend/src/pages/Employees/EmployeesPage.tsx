
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

  const [isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen] =
    useState(false);

  // Employee creation dialog state
  const [isCreateEmployeeDialogOpen, setIsCreateEmployeeDialogOpen] =
    useState(false);

  const [isCreatingEmployee, setIsCreatingEmployee] =
    useState(false);

  const [createEmployeeError, setCreateEmployeeError] =
    useState<string | null>(null);

  // Success notification state
  const [isCreateSuccessSnackbarOpen, setIsCreateSuccessSnackbarOpen] =
    useState(false);

  // Load reference data
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

  // Employee details dialog
  const onViewEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsEmployeeDetailsDialogOpen(true);
  };

  const onCloseEmployeeDetailsDialog = () => {
    setIsEmployeeDetailsDialogOpen(false);
    setSelectedEmployeeId(null);
  };

  // Employee creation dialog
  const onClickAddEmployee = () => {
    setCreateEmployeeError(null);
    setIsCreateEmployeeDialogOpen(true);
  };

  const onCloseCreateEmployeeDialog = () => {
    if (isCreatingEmployee) {
      return;
    }

    setIsCreateEmployeeDialogOpen(false);
    setCreateEmployeeError(null);
  };

  // Create employee
  const onSubmitCreateEmployee = async (
    request: EmployeeCreateRequest
  ) => {
    try {
      setIsCreatingEmployee(true);
      setCreateEmployeeError(null);

      await createEmployee(request);

      setIsCreateEmployeeDialogOpen(false);

      // Refresh employee listing.
      refresh();

      // Display success notification.
      setIsCreateSuccessSnackbarOpen(true);
    } catch (error: unknown) {
      let message = 'Failed to create employee. Please try again.';

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message =
          error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setCreateEmployeeError(message);
    } finally {
      setIsCreatingEmployee(false);
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
            onClick={onClickAddEmployee}
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
        onViewEmployee={onViewEmployee}
      />

      {/* Employee details dialog */}
      <EmployeeDetailsDialog
        open={isEmployeeDetailsDialogOpen}
        employeeId={selectedEmployeeId}
        onClose={onCloseEmployeeDetailsDialog}
      />

      {/* Employee creation dialog */}
      <EmployeeFormDialog
        open={isCreateEmployeeDialogOpen}
        countries={countries}
        departments={departments}
        submitting={isCreatingEmployee}
        submitError={createEmployeeError}
        onClose={onCloseCreateEmployeeDialog}
        onSubmit={onSubmitCreateEmployee}
      />

      {/* Success notification */}
      <Snackbar
        open={isCreateSuccessSnackbarOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') {
            setIsCreateSuccessSnackbarOpen(false);
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={() => setIsCreateSuccessSnackbarOpen(false)}
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
