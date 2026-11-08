import apiClient from '@/axios/axios';

import type { Employee, EmployeeDetailsResponse, EmploymentStatus, EmployeeCreateRequest } from '@/types/employee';

export type EmployeeSortField =
  'EMPLOYEE_CODE' | 'FIRST_NAME' | 'EMAIL' | 'JOB_TITLE' | 'EMPLOYMENT_STATUS' | 'COUNTRY' | 'DEPARTMENT';

export type SortDirection = 'ASC' | 'DESC';

export interface EmployeeSearchFilters {
  searchTerm?: string;
  employmentStatus?: EmploymentStatus;
  countryId?: number;
  departmentId?: number;
}

export interface EmployeeSearchRequest extends EmployeeSearchFilters {
  page: number;
  size: number;
  sortBy: EmployeeSortField;
  sortDirection: SortDirection;
}

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

export const getEmployees = async (
  searchRequest: EmployeeSearchRequest,
  signal?: AbortSignal,
): Promise<EmployeePageResponse> => {
  const response = await apiClient.post<EmployeePageResponse>('/employees/search', searchRequest, {
    signal,
  });

  return response.data;
};

export const getEmployeeById = async (employeeId: number, signal?: AbortSignal): Promise<EmployeeDetailsResponse> => {
  const response = await apiClient.get<EmployeeDetailsResponse>(`/employees/${employeeId}`, {
    signal,
  });

  return response.data;
};

export const createEmployee = async (request: EmployeeCreateRequest): Promise<Employee> => {
  const response = await apiClient.post<Employee>('/employees', request);

  return response.data;
};
