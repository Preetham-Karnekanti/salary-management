
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';

export interface Salary {
  id: number;
  baseSalary: number;
  currencyCode: string;
  effectiveFrom: string;
  effectiveTo: string | null;
}

export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  countryId: number;
  countryName: string;
  departmentId: number;
  departmentName: string;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  hireDate: string;
  currentSalary: Salary;
}

export interface EmployeeDetailsResponse {
  employee: Employee;
  salaryHistory: Salary[];
}


export type EmployeeSortField =
  | 'EMPLOYEE_CODE'
  | 'FIRST_NAME'
  | 'EMAIL'
  | 'JOB_TITLE'
  | 'EMPLOYMENT_STATUS';
