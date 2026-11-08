
import { useEffect, useState } from 'react';

import { getEmployees } from '@/api/employeeApi';
import type { Employee } from '@/types/employee';

type SortDirection = 'asc' | 'desc';

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [sort, setSort] = useState('id,asc');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getEmployees(
          {
            page,
            size: pageSize,
            sort,
          },
          controller.signal
        );

        setEmployees(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);
      } catch (error: unknown) {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to fetch employees'
        );
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
  }, [page, pageSize, sort, refreshKey]);

  const goToPage = (newPage: number) => {
    const lastPage = Math.max(totalPages - 1, 0);

    setPage(Math.min(Math.max(newPage, 0), lastPage));
  };

  const changePageSize = (newPageSize: number) => {
    if (!Number.isInteger(newPageSize) || newPageSize < 1) {
      return;
    }

    setPageSize(newPageSize);
    setPage(0);
  };

  const changeSort = (
    field: string,
    direction: SortDirection
  ) => {
    setSort(`${field},${direction}`);
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

    goToPage,
    changePageSize,
    changeSort,
    refresh,
  };
};
