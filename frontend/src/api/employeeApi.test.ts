import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import apiClient from '../axios/axios';

import { getEmployees, getEmployeeById, createEmployee, updateEmployee } from './employeeApi';

import type {
  Employee,
  EmployeeDetailsResponse,
  EmployeeCreateRequest,
  EmployeeUpdateRequest,
  EmployeePageResponse,
  EmployeeSearchRequest,
} from '@/types/employee';

describe('employeeApi', () => {
  let getStub: sinon.SinonStub;
  let postStub: sinon.SinonStub;
  let putStub: sinon.SinonStub;

  const employee: Employee = {
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
  };

  const searchRequest: EmployeeSearchRequest = {
    searchTerm: 'John',
    employmentStatus: 'ACTIVE',
    countryId: 1,
    departmentId: 1,
    page: 0,
    size: 10,
    sortBy: 'EMPLOYEE_CODE',
    sortDirection: 'ASC',
  };

  const pageResponse: EmployeePageResponse = {
    content: [employee],
    totalElements: 1,
    totalPages: 1,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: false,
  };

  const createRequest: EmployeeCreateRequest = {
    employeeCode: 'EMP002',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    countryId: 1,
    departmentId: 1,
    jobTitle: 'Backend Developer',
    employmentStatus: 'ACTIVE',
    hireDate: '2024-02-01',
    salary: {
      baseSalary: 150000,
      currencyCode: 'INR',
      effectiveFrom: '2024-02-01',
    },
  };

  const updateRequest: EmployeeUpdateRequest = createRequest;

  const detailsResponse: EmployeeDetailsResponse = {
    employee,
    salaryHistory: [
      {
        id: 1,
        baseSalary: 125000,
        currencyCode: 'INR',
        effectiveFrom: '2024-01-15',
        effectiveTo: null,
      },
    ],
  };

  beforeEach(() => {
    getStub = sinon.stub(apiClient, 'get');
    postStub = sinon.stub(apiClient, 'post');
    putStub = sinon.stub(apiClient, 'put');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fetch employees using the provided search request', async () => {
    postStub.resolves({
      data: pageResponse,
    } as never);

    const response = await getEmployees(searchRequest);

    expect(postStub.calledOnce).to.equal(true);
    expect(postStub.firstCall.args[0]).to.equal('/employees/search');
    expect(postStub.firstCall.args[1]).to.deep.equal(searchRequest);

    expect(response).to.deep.equal(pageResponse);
  });

  it('should pass the abort signal when fetching employees', async () => {
    const controller = new AbortController();

    postStub.resolves({
      data: pageResponse,
    } as never);

    await getEmployees(searchRequest, controller.signal);

    expect(postStub.calledOnce).to.equal(true);

    const config = postStub.firstCall.args[2] as {
      signal?: AbortSignal;
    };

    expect(config.signal).to.equal(controller.signal);
  });

  it('should fetch an employee by ID', async () => {
    getStub.resolves({
      data: detailsResponse,
    } as never);

    const response = await getEmployeeById(1);

    expect(getStub.calledOnce).to.equal(true);
    expect(getStub.firstCall.args[0]).to.equal('/employees/1');

    expect(response).to.deep.equal(detailsResponse);
  });

  it('should pass the abort signal when fetching an employee by ID', async () => {
    const controller = new AbortController();

    getStub.resolves({
      data: detailsResponse,
    } as never);

    await getEmployeeById(1, controller.signal);

    expect(getStub.calledOnce).to.equal(true);

    const config = getStub.firstCall.args[1] as {
      signal?: AbortSignal;
    };

    expect(config.signal).to.equal(controller.signal);
  });

  it('should create an employee with the provided request', async () => {
    postStub.resolves({
      data: employee,
    } as never);

    const response = await createEmployee(createRequest);

    expect(postStub.calledOnce).to.equal(true);
    expect(postStub.firstCall.args[0]).to.equal('/employees');
    expect(postStub.firstCall.args[1]).to.deep.equal(createRequest);

    expect(response).to.deep.equal(employee);
  });

  it('should update an employee with the provided ID and request', async () => {
    putStub.resolves({
      data: employee,
    } as never);

    const response = await updateEmployee(1, updateRequest);

    expect(putStub.calledOnce).to.equal(true);
    expect(putStub.firstCall.args[0]).to.equal('/employees/1');
    expect(putStub.firstCall.args[1]).to.deep.equal(updateRequest);

    expect(response).to.deep.equal(employee);
  });

  it('should propagate errors when fetching employees fails', async () => {
    const error = new Error('Network unavailable');

    postStub.rejects(error);

    try {
      await getEmployees(searchRequest);
      expect.fail('Expected getEmployees to throw an error');
    } catch (caughtError) {
      expect(caughtError).to.equal(error);
    }
  });

  it('should propagate errors when creating an employee fails', async () => {
    const error = new Error('Employee code already exists.');

    postStub.rejects(error);

    try {
      await createEmployee(createRequest);
      expect.fail('Expected createEmployee to throw an error');
    } catch (caughtError) {
      expect(caughtError).to.equal(error);
    }
  });

  it('should propagate errors when updating an employee fails', async () => {
    const error = new Error('Employee not found');

    putStub.rejects(error);

    try {
      await updateEmployee(1, updateRequest);
      expect.fail('Expected updateEmployee to throw an error');
    } catch (caughtError) {
      expect(caughtError).to.equal(error);
    }
  });
});
