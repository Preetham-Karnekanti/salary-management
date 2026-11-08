
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import MainLayout from '@/components/layout/MainLayout';
import EmployeesPage from '@/pages/Employees/EmployeesPage';

function SalaryManagementPage() {
  return (
    <Typography variant="h5">
      Salary Management
    </Typography>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/employees" replace />,
      },
      {
        path: 'employees',
        element: <EmployeesPage />,
        handle: {
          title: 'Employees',
        },
      },
      {
        path: 'salary-management',
        element: <SalaryManagementPage />,
        handle: {
          title: 'Salary Management',
        },
      },
    ],
  },
]);

export default router;
