
import {
  Box,
  CircularProgress,
  Typography,
  Button,
} from '@mui/material';

import { useEmployees } from '@/pages/Employees/hooks/useEmployees';

function EmployeesPage() {
  const {
    employees,
    loading,
    error,
    totalElements,
    page,
    totalPages,
    goToPage,
  } = useEmployees();

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Employee Management
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Manage your organization's employees.
      </Typography>

      <Typography mb={2}>
        Total employees: {totalElements}
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Typography color="error">
          {error}
        </Typography>
      )}

      {!loading && !error && employees.map((employee) => (
        <Box key={employee.id} sx={{ mb: 2 }}>
          <Typography fontWeight={600}>
            {employee.firstName} {employee.lastName}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {employee.employeeCode} · {employee.email}
          </Typography>
        </Box>
      ))}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          disabled={page === 0 || loading}
          onClick={() => goToPage(page - 1)}
        >
          Previous
        </Button>

        <Typography>
          Page {page + 1} of {totalPages}
        </Typography>

        <Button
          variant="outlined"
          disabled={page >= totalPages - 1 || loading}
          onClick={() => goToPage(page + 1)}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default EmployeesPage;
