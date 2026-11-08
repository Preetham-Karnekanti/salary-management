import { useEffect, useState } from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { getEmployeeById } from '@/api/employeeApi';
import type { EmployeeDetailsResponse } from '@/types/employee';

interface EmployeeDetailsDialogProps {
  open: boolean;
  employeeId: number | null;
  onClose: () => void;
}

function formatDate(date: string | null): string {
  if (!date) {
    return 'Present';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function formatSalary(amount: number, currencyCode: string): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString('en-IN')}`;
  }
}

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          overflowWrap: 'anywhere',
        }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

function EmployeeDetailsDialog({ open, employeeId, onClose }: EmployeeDetailsDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [details, setDetails] = useState<EmployeeDetailsResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || employeeId === null) {
      return;
    }

    const controller = new AbortController();

    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        setDetails(null);

        const response = await getEmployeeById(employeeId, controller.signal);

        setDetails(response);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(error instanceof Error ? error.message : 'Failed to load employee details.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEmployeeDetails();

    return () => {
      controller.abort();
    };
  }, [open, employeeId]);

  const employee = details?.employee;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="employee-details-title">
      <DialogTitle
        id="employee-details-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Employee Details
          </Typography>

          {employee && (
            <Typography variant="caption" color="text.secondary">
              {employee.employeeCode}
            </Typography>
          )}
        </Box>

        <IconButton onClick={onClose} aria-label="Close employee details" size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        dividers
        sx={{
          backgroundColor: 'background.default',
          minHeight: 250,
          p: { xs: 2, sm: 3 },
        }}>
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 250,
            }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && <Alert severity="error">Unable to load employee details: {error}</Alert>}

        {!loading && !error && employee && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
            {/* Employee information */}
            <Paper
              variant="outlined"
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                borderRadius: 2,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                }}>
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    backgroundColor: 'primary.main',
                    fontWeight: 600,
                  }}>
                  {employee.firstName.charAt(0)}
                  {employee.lastName.charAt(0)}
                </Avatar>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                  }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}>
                    {employee.firstName} {employee.lastName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {employee.jobTitle}
                  </Typography>
                </Box>

                <Chip
                  label={employee.employmentStatus === 'ACTIVE' ? 'Active' : 'Inactive'}
                  color={employee.employmentStatus === 'ACTIVE' ? 'success' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}>
                Personal & Employment Information
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2.5,
                }}>
                <DetailItem label="Employee Code" value={employee.employeeCode} />

                <DetailItem label="Email" value={employee.email} />

                <DetailItem label="Department" value={employee.departmentName} />

                <DetailItem label="Country" value={employee.countryName} />

                <DetailItem label="Job Title" value={employee.jobTitle} />

                <DetailItem label="Hire Date" value={formatDate(employee.hireDate)} />
              </Box>
            </Paper>

            {/* Current salary */}
            <Paper
              variant="outlined"
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
                borderRadius: 2,
              }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}>
                Current Salary
              </Typography>

              {employee.currentSalary ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 2.5,
                  }}>
                  <DetailItem
                    label="Base Salary"
                    value={formatSalary(employee.currentSalary.baseSalary, employee.currentSalary.currencyCode)}
                  />

                  <DetailItem label="Effective From" value={formatDate(employee.currentSalary.effectiveFrom)} />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No current salary information available.
                </Typography>
              )}
            </Paper>

            {/* Salary history */}
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
              }}>
              <Box
                sx={{
                  p: {
                    xs: 2,
                    sm: 3,
                  },
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                  }}>
                  Salary History
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Previous and current compensation records
                </Typography>
              </Box>

              <TableContainer
                sx={{
                  overflowX: 'auto',
                }}>
                <Table
                  size="small"
                  sx={{
                    minWidth: 600,
                  }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Effective From</TableCell>
                      <TableCell>Effective To</TableCell>
                      <TableCell align="right">Base Salary</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {details.salaryHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No salary history available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      details.salaryHistory.map((salary) => (
                        <TableRow key={salary.id} hover>
                          <TableCell>{formatDate(salary.effectiveFrom)}</TableCell>

                          <TableCell>{formatDate(salary.effectiveTo)}</TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={600}>
                              {formatSalary(salary.baseSalary, salary.currencyCode)}
                            </Typography>
                          </TableCell>

                          <TableCell>{salary.currencyCode}</TableCell>

                          <TableCell>
                            {salary.effectiveTo === null ? (
                              <Chip label="Current" color="success" size="small" />
                            ) : (
                              <Chip label="Previous" color="default" size="small" variant="outlined" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmployeeDetailsDialog;
