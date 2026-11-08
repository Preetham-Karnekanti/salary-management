
import {
    Box,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography,
} from '@mui/material';
import {
    IconButton,
    Tooltip,
} from '@mui/material';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import type { Employee } from '@/types/employee';

type SortDirection = 'asc' | 'desc';

type SortField =
    | 'firstName'
    | 'employeeCode'
    | 'email'
    | 'jobTitle'
    | 'employmentStatus';

interface EmployeeTableProps {
    employees: Employee[];
    loading: boolean;
    page: number;
    pageSize: number;
    totalElements: number;
    sort: string;
    onViewEmployee: (employeeId: number) => void;

    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newPageSize: number) => void;
    onSortChange: (field: string, direction: SortDirection) => void;
}

function EmployeeTable({
    employees,
    loading,
    page,
    pageSize,
    totalElements,
    sort,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onViewEmployee
}: EmployeeTableProps) {
    const [sortField, sortDirectionValue] = sort.split(',');

    const sortDirection: SortDirection =
        sortDirectionValue === 'desc' ? 'desc' : 'asc';

    const handleSort = (field: SortField) => {
        const nextDirection: SortDirection =
            sortField === field && sortDirection === 'asc'
                ? 'desc'
                : 'asc';

        onSortChange(field, nextDirection);
    };

    const renderSortLabel = (label: string, field: SortField) => (
        <TableSortLabel
            active={sortField === field}
            direction={sortField === field ? sortDirection : 'asc'}
            onClick={() => handleSort(field)}
        >
            {label}
        </TableSortLabel>
    );

    const formatSalary = (employee: Employee): string => {
        const salary = employee.currentSalary;

        if (!salary) {
            return '—';
        }

        try {
            return new Intl.NumberFormat('en', {
                style: 'currency',
                currency: salary.currencyCode,
                maximumFractionDigits: 0,
            }).format(salary.baseSalary);
        } catch {
            return `${salary.currencyCode} ${salary.baseSalary.toLocaleString()}`;
        }
    };

    return (
        <Paper
            variant="outlined"
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
            }}
        >
            <TableContainer
                sx={{
                    width: '100%',
                    overflowX: 'auto',
                }}
            >
                <Table
                    size="medium"
                    sx={{
                        minWidth: 1100,
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                {renderSortLabel('Employee', 'firstName')}
                            </TableCell>

                            <TableCell>
                                {renderSortLabel('Employee ID', 'employeeCode')}
                            </TableCell>

                            <TableCell>
                                {renderSortLabel('Email', 'email')}
                            </TableCell>

                            <TableCell>
                                Department
                            </TableCell>

                            <TableCell>
                                Country
                            </TableCell>

                            <TableCell>
                                {renderSortLabel('Job Title', 'jobTitle')}
                            </TableCell>

                            <TableCell align="right">
                                Current Salary
                            </TableCell>

                            <TableCell>
                                {renderSortLabel('Status', 'employmentStatus')}
                            </TableCell>
                            <TableCell align="center">
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            py: 5,
                                        }}
                                    >
                                        <CircularProgress size={30} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Box
                                        sx={{
                                            py: 5,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            No employees found.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((employee) => (
                                <TableRow
                                    key={employee.id}
                                    hover
                                    sx={{
                                        '&:last-child td': {
                                            borderBottom: 0,
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {employee.firstName} {employee.lastName}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {employee.employeeCode}
                                    </TableCell>

                                    <TableCell>
                                        {employee.email}
                                    </TableCell>

                                    <TableCell>
                                        {employee.departmentName}
                                    </TableCell>

                                    <TableCell>
                                        {employee.countryName}
                                    </TableCell>

                                    <TableCell>
                                        {employee.jobTitle}
                                    </TableCell>

                                    <TableCell align="right">
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {formatSalary(employee)}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={
                                                employee.employmentStatus === 'ACTIVE'
                                                    ? 'Active'
                                                    : 'Inactive'
                                            }
                                            color={
                                                employee.employmentStatus === 'ACTIVE'
                                                    ? 'success'
                                                    : 'default'
                                            }
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                fontWeight: 600,
                                                minWidth: 75,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View employee details">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                aria-label={`View details of ${employee.firstName} ${employee.lastName}`}
                                                onClick={() => onViewEmployee(employee.id)}
                                            >
                                                <VisibilityOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={totalElements}
                page={page}
                rowsPerPage={pageSize}
                onPageChange={(_, newPage) => onPageChange(newPage)}
                onRowsPerPageChange={(event) =>
                    onPageSizeChange(Number(event.target.value))
                }
                rowsPerPageOptions={[10, 25, 50, 100]}
                showFirstButton
                showLastButton
            />
        </Paper>
    );
}

export default EmployeeTable;
