import { useEffect, useState } from 'react';

import type { Employee, EmployeeCreateRequest } from '@/types/employee';

import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

import axios from 'axios';

import EmployeeTable from '@/pages/Employees/components/EmployeeTable';
import EmployeeFilters from '@/pages/Employees/components/EmployeeFilters';
import EmployeeDetailsDialog from '@/pages/Employees/components/EmployeeDetailsDialog';
import EmployeeFormDialog from '@/pages/Employees/components/EmployeeFormDialog';

import { useEmployees } from '@/pages/Employees/hooks/useEmployees';

import { getCountries, getDepartments, type ReferenceOption } from '@/api/referenceDataApi';

import { createEmployee, updateEmployee } from '@/api/employeeApi';

type EmployeeFormMode = 'create' | 'edit';

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

  const [referenceDataError, setReferenceDataError] = useState<string | null>(null);

  // Employee details dialog state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [isEmployeeDetailsDialogOpen, setIsEmployeeDetailsDialogOpen] = useState(false);

  // Employee form dialog state
  const [employeeFormMode, setEmployeeFormMode] = useState<EmployeeFormMode>('create');

  const [employeeBeingEdited, setEmployeeBeingEdited] = useState<Employee | null>(null);

  const [isEmployeeFormDialogOpen, setIsEmployeeFormDialogOpen] = useState(false);

  const [isSavingEmployee, setIsSavingEmployee] = useState(false);

  const [employeeFormError, setEmployeeFormError] = useState<string | null>(null);

  // Success notification state
  const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');

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

        setReferenceDataError(error instanceof Error ? error.message : 'Failed to load filter options');
      }
    };

    fetchReferenceData();

    return () => {
      controller.abort();
    };
  }, []);

  // View employee
  const onViewEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsEmployeeDetailsDialogOpen(true);
  };

  const onCloseEmployeeDetailsDialog = () => {
    setIsEmployeeDetailsDialogOpen(false);
    setSelectedEmployeeId(null);
  };

  // Add employee
  const onClickAddEmployee = () => {
    setEmployeeFormMode('create');
    setEmployeeBeingEdited(null);
    setEmployeeFormError(null);
    setIsEmployeeFormDialogOpen(true);
  };

  // Edit employee
  const onClickEditEmployee = (employee: Employee) => {
    setEmployeeFormMode('edit');
    setEmployeeBeingEdited(employee);
    setEmployeeFormError(null);
    setIsEmployeeFormDialogOpen(true);
  };

  // Close employee form
  const onCloseEmployeeFormDialog = () => {
    if (isSavingEmployee) {
      return;
    }

    setIsEmployeeFormDialogOpen(false);
    setEmployeeBeingEdited(null);
    setEmployeeFormError(null);
  };

  // Create or update employee
  const onSubmitEmployee = async (request: EmployeeCreateRequest) => {
    try {
      setIsSavingEmployee(true);
      setEmployeeFormError(null);

      if (employeeFormMode === 'create') {
        await createEmployee(request);
        setSuccessMessage('Employee created successfully!');
      } else {
        if (!employeeBeingEdited) {
          throw new Error('No employee selected for editing.');
        }

        await updateEmployee(employeeBeingEdited.id, request);
        setSuccessMessage('Employee updated successfully!');
      }

      setIsEmployeeFormDialogOpen(false);
      setEmployeeBeingEdited(null);

      // Refresh the current employee listing.
      refresh();

      setIsSuccessSnackbarOpen(true);
    } catch (error: unknown) {
      let message = `Failed to ${employeeFormMode === 'create' ? 'create' : 'update'} employee. Please try again.`;

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      setEmployeeFormError(message);
    } finally {
      setIsSavingEmployee(false);
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
      }}>
      {/* Page heading */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexWrap: 'wrap',
          gap: 2,
        }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
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
          }}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {totalElements.toLocaleString()} Employees
          </Typography>

          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onClickAddEmployee}>
            Add Employee
          </Button>
        </Box>
      </Box>

      {/* Reference data error */}
      {referenceDataError && (
        <Alert severity="error">Unable to load country and department options: {referenceDataError}</Alert>
      )}

      {/* Employee filters */}
      <EmployeeFilters countries={countries} departments={departments} onApply={applyFilters} />

      {/* Employee API error */}
      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refresh}>
              Retry
            </Button>
          }>
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
        onEditEmployee={onClickEditEmployee}
      />

      {/* Employee details dialog */}
      <EmployeeDetailsDialog
        open={isEmployeeDetailsDialogOpen}
        employeeId={selectedEmployeeId}
        onClose={onCloseEmployeeDetailsDialog}
      />

      {/* Shared create/edit employee dialog */}
      <EmployeeFormDialog
        open={isEmployeeFormDialogOpen}
        mode={employeeFormMode}
        employee={employeeBeingEdited}
        countries={countries}
        departments={departments}
        submitting={isSavingEmployee}
        submitError={employeeFormError}
        onClose={onCloseEmployeeFormDialog}
        onSubmit={onSubmitEmployee}
      />

      {/* Success notification */}
      <Snackbar
        open={isSuccessSnackbarOpen}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') {
            setIsSuccessSnackbarOpen(false);
          }
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}>
        <Alert
          onClose={() => setIsSuccessSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default EmployeesPage;
