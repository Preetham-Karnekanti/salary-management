import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import apiClient from '../../axios/axios';

import type { Employee } from '../../types/employee';
import type { EmployeeDetailsResponse } from '../../types/employee';

import EmployeesPage from './EmployeesPage';

describe('EmployeesPage', () => {
  let getStub: sinon.SinonStub;
  let postStub: sinon.SinonStub;
  let putStub: sinon.SinonStub;

  const countries = [
    { id: 1, name: 'India' },
    { id: 2, name: 'United States' },
  ];

  const departments = [
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
        effectiveTo: null,
      },
      ...overrides,
    }) as Employee;

  const createPageResponse = (employees: Employee[] = []) => ({
    content: employees,
    totalElements: employees.length,
    totalPages: employees.length > 0 ? 1 : 0,
  });

  const createDetailsResponse = (): EmployeeDetailsResponse =>
    ({
      employee: createEmployee(),
      salaryHistory: [
        {
          id: 1,
          baseSalary: 125000,
          currencyCode: 'INR',
          effectiveFrom: '2024-01-15',
          effectiveTo: null,
        },
      ],
    }) as EmployeeDetailsResponse;

  const renderEmployeesPage = () => render(<EmployeesPage />);

  const getDialogInput = (dialog: HTMLElement, name: string): HTMLInputElement => {
    const input = dialog.querySelector<HTMLInputElement>(`input[name="${name}"]`);

    if (!input) {
      throw new Error(`Input with name "${name}" was not found`);
    }

    return input;
  };

  const selectDialogOption = (dialog: HTMLElement, label: string, option: string) => {
    fireEvent.mouseDown(
      within(dialog).getByRole('combobox', {
        name: label,
      }),
    );

    fireEvent.click(
      screen.getByRole('option', {
        name: option,
      }),
    );
  };

  const fillEmployeeForm = (dialog: HTMLElement) => {
    fireEvent.change(getDialogInput(dialog, 'employeeCode'), {
      target: { value: 'EMP002' },
    });

    fireEvent.change(getDialogInput(dialog, 'email'), {
      target: { value: 'jane.doe@example.com' },
    });

    fireEvent.change(getDialogInput(dialog, 'firstName'), {
      target: { value: 'Jane' },
    });

    fireEvent.change(getDialogInput(dialog, 'lastName'), {
      target: { value: 'Doe' },
    });

    selectDialogOption(dialog, 'Country', 'India');
    selectDialogOption(dialog, 'Department', 'Engineering');

    fireEvent.change(getDialogInput(dialog, 'jobTitle'), {
      target: { value: 'Software Engineer' },
    });

    fireEvent.change(getDialogInput(dialog, 'hireDate'), {
      target: { value: '2024-01-15' },
    });

    fireEvent.change(getDialogInput(dialog, 'baseSalary'), {
      target: { value: '125000' },
    });

    fireEvent.change(getDialogInput(dialog, 'currencyCode'), {
      target: { value: 'INR' },
    });

    fireEvent.change(getDialogInput(dialog, 'effectiveFrom'), {
      target: { value: '2024-01-15' },
    });
  };

  beforeEach(() => {
    getStub = sinon.stub(apiClient, 'get');
    postStub = sinon.stub(apiClient, 'post');
    putStub = sinon.stub(apiClient, 'put');

    // Reference data API responses.
    getStub.withArgs('/countries').resolves({
      data: countries,
    } as never);

    getStub.withArgs('/departments').resolves({
      data: departments,
    } as never);

    // Employee list API response.
    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse(),
    } as never);

    // Create employee API response.
    postStub.withArgs('/employees').resolves({
      data: createEmployee({
        id: 2,
        employeeCode: 'EMP002',
        firstName: 'Jane',
      }),
    } as never);

    // Update employee API response.
    putStub.withArgs('/employees/1').resolves({
      data: createEmployee(),
    } as never);

    // Employee details API response.
    getStub.withArgs('/employees/1').resolves({
      data: createDetailsResponse(),
    } as never);

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

  it('should render the employee management page', async () => {
    renderEmployeesPage();

    expect(screen.getByText('Employee Management')).to.exist;

    expect(screen.getByText('View and manage employees across your organization.')).to.exist;

    expect(
      screen.getByRole('button', {
        name: /add employee/i,
      }),
    ).to.exist;

    await waitFor(() => {
      expect(getStub.calledWith('/countries')).to.equal(true);
      expect(getStub.calledWith('/departments')).to.equal(true);
      expect(postStub.calledWith('/employees/search')).to.equal(true);
    });
  });

  it('should display employees fetched by the useEmployees hook', async () => {
    const employee = createEmployee();

    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse([employee]),
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('John Doe')).to.exist;
    expect(screen.getByText('EMP001')).to.exist;
    expect(screen.getByText('john.doe@example.com')).to.exist;
    expect(screen.getByText('Engineering')).to.exist;

    expect(screen.getByText('1 Employees')).to.exist;
  });

  it('should open the create employee dialog when Add Employee is clicked', async () => {
    renderEmployeesPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: /add employee/i,
      }),
    );

    expect(await screen.findByRole('heading', { name: 'Add Employee' })).to.exist;

    expect(
      screen.getByRole('button', {
        name: 'Create Employee',
      }),
    ).to.exist;
  });

  it('should pass country and department options to the employee form', async () => {
    renderEmployeesPage();

    await waitFor(() => {
      expect(getStub.calledWith('/countries')).to.equal(true);
      expect(getStub.calledWith('/departments')).to.equal(true);
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /add employee/i,
      }),
    );

    const dialog = await screen.findByRole('dialog');

    selectDialogOption(dialog, 'Country', 'India');

    expect(
      within(dialog).getByRole('combobox', {
        name: 'Country',
      }).textContent,
    ).to.include('India');

    selectDialogOption(dialog, 'Department', 'Engineering');

    expect(
      within(dialog).getByRole('combobox', {
        name: 'Department',
      }).textContent,
    ).to.include('Engineering');
  });

  it('should create an employee, close the dialog, refresh the list and show success notification', async () => {
    const createdEmployee = createEmployee({
      id: 2,
      employeeCode: 'EMP002',
      firstName: 'Jane',
    });

    postStub.withArgs('/employees').resolves({
      data: createdEmployee,
    } as never);

    renderEmployeesPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: /add employee/i,
      }),
    );

    const dialog = await screen.findByRole('dialog');

    await waitFor(() => {
      expect(getStub.calledWith('/countries')).to.equal(true);
      expect(getStub.calledWith('/departments')).to.equal(true);
    });

    fillEmployeeForm(dialog);

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Create Employee',
      }),
    );

    await waitFor(() => {
      expect(postStub.calledWith('/employees')).to.equal(true);
    });

    const createCall = postStub.getCalls().find((call) => call.args[0] === '/employees');

    expect(createCall).to.exist;

    expect(createCall!.args[1]).to.deep.equal({
      employeeCode: 'EMP002',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
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

    expect(await screen.findByText('Employee created successfully!')).to.exist;

    await waitFor(() => {
      expect(postStub.getCalls().filter((call) => call.args[0] === '/employees/search').length).to.be.greaterThan(1);
    });

    expect(await screen.findByText('Employee created successfully!')).to.exist;

    await waitFor(() => {
      expect(postStub.getCalls().filter((call) => call.args[0] === '/employees/search').length).to.be.greaterThan(1);
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).to.equal(null);
    });
  });

  it('should display an error when employee creation fails', async () => {
    postStub.withArgs('/employees').rejects(new Error('Employee code already exists.'));

    renderEmployeesPage();

    fireEvent.click(
      screen.getByRole('button', {
        name: /add employee/i,
      }),
    );

    const dialog = await screen.findByRole('dialog');

    await waitFor(() => {
      expect(getStub.calledWith('/countries')).to.equal(true);
      expect(getStub.calledWith('/departments')).to.equal(true);
    });

    fillEmployeeForm(dialog);

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Create Employee',
      }),
    );

    expect(await screen.findByText('Employee code already exists.')).to.exist;

    // The form should remain open after a failure.
    expect(screen.getByRole('dialog')).to.exist;

    // No success notification should be displayed.
    expect(screen.queryByText('Employee created successfully!')).to.equal(null);
  });

  it('should open the edit dialog with the selected employee details', async () => {
    const employee = createEmployee();

    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse([employee]),
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('John Doe')).to.exist;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit John Doe',
      }),
    );

    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByText('Edit Employee')).to.exist;

    expect(getDialogInput(dialog, 'employeeCode').value).to.equal('EMP001');
    expect(getDialogInput(dialog, 'firstName').value).to.equal('John');
    expect(getDialogInput(dialog, 'lastName').value).to.equal('Doe');
    expect(getDialogInput(dialog, 'email').value).to.equal('john.doe@example.com');
    expect(getDialogInput(dialog, 'jobTitle').value).to.equal('Software Engineer');
    expect(getDialogInput(dialog, 'baseSalary').value).to.equal('125000');
  });

  it('should update an employee, refresh the list and show success notification', async () => {
    const employee = createEmployee();

    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse([employee]),
    } as never);

    putStub.withArgs('/employees/1').resolves({
      data: employee,
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('John Doe')).to.exist;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit John Doe',
      }),
    );

    const dialog = await screen.findByRole('dialog');

    fireEvent.change(getDialogInput(dialog, 'firstName'), {
      target: { value: 'Jonathan' },
    });

    fireEvent.click(
      within(dialog).getByRole('button', {
        name: 'Save Changes',
      }),
    );

    await waitFor(() => {
      expect(putStub.calledOnce).to.equal(true);
    });

    expect(putStub.firstCall.args[0]).to.equal('/employees/1');

    expect(putStub.firstCall.args[1]).to.deep.equal({
      employeeCode: 'EMP001',
      firstName: 'Jonathan',
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

    expect(await screen.findByText('Employee updated successfully!')).to.exist;

    await waitFor(() => {
      expect(postStub.getCalls().filter((call) => call.args[0] === '/employees/search').length).to.be.greaterThan(1);
    });
  });

  it('should open employee details when View is clicked', async () => {
    const employee = createEmployee();

    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse([employee]),
    } as never);

    getStub.withArgs('/employees/1').resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('John Doe')).to.exist;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'View John Doe',
      }),
    );

    expect(await screen.findByText('Personal & Employment Information')).to.exist;

    expect(getStub.calledWith('/employees/1')).to.equal(true);
  });

  it('should close employee details when the Close button is clicked', async () => {
    const employee = createEmployee();

    postStub.withArgs('/employees/search').resolves({
      data: createPageResponse([employee]),
    } as never);

    getStub.withArgs('/employees/1').resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('John Doe')).to.exist;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'View John Doe',
      }),
    );

    await screen.findByText('Personal & Employment Information');

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Personal & Employment Information')).to.equal(null);
    });
  });

  it('should display an error when employee loading fails', async () => {
    postStub.withArgs('/employees/search').rejects(new Error('Network unavailable'));

    renderEmployeesPage();

    expect(await screen.findByText('Failed to load employees: Network unavailable')).to.exist;

    expect(screen.getByRole('button', { name: 'Retry' })).to.exist;
  });

  it('should retry fetching employees when Retry is clicked', async () => {
    const employee = createEmployee();

    const searchStub = postStub.withArgs('/employees/search');

    searchStub.onFirstCall().rejects(new Error('Network unavailable'));

    searchStub.onSecondCall().resolves({
      data: createPageResponse([employee]),
    } as never);

    renderEmployeesPage();

    expect(await screen.findByText('Failed to load employees: Network unavailable')).to.exist;

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Retry',
      }),
    );

    expect(await screen.findByText('John Doe')).to.exist;
    expect(screen.queryByText('Failed to load employees: Network unavailable')).to.equal(null);
  });

  it('should display an error when reference data loading fails', async () => {
    getStub.withArgs('/countries').rejects(new Error('Reference data unavailable'));

    renderEmployeesPage();

    expect(await screen.findByText('Unable to load country and department options: Reference data unavailable')).to
      .exist;
  });
});
