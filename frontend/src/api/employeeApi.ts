
import apiClient from '@/axios/axios';
import type { Employee, EmployeeDetailsResponse, EmploymentStatus } from '@/types/employee';

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

export type EmployeeSortField =
  | 'EMPLOYEE_CODE'
  | 'FIRST_NAME'
  | 'EMAIL'
  | 'JOB_TITLE'
  | 'EMPLOYMENT_STATUS';

export type SortDirection = 'ASC' | 'DESC';

export interface EmployeeSearchFilters {
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

export const getEmployees = async (
  searchRequest: EmployeeSearchRequest,
  signal?: AbortSignal
): Promise<EmployeePageResponse> => {
  const response = await apiClient.post<EmployeePageResponse>(
    '/employees/search',
    searchRequest,
    { signal }
  );

  return response.data;
};

export const getEmployeeById = async (
  employeeId: number,
  signal?: AbortSignal
): Promise<EmployeeDetailsResponse> => {
  const response = await apiClient.get<EmployeeDetailsResponse>(
    `/employees/${employeeId}`,
    { signal }
  );

  return response.data;
};
