
import apiClient from '@/axios/axios';
import type { Employee } from '@/types/employee';

export interface EmployeePageResponse {
  content: Employee[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EmployeeSearchParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const getEmployees = async (
  params: EmployeeSearchParams = {},
  signal?: AbortSignal
): Promise<EmployeePageResponse> => {
  const response = await apiClient.get<EmployeePageResponse>(
    '/employees',
    {
      params,
      signal,
    }
  );

  return response.data;
};
