import { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import type { EmploymentStatus, EmployeeCreateRequest } from '@/types/employee';

import type { ReferenceOption } from '@/api/referenceDataApi';

interface EmployeeFormDialogProps {
  open: boolean;
  countries: ReferenceOption[];
  departments: ReferenceOption[];
  submitting?: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (request: EmployeeCreateRequest) => void;
}

interface EmployeeFormState {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  countryId: string;
  departmentId: string;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  hireDate: string;
  baseSalary: string;
  currencyCode: string;
  effectiveFrom: string;
}

const initialFormState: EmployeeFormState = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  countryId: '',
  departmentId: '',
  jobTitle: '',
  employmentStatus: 'ACTIVE',
  hireDate: '',
  baseSalary: '',
  currencyCode: '',
  effectiveFrom: '',
};

function EmployeeFormDialog({
  open,
  countries,
  departments,
  submitting = false,
  submitError = null,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<EmployeeFormState>(initialFormState);

  // Reset the form whenever the dialog is opened.
  useEffect(() => {
    if (open) {
      setForm(initialFormState);
    }
  }, [open]);

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const request: EmployeeCreateRequest = {
      employeeCode: form.employeeCode.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      countryId: Number(form.countryId),
      departmentId: Number(form.departmentId),
      jobTitle: form.jobTitle.trim(),
      employmentStatus: form.employmentStatus,
      hireDate: form.hireDate,
      salary: {
        baseSalary: Number(form.baseSalary),
        currencyCode: form.currencyCode.trim().toUpperCase(),
        effectiveFrom: form.effectiveFrom,
      },
    };

    onSubmit(request);
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={fullScreen}
      aria-labelledby="employee-form-title">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          id="employee-form-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Add Employee
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Enter employee and initial salary information.
            </Typography>
          </Box>

          <IconButton onClick={onClose} disabled={submitting} aria-label="Close employee form">
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}>
            {submitError && <Alert severity="error">{submitError}</Alert>}

            {/* Employee Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Employee Information
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}>
                <TextField
                  name="employeeCode"
                  label="Employee Code"
                  value={form.employeeCode}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 30,
                    },
                  }}
                />

                <TextField
                  name="email"
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />

                <TextField
                  name="firstName"
                  label="First Name"
                  value={form.firstName}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />

                <TextField
                  name="lastName"
                  label="Last Name"
                  value={form.lastName}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 100,
                    },
                  }}
                />

                <FormControl fullWidth size="small" required>
                  <InputLabel id="country-select-label">Country</InputLabel>

                  <Select
                    labelId="country-select-label"
                    name="countryId"
                    value={form.countryId}
                    label="Country"
                    onChange={(event) =>
                      setForm((previousForm) => ({
                        ...previousForm,
                        countryId: event.target.value,
                      }))
                    }>
                    {countries.map((country) => (
                      <MenuItem key={country.id} value={String(country.id)}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" required>
                  <InputLabel id="department-select-label">Department</InputLabel>

                  <Select
                    labelId="department-select-label"
                    name="departmentId"
                    value={form.departmentId}
                    label="Department"
                    onChange={(event) =>
                      setForm((previousForm) => ({
                        ...previousForm,
                        departmentId: event.target.value,
                      }))
                    }>
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={String(department.id)}>
                        {department.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  name="jobTitle"
                  label="Job Title"
                  value={form.jobTitle}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 150,
                    },
                  }}
                />

                <FormControl fullWidth size="small" required>
                  <InputLabel id="employment-status-select-label">Employment Status</InputLabel>

                  <Select
                    labelId="employment-status-select-label"
                    value={form.employmentStatus}
                    label="Employment Status"
                    onChange={(event) =>
                      setForm((previousForm) => ({
                        ...previousForm,
                        employmentStatus: event.target.value as EmploymentStatus,
                      }))
                    }>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  name="hireDate"
                  label="Hire Date"
                  type="date"
                  value={form.hireDate}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Initial Salary */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Initial Salary
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}>
                <TextField
                  name="baseSalary"
                  label="Base Salary"
                  type="number"
                  value={form.baseSalary}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      min: 0.01,
                      step: 0.01,
                    },
                  }}
                />

                <TextField
                  name="currencyCode"
                  label="Currency Code"
                  placeholder="e.g. INR, USD"
                  value={form.currencyCode}
                  onChange={(event) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      currencyCode: event.target.value.toUpperCase().slice(0, 3),
                    }))
                  }
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    htmlInput: {
                      maxLength: 3,
                    },
                  }}
                />

                <TextField
                  name="effectiveFrom"
                  label="Salary Effective From"
                  type="date"
                  value={form.effectiveFrom}
                  onChange={handleTextChange}
                  required
                  fullWidth
                  size="small"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>

          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export default EmployeeFormDialog;
