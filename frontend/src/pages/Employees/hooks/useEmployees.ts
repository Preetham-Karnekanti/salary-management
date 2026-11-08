import { useEffect, useState } from 'react';

import { getEmployees, type EmployeeSearchFilters, type EmployeeSortField } from '@/api/employeeApi';

import type { Employee } from '@/types/employee';

const SORT_FIELD_MAP: Record<string, EmployeeSortField> = {
  employeeCode: 'EMPLOYEE_CODE',
  firstName: 'FIRST_NAME',
  email: 'EMAIL',
  jobTitle: 'JOB_TITLE',
  employmentStatus: 'EMPLOYMENT_STATUS',
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Keep the sorting format expected by EmployeeTable.
  const [sort, setSort] = useState('employeeCode,asc');

  // Only applied filters are stored here.
  const [filters, setFilters] = useState<EmployeeSearchFilters>({});

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const [sortField, sortDirectionValue] = sort.split(',');

        const response = await getEmployees(
          {
            ...filters,
            page,
            size: pageSize,
            sortBy: SORT_FIELD_MAP[sortField] ?? 'EMPLOYEE_CODE',
            sortDirection: sortDirectionValue?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC',
          },
          controller.signal,
        );

        setEmployees(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(error instanceof Error ? error.message : 'Failed to fetch employees');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchEmployees();

    return () => {
      controller.abort();
    };
  }, [page, pageSize, sort, filters, refreshKey]);

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) {
      return;
    }

    setPage(newPage);
  };

  const changePageSize = (newPageSize: number) => {
    if (!Number.isInteger(newPageSize) || newPageSize < 1) {
      return;
    }

    setPageSize(newPageSize);
    setPage(0);
  };

  const changeSort = (field: string, direction: 'asc' | 'desc') => {
    setSort(`${field},${direction}`);
    setPage(0);
  };

  const applyFilters = (newFilters: EmployeeSearchFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const refresh = () => {
    setRefreshKey((previousKey) => previousKey + 1);
  };

  return {
    employees,
    loading,
    error,

    page,
    pageSize,
    totalElements,
    totalPages,
    sort,
    filters,

    goToPage,
    changePageSize,
    changeSort,
    applyFilters,
    refresh,
  };
};
