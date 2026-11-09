import type { ComponentProps } from 'react';

import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { Employee } from '../../../types/employee';
import type { ReferenceOption } from '../../../api/referenceDataApi';

import EmployeeFormDialog from './EmployeeFormDialog';

type EmployeeFormDialogProps = ComponentProps<typeof EmployeeFormDialog>;

describe('EmployeeFormDialog', () => {
  const countries: ReferenceOption[] = [
    { id: 1, name: 'India' },
    { id: 2, name: 'United States' },
  ];

  const departments: ReferenceOption[] = [
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Human Resources' },
  ];

  const createEmployee = (overrides: Partial<Employee> = {}): Employee =>
    ({
      id: 1,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      countryId: 1,
      countryName: 'India',
      departmentId: 1,
      departmentName: 'Engineering',
      jobTitle: 'Software Engineer',
      employmentStatus: 'ACTIVE',
      hireDate: '2024-01-15',
      currentSalary: {
        baseSalary: 125000,
        currencyCode: 'INR',
        effectiveFrom: '2024-01-15',
      },
      ...overrides,
    }) as Employee;

  const getInput = (name: string): HTMLInputElement => {
    const input = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);

    if (!input) {
      throw new Error(`Input with name "${name}" was not found`);
    }

    return input;
  };

  const renderEmployeeForm = (props: Partial<EmployeeFormDialogProps> = {}) => {
    const defaultProps: EmployeeFormDialogProps = {
      open: true,
      mode: 'create',
      employee: null,
      countries,
      departments,
      submitting: false,
      submitError: null,
      onClose: sinon.spy(),
      onSubmit: sinon.spy(),
    };

    return render(<EmployeeFormDialog {...defaultProps} {...props} />);
  };

  const selectOption = (label: string, option: string) => {
    fireEvent.mouseDown(
      screen.getByRole('combobox', {
        name: label,
      }),
    );

    fireEvent.click(
      screen.getByRole('option', {
        name: option,
      }),
    );
  };

  const fillRequiredFields = () => {
    fireEvent.change(getInput('employeeCode'), {
      target: { value: ' EMP001 ' },
    });

    fireEvent.change(getInput('email'), {
      target: { value: 'john.doe@example.com' },
    });

    fireEvent.change(getInput('firstName'), {
      target: { value: ' John ' },
    });

    fireEvent.change(getInput('lastName'), {
      target: { value: ' Doe ' },
    });

    selectOption('Country', 'India');
    selectOption('Department', 'Engineering');

    fireEvent.change(getInput('jobTitle'), {
      target: { value: ' Software Engineer ' },
    });

    fireEvent.change(getInput('hireDate'), {
      target: { value: '2024-01-15' },
    });

    fireEvent.change(getInput('baseSalary'), {
      target: { value: '125000' },
    });

    fireEvent.change(getInput('currencyCode'), {
      target: { value: 'inr' },
    });

    fireEvent.change(getInput('effectiveFrom'), {
      target: { value: '2024-01-15' },
    });
  };

  beforeEach(() => {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: sinon.stub(),
        removeListener: sinon.stub(),
        addEventListener: sinon.stub(),
        removeEventListener: sinon.stub(),
        dispatchEvent: sinon.stub(),
      }) as unknown as MediaQueryList;
  });

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  it('should render the create employee form', () => {
    renderEmployeeForm();

    expect(screen.getByText('Add Employee')).to.exist;

    expect(screen.getByText('Enter employee and initial salary information.')).to.exist;

    expect(screen.getByText('Employee Information')).to.exist;
    expect(screen.getByText('Initial Salary')).to.exist;

    expect(
      screen.getByRole('button', {
        name: 'Create Employee',
      }),
    ).to.exist;
  });

  it('should render the edit employee form', () => {
    const employee = createEmployee();

    renderEmployeeForm({
      mode: 'edit',
      employee,
    });

    expect(screen.getByText('Edit Employee')).to.exist;

    expect(screen.getByText('Update employee and salary information.')).to.exist;

    expect(screen.getByText('Current Salary')).to.exist;

    expect(
      screen.getByRole('button', {
        name: 'Save Changes',
      }),
    ).to.exist;
  });

  it('should display country and department options', () => {
    renderEmployeeForm();

    selectOption('Country', 'India');

    expect(
      screen.getByRole('combobox', {
        name: 'Country',
      }).textContent,
    ).to.include('India');

    selectOption('Department', 'Engineering');

    expect(
      screen.getByRole('combobox', {
        name: 'Department',
      }).textContent,
    ).to.include('Engineering');
  });

  it('should prepopulate employee details and salary in edit mode', () => {
    const employee = createEmployee();

    renderEmployeeForm({
      mode: 'edit',
      employee,
    });

    expect(getInput('employeeCode').value).to.equal('EMP001');
    expect(getInput('email').value).to.equal('john.doe@example.com');
    expect(getInput('firstName').value).to.equal('John');
    expect(getInput('lastName').value).to.equal('Doe');
    expect(getInput('jobTitle').value).to.equal('Software Engineer');
    expect(getInput('hireDate').value).to.equal('2024-01-15');

    expect(getInput('baseSalary').value).to.equal('125000');
    expect(getInput('currencyCode').value).to.equal('INR');
    expect(getInput('effectiveFrom').value).to.equal('2024-01-15');

    expect(
      screen.getByRole('combobox', {
        name: 'Country',
      }).textContent,
    ).to.include('India');

    expect(
      screen.getByRole('combobox', {
        name: 'Department',
      }).textContent,
    ).to.include('Engineering');
  });

  it('should mark required fields as required', () => {
    renderEmployeeForm();

    expect(getInput('employeeCode').required).to.equal(true);
    expect(getInput('email').required).to.equal(true);
    expect(getInput('firstName').required).to.equal(true);
    expect(getInput('lastName').required).to.equal(true);
    expect(getInput('jobTitle').required).to.equal(true);
    expect(getInput('hireDate').required).to.equal(true);
    expect(getInput('baseSalary').required).to.equal(true);
    expect(getInput('currencyCode').required).to.equal(true);
    expect(getInput('effectiveFrom').required).to.equal(true);
  });

  it('should restrict hire date and salary effective date to today or earlier', () => {
    renderEmployeeForm();

    const date = new Date();

    const today = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

    expect(getInput('hireDate').max).to.equal(today);
    expect(getInput('effectiveFrom').max).to.equal(today);
  });

  it('should submit employee details with trimmed values and converted salary values', () => {
    const onSubmit = sinon.spy();

    renderEmployeeForm({
      onSubmit,
    });

    fillRequiredFields();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create Employee',
      }),
    );

    expect(onSubmit.calledOnce).to.equal(true);

    expect(onSubmit.firstCall.args[0]).to.deep.equal({
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      countryId: 1,
      departmentId: 1,
      jobTitle: 'Software Engineer',
      employmentStatus: 'ACTIVE',
      hireDate: '2024-01-15',
      salary: {
        baseSalary: 125000,
        currencyCode: 'INR',
        effectiveFrom: '2024-01-15',
      },
    });
  });

  it('should allow changing employment status', () => {
    renderEmployeeForm();

    selectOption('Employment Status', 'Inactive');

    expect(
      screen.getByRole('combobox', {
        name: 'Employment Status',
      }).textContent,
    ).to.include('Inactive');
  });

  it('should display the submission error', () => {
    renderEmployeeForm({
      submitError: 'Employee code already exists.',
    });

    expect(screen.getByText('Employee code already exists.')).to.exist;
  });

  it('should disable form actions and show saving text while submitting in edit mode', () => {
    const onClose = sinon.spy();

    renderEmployeeForm({
      mode: 'edit',
      employee: createEmployee(),
      submitting: true,
      onClose,
    });

    const saveButton = screen.getByRole('button', {
      name: 'Saving...',
    });

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });

    const closeButton = screen.getByRole('button', {
      name: 'Close employee form',
    });

    expect(saveButton).to.have.property('disabled', true);
    expect(cancelButton).to.have.property('disabled', true);
    expect(closeButton).to.have.property('disabled', true);

    fireEvent.click(cancelButton);
    fireEvent.click(closeButton);

    expect(onClose.called).to.equal(false);
  });

  it('should show creating text while submitting in create mode', () => {
    renderEmployeeForm({
      submitting: true,
    });

    const createButton = screen.getByRole('button', {
      name: 'Creating...',
    });

    expect(createButton).to.have.property('disabled', true);
  });

  it('should call onClose when Cancel is clicked', () => {
    const onClose = sinon.spy();

    renderEmployeeForm({
      onClose,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cancel',
      }),
    );

    expect(onClose.calledOnce).to.equal(true);
  });

  it('should call onClose when the close icon is clicked', () => {
    const onClose = sinon.spy();

    renderEmployeeForm({
      onClose,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close employee form',
      }),
    );

    expect(onClose.calledOnce).to.equal(true);
  });
});
