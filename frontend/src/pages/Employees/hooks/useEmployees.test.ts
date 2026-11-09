import { afterEach, beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';

import apiClient from '../../../axios/axios';
import { useEmployees } from './useEmployees';

describe('useEmployees', () => {
  let postStub: sinon.SinonStub;

  const createPageResponse = (
    content: object[] = [],
    totalElements = content.length,
    totalPages = totalElements > 0 ? 1 : 0,
  ) => ({
    content,
    totalElements,
    totalPages,
  });

  const getRequestBody = (callIndex: number): Record<string, unknown> => {
    return postStub.getCall(callIndex).args[1] as Record<string, unknown>;
  };

  beforeEach(() => {
    postStub = sinon.stub(apiClient, 'post');

    postStub.resolves({
      data: createPageResponse(),
    } as never);
  });

  afterEach(() => {
    cleanup();
    sinon.restore();
  });

  it('should fetch employees when the hook is initialized', async () => {
    const employees = [
      { id: 1, employeeCode: 'EMP001' },
      { id: 2, employeeCode: 'EMP002' },
    ];

    postStub.resolves({
      data: createPageResponse(employees, 2, 1),
    } as never);

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });

    expect(postStub.calledOnce).to.equal(true);

    expect(postStub.firstCall.args[0]).to.equal('/employees/search');

    expect(getRequestBody(0)).to.deep.equal({
      page: 0,
      size: 10,
      sortBy: 'EMPLOYEE_CODE',
      sortDirection: 'ASC',
    });

    expect(result.current.employees).to.deep.equal(employees);
    expect(result.current.totalElements).to.equal(2);
    expect(result.current.totalPages).to.equal(1);
    expect(result.current.error).to.equal(null);
  });

  it('should set loading to true while employees are being fetched', async () => {
    let resolveRequest!: (response: unknown) => void;

    postStub.returns(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }) as never,
    );

    const { result } = renderHook(() => useEmployees());

    expect(result.current.loading).to.equal(true);

    await act(async () => {
      resolveRequest({
        data: createPageResponse(),
      });
    });

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });
  });

  it('should set error when fetching employees fails', async () => {
    postStub.rejects(new Error('Network unavailable'));

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
      expect(result.current.error).to.equal('Network unavailable');
    });

    expect(result.current.employees).to.deep.equal([]);
  });

  it('should apply filters and reset the page to zero', async () => {
    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });

    act(() => {
      result.current.applyFilters({
        searchTerm: 'John',
        countryId: 1,
        departmentId: 2,
      });
    });

    await waitFor(() => {
      expect(postStub.callCount).to.equal(2);
    });

    expect(result.current.page).to.equal(0);

    expect(result.current.filters).to.deep.equal({
      searchTerm: 'John',
      countryId: 1,
      departmentId: 2,
    });

    expect(getRequestBody(1)).to.deep.equal({
      searchTerm: 'John',
      countryId: 1,
      departmentId: 2,
      page: 0,
      size: 10,
      sortBy: 'EMPLOYEE_CODE',
      sortDirection: 'ASC',
    });
  });

  it('should fetch the selected page when pagination changes', async () => {
    postStub.resolves({
      data: createPageResponse([], 30, 3),
    } as never);

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
      expect(result.current.totalPages).to.equal(3);
    });

    act(() => {
      result.current.goToPage(1);
    });

    await waitFor(() => {
      expect(postStub.callCount).to.equal(2);
    });

    expect(result.current.page).to.equal(1);
    expect(getRequestBody(1)).to.deep.equal({
      page: 1,
      size: 10,
      sortBy: 'EMPLOYEE_CODE',
      sortDirection: 'ASC',
    });
  });

  it('should reset the page to zero when page size changes', async () => {
    postStub.resolves({
      data: createPageResponse([], 100, 10),
    } as never);

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });

    // Navigate to page 2.
    act(() => {
      result.current.goToPage(2);
    });

    await waitFor(() => {
      expect(postStub.callCount).to.equal(2);
    });

    // Change page size.
    act(() => {
      result.current.changePageSize(25);
    });

    await waitFor(() => {
      expect(postStub.callCount).to.equal(3);
    });

    expect(result.current.page).to.equal(0);
    expect(result.current.pageSize).to.equal(25);

    expect(getRequestBody(2)).to.deep.equal({
      page: 0,
      size: 25,
      sortBy: 'EMPLOYEE_CODE',
      sortDirection: 'ASC',
    });
  });

  it('should fetch employees using the selected sorting field and direction', async () => {
    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });

    act(() => {
      result.current.changeSort('jobTitle', 'desc');
    });

    await waitFor(() => {
      expect(postStub.callCount).to.equal(2);
    });

    expect(result.current.sort).to.equal('jobTitle,desc');

    expect(getRequestBody(1)).to.deep.equal({
      page: 0,
      size: 10,
      sortBy: 'JOB_TITLE',
      sortDirection: 'DESC',
    });
  });

  it('should refresh employees when refresh is called', async () => {
    const mockEmployeePage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
      first: true,
      last: true,
      empty: true,
    };
    postStub.resolves({
      data: mockEmployeePage,
    });

    const { result } = renderHook(() => useEmployees());

    // Wait for the initial API request.
    await waitFor(() => {
      expect(postStub.callCount).to.equal(1);
    });

    // Trigger refresh.
    act(() => {
      result.current.refresh();
    });

    // Wait for the API request caused by refresh.
    await waitFor(() => {
      expect(postStub.callCount).to.equal(2);
    });
  });

  it('should not fetch employees when an invalid page is requested', async () => {
    postStub.resolves({
      data: createPageResponse([], 30, 3),
    } as never);

    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
      expect(result.current.totalPages).to.equal(3);
    });

    act(() => {
      result.current.goToPage(-1);
      result.current.goToPage(3);
    });

    expect(result.current.page).to.equal(0);
    expect(postStub.calledOnce).to.equal(true);
  });

  it('should not change page size when an invalid page size is provided', async () => {
    const { result } = renderHook(() => useEmployees());

    await waitFor(() => {
      expect(result.current.loading).to.equal(false);
    });

    act(() => {
      result.current.changePageSize(0);
      result.current.changePageSize(-1);
      result.current.changePageSize(1.5);
    });

    expect(result.current.pageSize).to.equal(10);
    expect(postStub.calledOnce).to.equal(true);
  });
});
