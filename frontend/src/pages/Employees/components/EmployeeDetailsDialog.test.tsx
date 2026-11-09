import type { ComponentProps } from 'react';

import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';

import apiClient from '../../../axios/axios';

import type { Employee } from '../../../types/employee';
import type { EmployeeDetailsResponse } from '../../../types/employee';

import EmployeeDetailsDialog from './EmployeeDetailsDialog';

type EmployeeDetailsDialogProps = ComponentProps<typeof EmployeeDetailsDialog>;

describe('EmployeeDetailsDialog', () => {
  let getStub: sinon.SinonStub;

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
        baseSalary: 150000,
        currencyCode: 'INR',
        effectiveFrom: '2025-01-01',
        effectiveTo: null,
      },
      ...overrides,
    }) as Employee;

  const createDetailsResponse = (overrides: Partial<EmployeeDetailsResponse> = {}): EmployeeDetailsResponse =>
    ({
      employee: createEmployee(),
      salaryHistory: [
        {
          id: 2,
          baseSalary: 150000,
          currencyCode: 'INR',
          effectiveFrom: '2025-01-01',
          effectiveTo: null,
        },
        {
          id: 1,
          baseSalary: 120000,
          currencyCode: 'INR',
          effectiveFrom: '2024-01-15',
          effectiveTo: '2024-12-31',
        },
      ],
      ...overrides,
    }) as EmployeeDetailsResponse;

  const renderEmployeeDetails = (props: Partial<EmployeeDetailsDialogProps> = {}) => {
    const defaultProps: EmployeeDetailsDialogProps = {
      open: true,
      employeeId: 1,
      onClose: sinon.spy(),
    };

    return render(<EmployeeDetailsDialog {...defaultProps} {...props} />);
  };

  const formatSalary = (amount: number, currencyCode: string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);

  beforeEach(() => {
    getStub = sinon.stub(apiClient, 'get');

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

  it('should fetch employee details when the dialog opens', async () => {
    const details = createDetailsResponse();

    getStub.resolves({
      data: details,
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    expect(getStub.calledOnce).to.equal(true);
    expect(getStub.firstCall.args[0]).to.equal('/employees/1');
  });

  it('should display loading indicator while fetching employee details', async () => {
    let resolveRequest!: (response: unknown) => void;

    getStub.returns(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }) as never,
    );

    renderEmployeeDetails();

    expect(await screen.findByRole('progressbar')).to.exist;

    await act(async () => {
      resolveRequest({
        data: createDetailsResponse(),
      });
    });

    expect(await screen.findByText('John Doe')).to.exist;

    expect(screen.queryByRole('progressbar')).to.equal(null);
  });

  it('should display employee information correctly', async () => {
    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    expect(screen.getAllByText('Software Engineer')).to.have.lengthOf(2);
    expect(screen.getByText('john.doe@example.com')).to.exist;
    expect(screen.getByText('Engineering')).to.exist;
    expect(screen.getByText('India')).to.exist;
    expect(screen.getAllByText('EMP001')).to.have.lengthOf(2);
    expect(screen.getByText('Active')).to.exist;
    expect(screen.getByText('Personal & Employment Information')).to.exist;
  });

  it('should display current salary information', async () => {
    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;
    expect(screen.getByText('Current Salary')).to.exist;
    expect(screen.getAllByText(formatSalary(150000, 'INR'))).to.have.lengthOf(2);
    expect(screen.getAllByText('Effective From')).to.have.lengthOf(2);
  });

  it('should display salary history in the order returned by the API', async () => {
    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    const rows = screen.getAllByRole('row');

    // First row is the table header.
    expect(rows[1].textContent).to.include('01 Jan 2025');
    expect(rows[1].textContent).to.include(formatSalary(150000, 'INR'));
    expect(rows[1].textContent).to.include('Current');

    expect(rows[2].textContent).to.include('15 Jan 2024');
    expect(rows[2].textContent).to.include(formatSalary(120000, 'INR'));
    expect(rows[2].textContent).to.include('Previous');
  });

  it('should identify the current salary record using effectiveTo null', async () => {
    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    expect(screen.getByText('Current')).to.exist;
    expect(screen.getByText('Previous')).to.exist;
    expect(screen.getByText('Present')).to.exist;
  });

  it('should display an empty state when salary history is unavailable', async () => {
    getStub.resolves({
      data: createDetailsResponse({
        salaryHistory: [],
      }),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    expect(screen.getByText('No salary history available.')).to.exist;
  });

  it('should display a message when the employee has no current salary', async () => {
    const employee = createEmployee({
      currentSalary: null,
    });

    getStub.resolves({
      data: createDetailsResponse({
        employee,
      }),
    } as never);

    renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    expect(screen.getByText('No current salary information available.')).to.exist;
  });

  it('should display an error when fetching employee details fails', async () => {
    getStub.rejects(new Error('Network unavailable'));

    renderEmployeeDetails();

    expect(await screen.findByRole('alert')).to.exist;

    expect(screen.getByText('Unable to load employee details: Network unavailable')).to.exist;
  });

  it('should not fetch employee details when the dialog is closed', () => {
    renderEmployeeDetails({
      open: false,
    });

    expect(getStub.called).to.equal(false);
  });

  it('should not fetch employee details when employeeId is null', () => {
    renderEmployeeDetails({
      employeeId: null,
    });

    expect(getStub.called).to.equal(false);
  });

  it('should fetch updated employee details when employeeId changes', async () => {
    getStub.onFirstCall().resolves({
      data: createDetailsResponse(),
    } as never);

    getStub.onSecondCall().resolves({
      data: createDetailsResponse({
        employee: createEmployee({
          id: 2,
          employeeCode: 'EMP002',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
        }),
      }),
    } as never);

    const { rerender } = renderEmployeeDetails();

    expect(await screen.findByText('John Doe')).to.exist;

    rerender(<EmployeeDetailsDialog open employeeId={2} onClose={sinon.spy()} />);

    expect(await screen.findByText('Jane Smith')).to.exist;

    expect(getStub.calledTwice).to.equal(true);
    expect(getStub.secondCall.args[0]).to.equal('/employees/2');
  });

  it('should abort the request when the dialog closes', async () => {
    getStub.returns(new Promise(() => {}) as never);

    const { rerender } = renderEmployeeDetails();

    await screen.findByRole('progressbar');

    const requestConfig = getStub.firstCall.args[1] as {
      signal: AbortSignal;
    };

    expect(requestConfig.signal.aborted).to.equal(false);

    rerender(<EmployeeDetailsDialog open={false} employeeId={1} onClose={sinon.spy()} />);

    await waitFor(() => {
      expect(requestConfig.signal.aborted).to.equal(true);
    });
  });

  it('should call onClose when the Close button is clicked', async () => {
    const onClose = sinon.spy();

    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails({
      onClose,
    });

    await screen.findByText('John Doe');

    screen
      .getByRole('button', {
        name: 'Close',
      })
      .click();

    expect(onClose.calledOnce).to.equal(true);
  });

  it('should call onClose when the close icon is clicked', async () => {
    const onClose = sinon.spy();

    getStub.resolves({
      data: createDetailsResponse(),
    } as never);

    renderEmployeeDetails({
      onClose,
    });

    await screen.findByText('John Doe');

    screen
      .getByRole('button', {
        name: 'Close employee details',
      })
      .click();

    expect(onClose.calledOnce).to.equal(true);
  });
});
