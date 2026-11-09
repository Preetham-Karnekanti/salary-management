import type { ComponentProps } from 'react';

import { afterEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import type { Employee } from '@/types/employee';
import EmployeeTable from './EmployeeTable';

type EmployeeTableProps = ComponentProps<typeof EmployeeTable>;

describe('EmployeeTable', () => {
  const createEmployee = (overrides: Partial<Employee> = {}): Employee =>
    ({
      id: 1,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      departmentName: 'Engineering',
      countryName: 'India',
      jobTitle: 'Software Engineer',
      employmentStatus: 'ACTIVE',
      currentSalary: {
        baseSalary: 125000,
        currencyCode: 'USD',
      },
      ...overrides,
    }) as Employee;

  const renderEmployeeTable = (props: Partial<EmployeeTableProps> = {}) => {
    const defaultProps: EmployeeTableProps = {
      employees: [],
      loading: false,
      page: 0,
      pageSize: 10,
      totalElements: 0,
      sort: 'employeeCode,asc',
      onViewEmployee: sinon.spy(),
      onEditEmployee: sinon.spy(),
      onPageChange: sinon.spy(),
      onPageSizeChange: sinon.spy(),
      onSortChange: sinon.spy(),
    };

    return render(<EmployeeTable {...defaultProps} {...props} />);
  };

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  it('should render employee details correctly', () => {
    const employee = createEmployee();

    renderEmployeeTable({
      employees: [employee],
      totalElements: 1,
    });

    expect(screen.getByText('John Doe')).to.exist;
    expect(screen.getByText('EMP001')).to.exist;
    expect(screen.getByText('john.doe@example.com')).to.exist;
    expect(screen.getByText('Engineering')).to.exist;
    expect(screen.getByText('India')).to.exist;
    expect(screen.getByText('Software Engineer')).to.exist;
    expect(screen.getByText('Active')).to.exist;
    expect(screen.getByText('Active').closest('.MuiChip-root')).to.exist;

    const formattedSalary = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(125000);

    expect(screen.getByText(formattedSalary)).to.exist;
  });

  it('should display an empty state when there are no employees', () => {
    renderEmployeeTable();

    expect(screen.getByText('No employees found.')).to.exist;
  });

  it('should display a loading indicator when employees are being fetched', () => {
    renderEmployeeTable({
      loading: true,
      employees: [],
    });

    expect(screen.getByRole('progressbar')).to.exist;
    expect(screen.queryByText('No employees found.')).to.equal(null);
  });

  it('should display a dash when an employee has no current salary', () => {
    const employee = createEmployee({
      currentSalary: null,
    });

    renderEmployeeTable({
      employees: [employee],
      totalElements: 1,
    });

    expect(screen.getByText('—')).to.exist;
  });

  it('should call onViewEmployee with the employee ID when View is clicked', () => {
    const employee = createEmployee();
    const onViewEmployee = sinon.spy();

    renderEmployeeTable({
      employees: [employee],
      totalElements: 1,
      onViewEmployee,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'View John Doe',
      }),
    );

    expect(onViewEmployee.calledOnce).to.equal(true);
    expect(onViewEmployee.firstCall.args[0]).to.equal(1);
  });

  it('should call onEditEmployee with the employee when Edit is clicked', () => {
    const employee = createEmployee();
    const onEditEmployee = sinon.spy();

    renderEmployeeTable({
      employees: [employee],
      totalElements: 1,
      onEditEmployee,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Edit John Doe',
      }),
    );

    expect(onEditEmployee.calledOnce).to.equal(true);
    expect(onEditEmployee.firstCall.args[0]).to.equal(employee);
  });

  it('should call onPageChange when the next page button is clicked', () => {
    const onPageChange = sinon.spy();

    renderEmployeeTable({
      page: 0,
      pageSize: 10,
      totalElements: 30,
      onPageChange,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /go to next page/i,
      }),
    );

    expect(onPageChange.calledOnce).to.equal(true);
    expect(onPageChange.firstCall.args[0]).to.equal(1);
  });

  it('should call onPageSizeChange when a different page size is selected', () => {
    const onPageSizeChange = sinon.spy();

    renderEmployeeTable({
      pageSize: 10,
      totalElements: 100,
      onPageSizeChange,
    });

    const pageSizeSelect = screen.getByRole('combobox');

    fireEvent.mouseDown(pageSizeSelect);

    fireEvent.click(
      screen.getByRole('option', {
        name: '25',
      }),
    );

    expect(onPageSizeChange.calledOnce).to.equal(true);
    expect(onPageSizeChange.firstCall.args[0]).to.equal(25);
  });

  it('should sort in descending order when the currently ascending column is clicked', () => {
    const onSortChange = sinon.spy();

    renderEmployeeTable({
      sort: 'firstName,asc',
      onSortChange,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Employee',
      }),
    );

    expect(onSortChange.calledOnce).to.equal(true);
    expect(onSortChange.firstCall.args).to.deep.equal(['firstName', 'desc']);
  });

  it('should sort in ascending order when a different sortable column is clicked', () => {
    const onSortChange = sinon.spy();

    renderEmployeeTable({
      sort: 'employeeCode,desc',
      onSortChange,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Email',
      }),
    );

    expect(onSortChange.calledOnce).to.equal(true);
    expect(onSortChange.firstCall.args).to.deep.equal(['email', 'asc']);
  });

  it('should not make Department and Country columns sortable', () => {
    renderEmployeeTable();

    expect(
      screen.getByRole('columnheader', {
        name: 'Department',
      }),
    ).to.exist;

    expect(
      screen.getByRole('columnheader', {
        name: 'Country',
      }),
    ).to.exist;

    expect(
      screen.queryByRole('button', {
        name: 'Department',
      }),
    ).to.equal(null);

    expect(
      screen.queryByRole('button', {
        name: 'Country',
      }),
    ).to.equal(null);
  });
});
