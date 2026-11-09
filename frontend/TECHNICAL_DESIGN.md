# Technical Design & Engineering Decisions
## ACME Employee Salary Management System

### 1. Problem Understanding and Product Thinking

ACME manages salary information for approximately 10,000 employees across multiple countries using spreadsheets. This creates challenges around data consistency, salary history tracking, employee discovery, and maintaining reliable information as the organization grows.

The primary user is an HR Manager who needs a centralized system to:

- Manage employee information.
- Maintain accurate salary information for employees.
- Track historical salary changes.
- Search, filter, sort, and paginate employee records.
- Access relevant employee and salary information without navigating multiple spreadsheets.

The central product decision was to treat employee information and salary information as related but independently managed data. This provides a foundation for maintaining employee records while preserving salary history.

### 2. Architecture and Technology Decisions

The application follows a frontend-backend architecture.

| Layer | Technology | Reasoning |
|---|---|---|
| Backend | Java, Spring Boot | Strong typing, mature ecosystem, dependency injection, and maintainable service architecture |
| Database | H2, relational database | Relational modelling and straightforward local development |
| Database migrations | Flyway | Version-controlled and repeatable schema evolution |
| Frontend | React, TypeScript | Component-based UI with compile-time type checking |
| UI library | Material UI | Consistent, accessible components and responsive layouts |
| HTTP communication | Axios | Centralized API communication and request cancellation |
| Testing | JUnit, Mocha, Chai, Sinon, React Testing Library | Unit and component-level verification |

The backend uses a layered structure:

- **Controller:** Handles HTTP requests, validates input, and returns responses.
- **Service:** Contains business logic and coordinates operations.
- **Repository:** Handles database access.
- **Entity:** Represents persisted domain objects.
- **DTO:** Defines API request and response contracts.
- **Mapper:** Separates entity-to-response conversion from business logic.

This separation keeps responsibilities focused and makes individual components easier to test and maintain.

### 3. Data Modelling and Salary History

One of the important design decisions was to maintain employee and salary information in separate tables.

An employee can have multiple salary records over time, but only one salary record should be considered current.

Each salary record maintains:

- Employee reference.
- Salary amount and currency.
- Effective start date.
- Effective end date.

The current salary is identified by a record whose `effectiveTo` is null.

**Why maintain salary history instead of updating a single salary column?**

Updating salary directly on the employee record would overwrite historical information. HR would lose the ability to understand previous compensation and when changes took effect.

With separate salary records, updating an employee's salary closes the previous record and creates a new one. This preserves historical information and provides a foundation for future compensation analysis.

An initial salary record is created when an employee is created, ensuring that every employee has an associated current salary.

Salary history is only updated when the salary details actually change. This avoids creating unnecessary historical records during unrelated employee updates.

### 4. API and Backend Design Decisions

The API is designed around employee management and reference data.

Key capabilities include:

- Employee creation and updates.
- Employee details retrieval.
- Employee search with filtering, sorting, and pagination.
- Salary history retrieval as part of employee details.
- Country and department reference data.

**Search and filtering**

Employee search is implemented using Spring Data JPA Specifications rather than creating separate repository methods for every possible filter combination.

This allows search criteria to be composed dynamically.

For example:

- Search term matches employee name, employee code, or email.
- Employment status, country, and department filters can be combined.
- Search conditions are combined with filters without requiring a separate endpoint for each combination.

Pagination and sorting are handled by the backend rather than loading all employee records into the browser.

This is important for the 10,000-employee use case because the client should only receive the records required for the current page.

**Salary retrieval**

Salary information is retrieved through the SalaryService instead of embedding salary fetching in every employee repository query.

For employee listings, current salaries are retrieved in batches using employee IDs and assembled into a map. This avoids making an individual salary query for every employee and reduces the risk of an N+1 query problem.

### 5. Frontend Architecture and User Experience

The frontend follows a component-based structure, separating page-level orchestration, reusable components, API communication, and business-related hooks.

The employee management page is divided into:

- Employee table.
- Search and filter controls.
- Employee creation and editing form.
- Employee details dialog.
- Salary history presentation.

**Why server-side pagination and filtering?**

Loading all 10,000 employees into the browser would increase network transfer, memory consumption, and rendering work.

Instead, search, sorting, filtering, and pagination are performed through the backend API. The frontend manages the current page and filter state.

Search input uses a debounce mechanism to avoid issuing an API request for every keystroke. Request cancellation through AbortController prevents outdated requests from unnecessarily updating the UI when newer requests are initiated.

**Why use a shared employee form?**

Employee creation and editing share most of their fields and validation requirements. A common form component avoids duplicated UI and validation logic while allowing different initial values and submission behavior.

**Why separate employee details from the listing?**

The employee list is optimized for scanning and discovery. Detailed employee information and salary history are fetched when the user opens an employee's details.

This avoids loading historical salary information for every employee in the listing.

### 6. Scalability and Performance Considerations

The initial design considers the expected 10,000-employee dataset.

The following decisions help keep the application efficient:

- Server-side pagination instead of retrieving all employee records.
- Dynamic database queries for search and filtering.
- Batched current-salary retrieval to avoid N+1 queries.
- Debounced frontend search.
- Cancellation of obsolete HTTP requests.
- Lazy retrieval of detailed employee and salary-history information.

These decisions provide a reasonable starting point for the expected dataset.

For a production deployment with larger datasets or higher concurrency, further work would include reviewing query execution plans, adding indexes based on actual query patterns, introducing database-level performance monitoring, and evaluating connection-pool configuration.

### 7. Testing Strategy and Code Quality

Testing focuses on verifying application behavior rather than implementation details.

**Backend testing**

- Service-layer business logic.
- Controller behavior and API contracts.
- Salary creation and update behavior.
- Salary-history consistency.
- Validation and error scenarios.

**Frontend testing**

- API functions and request parameters.
- Employee filtering and debounce behavior.
- Form creation and editing.
- Employee details and salary history.
- Employee table interactions.
- Hook behavior, including pagination, sorting, refresh, and request cancellation.
- Layout behavior, navigation, and responsive interactions.

The frontend uses Mocha, Chai, Sinon, and React Testing Library.

Tests are designed to be deterministic, isolate external dependencies, and verify observable behavior. Asynchronous operations are tested by waiting for their expected outcomes instead of relying on arbitrary delays.

### 8. AI-Assisted Development Approach

AI tools were used as development accelerators throughout the implementation.

The approach was deliberately iterative:

1. Break the assessment into smaller functional requirements.
2. Discuss architecture and data-modelling decisions before implementation.
3. Use AI to explore implementation alternatives and identify trade-offs.
4. Implement functionality incrementally.
5. Review generated code for correctness, consistency, and unnecessary complexity.
6. Validate behavior through compilation, execution, and automated tests.
7. Refine the implementation when testing exposed issues.

AI assistance was particularly useful for exploring Spring Boot design patterns, React component structure, API contracts, test scenarios, and edge cases.

However, AI-generated suggestions were treated as proposals rather than automatically accepted solutions. Design decisions were evaluated against the actual requirements and existing application structure.

The objective was to use AI to improve development speed while retaining engineering ownership of the implementation.

### 9. Deliberate Trade-offs and Future Improvements

The implementation prioritizes a maintainable foundation and the core HR workflows rather than introducing infrastructure that is not immediately necessary.

Some deliberate trade-offs include:

| Decision | Trade-off |
|---|---|
| H2 database | Simplifies local setup; production deployment would require an appropriate persistent database configuration |
| Separate salary table | Requires additional queries and service coordination but preserves compensation history |
| Salary retrieval through SalaryService | Keeps responsibilities separate; batch retrieval avoids per-employee queries |
| Server-side search and pagination | Requires API coordination but scales better than client-side filtering |
| Shared employee form | Reduces duplication but requires careful handling of create and update modes |

Potential future improvements include:

- Role-based access control and fine-grained authorization.
- Audit logging for employee and salary modifications.
- Bulk employee import and export.
- Compensation analytics across countries and departments.
- Salary budget reporting and currency normalization.
- Database indexing and query optimization based on measured workloads.
- Production database, deployment, monitoring, and backup configuration.
- Additional integration and end-to-end tests.

### 10. Engineering Philosophy

The guiding principle throughout this assessment was to solve the actual business problem with the simplest maintainable design that supports the expected scale.

The focus was on preserving important business data, keeping responsibilities separated, minimizing unnecessary database and network operations, making the UI efficient for HR workflows, and validating behavior through automated tests.

The intention was not to build the most complex architecture, but to make decisions that are understandable, defensible, and capable of evolving as ACME's requirements grow.