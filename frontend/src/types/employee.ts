
export type EmploymentStatus = 'ACTIVE' | 'INACTIVE';

export interface Salary {
  id: number;
  baseSalary: number;
  currencyCode: string;
  effectiveFrom: string;
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
