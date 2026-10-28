# 🏨 Hostel SaaS — Hostel & PG Management Platform

A modern, secure, multi-tenant SaaS platform designed to simplify hostel and Paying Guest (PG) management through centralized administration, student self-service, accommodation management, billing, payments, leave management, complaints, and operational reporting.

The platform is designed to support multiple independent hostel businesses, each managing its own properties, students, rooms, staff, fees, and day-to-day operations from a single application.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [Project Objectives](#-project-objectives)
- [Key Features](#-key-features)
- [User Roles](#-user-roles)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Multi-Tenant Architecture](#-multi-tenant-architecture)
- [Core Modules](#-core-modules)
- [Student Portal](#-student-portal)
- [Student Management Workflow](#-student-management-workflow)
- [Fees and Payment Management](#-fees-and-payment-management)
- [Leave Management](#-leave-management)
- [Complaint Management](#-complaint-management)
- [Database Architecture](#-database-architecture)
- [Security and Access Control](#-security-and-access-control)
- [Development Environment Setup](#-development-environment-setup)
- [Environment Variables](#-environment-variables)
- [Database Commands](#-database-commands)
- [Development Workflow](#-development-workflow)
- [Phase-Wise Roadmap](#-phase-wise-roadmap)
- [Phase 2 Task Allocation](#-phase-2-task-allocation)
- [Testing Strategy](#-testing-strategy)
- [Git and Contribution Guidelines](#-git-and-contribution-guidelines)
- [Deployment Strategy](#-deployment-strategy)
- [Future Enhancements](#-future-enhancements)
- [Project Status](#-project-status)

---

## 🚀 Project Overview

Hostel SaaS is a multi-tenant Hostel and PG Management System that digitizes the complete accommodation management lifecycle.

Traditional hostel management often relies on spreadsheets, paper records, manual fee tracking, and disconnected communication channels. This platform aims to replace those processes with a centralized, secure, and easy-to-use digital solution.

The platform will allow hostel administrators to manage students, accommodation, fee collection, leave requests, complaints, and property operations. Students will have their own secure login through which they can view their information, manage their requests, track fees, and interact with hostel management.

### Example Use Case

An organization operates a hostel named **ASP Hostel**.

1. The hostel administrator logs into the admin dashboard.
2. The administrator registers a new student.
3. The system generates a unique Student ID.
4. The student receives a secure account activation process.
5. The student logs into the student portal.
6. The student views personal details, hostel information, room allocation, and fee records.
7. The administrator generates a hostel fee invoice for ₹5,000.
8. The student opens the Fees section and initiates a demo payment.
9. The system records the simulated transaction and updates the invoice balance.
10. The student submits leave applications and complaints through the portal.
11. Authorized hostel staff review and process these requests.

The goal is to make these operations traceable, secure, and accessible from a single platform.

---

## 🎯 Project Objectives

- Build a production-oriented Hostel/PG Management SaaS.
- Support multiple organizations and properties.
- Maintain strict tenant-level data isolation.
- Simplify student registration and admission management.
- Provide secure student self-service accounts.
- Manage buildings, floors, rooms, beds, and allocations.
- Automate fee tracking and invoice management.
- Implement a working demo-payment workflow before enabling real payments.
- Allow students to apply for leave and track approval status.
- Allow students to raise complaints and monitor resolutions.
- Provide hostel contact information and notifications.
- Maintain payment history and audit trails.
- Build a responsive, professional user interface.
- Establish a maintainable architecture that can evolve as the product grows.

---

## ✨ Key Features

### 1. Platform Administration

- Centralized Super Admin dashboard.
- Organization and tenant management.
- Property onboarding and management.
- Platform-level analytics.
- User and account management.
- Subscription management architecture.
- Platform activity monitoring.
- Tenant status management.

### 2. Hostel and Property Management

- Create and manage hostel/PG properties.
- Store property addresses and contact information.
- Manage multiple buildings within a property.
- Manage floors, rooms, and beds.
- Track room capacity and bed availability.
- Track occupied and vacant accommodation.
- Support bed allocation, transfer, and vacating.
- Maintain allocation history.

### 3. Student Management

- Student registration and profile management.
- Automatic Student ID generation.
- Guardian and emergency contact details.
- Admission information.
- Student account provisioning.
- Profile and document management.
- Student status tracking.
- Hostel and room information.
- Student admission and allocation history.

### 4. Fee Management

- Hostel rent.
- Mess fees.
- Electricity charges.
- Maintenance charges.
- Laundry fees.
- Admission fees.
- Security deposits.
- Penalties and miscellaneous charges.
- Invoice generation.
- Upcoming and overdue fee tracking.
- Partial payments, where supported.
- Payment history and receipts.
- Outstanding balance calculation.

### 5. Student Portal

- Secure student login.
- Personal profile.
- Hostel and room information.
- Fee dashboard.
- Upcoming fee notifications.
- Demo payment workflow.
- Payment history.
- Leave applications.
- Complaint submission and tracking.
- Hostel contact details.

### 6. Leave Management

- Student leave applications.
- Start and end dates.
- Automatic leave duration calculation.
- Leave reason and destination.
- Approval and rejection by authorized staff.
- Leave history.
- Application status tracking.
- Rejection reasons and audit history.

### 7. Complaint Management

- Complaint creation.
- Complaint categories.
- Complaint status tracking.
- Complaint history.
- Staff assignment, where supported.
- Resolution notes.
- Student-visible responses.
- Internal administrative notes.

### 8. Security and Auditing

- Authentication and authorization.
- Role-based access control.
- Tenant isolation.
- Protected APIs.
- Input validation.
- Secure password management.
- Payment transaction integrity.
- Audit logging for important operations.

---

## 👥 User Roles

The platform is designed around separate user roles and permission boundaries.

| Role | Responsibilities |
|---|---|
| Super Admin | Manages the SaaS platform, organizations, and platform-level settings. |
| Organization Owner | Manages an organization's properties and authorized users. |
| Property Admin | Manages students, accommodation, invoices, leave requests, and complaints for assigned properties. |
| Manager | Handles assigned operational activities. |
| Accountant | Manages authorized invoices, payments, collections, and financial reports. |
| Receptionist | Handles student registration and permitted administrative tasks. |
| Staff | Handles assigned hostel operations and complaints. |
| Student | Views personal information, fees, payment history, leaves, complaints, and hostel contacts. |

Permissions must be configurable according to the existing RBAC architecture. Access should not depend solely on hiding or displaying frontend navigation items.

---

## 🏗️ System Architecture

The initial architecture follows a **modular monolith** approach.

This keeps development and deployment manageable while allowing business modules to remain logically separated.

```text
                         HOSTEL SAAS
                              |
              +---------------+---------------+
              |                               |
       Super Admin Portal               Hostel Portal
              |                               |
              +---------------+---------------+
                              |
                         Next.js Web
                              |
                         NestJS API
                              |
             +----------------+----------------+
             |                |                |
       Authentication     Business Logic    Authorization
             |                |                |
             +----------------+----------------+
                              |
       +----------------------+----------------------+
       |          |           |          |           |
    Property   Student     Admission   Billing    Operations
    Management Management  Management  & Payment  Management
       |          |           |          |           |
       +----------------------+----------------------+
                              |
                           Prisma ORM
                              |
                         PostgreSQL
                              |
              +---------------+---------------+
              |               |               |
            Redis       Object Storage    External APIs
              |                               |
        Background Jobs                   Razorpay
                                          (Later)
```

### Architectural Principles

- Clear module boundaries.
- Reusable business services.
- Centralized authentication and authorization.
- Tenant-aware database operations.
- Database transactions for critical operations.
- Secure API communication.
- Consistent validation and error handling.
- Auditable financial operations.
- Reusable UI components.
- Automated tests for critical business rules.
- Avoid unnecessary microservices during initial development.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js | Web application and routing |
| React | Component-based user interface |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Reusable UI components |
| TanStack Query | Server-state management |
| React Hook Form | Form management |
| Zod | Input validation |

### Backend

| Technology | Purpose |
|---|---|
| NestJS | Backend application framework |
| Node.js | JavaScript runtime |
| TypeScript | Type-safe backend development |
| Prisma | ORM and database access |
| REST API | Communication between frontend and backend |

### Infrastructure

| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database |
| Docker Desktop | Local infrastructure |
| Docker Compose | Local service orchestration |
| Redis | Caching and background-job infrastructure, where required |
| BullMQ | Background-job processing, if adopted |
| S3-compatible storage | Student documents and generated files |

### Integrations

- Razorpay for future real payment processing.
- Email provider for account activation and notifications.
- SMS/WhatsApp providers where required.
- Object storage for document management.

**Database decision:** PostgreSQL is the primary database for this project. Local development should use an isolated Docker container rather than changing the existing MySQL environments used by other projects.

---

## 📂 Project Structure

The following is the proposed target structure. Adapt it to the existing repository rather than duplicating folders or moving working modules unnecessarily.

```text
hostel-saas/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── admin/
│   │   │   ├── student/
│   │   │   │   ├── home/
│   │   │   │   ├── fees/
│   │   │   │   ├── leaves/
│   │   │   │   ├── complaints/
│   │   │   │   ├── contact/
│   │   │   │   └── profile/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── package.json
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── tenants/
│       │   ├── properties/
│       │   ├── students/
│       │   ├── admissions/
│       │   ├── buildings/
│       │   ├── floors/
│       │   ├── rooms/
│       │   ├── beds/
│       │   ├── allocations/
│       │   ├── fee-plans/
│       │   ├── invoices/
│       │   ├── payments/
│       │   ├── leaves/
│       │   ├── complaints/
│       │   ├── notifications/
│       │   ├── reports/
│       │   ├── audit/
│       │   └── main.ts
│       └── package.json
│
├── packages/
│   ├── shared-types/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   ├── api-design.md
│   ├── business-rules.md
│   ├── multi-tenancy.md
│   └── deployment.md
│
├── docker-compose.yml
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

---

## 🏢 Multi-Tenant Architecture

Multi-tenancy allows multiple hostel businesses to use the same SaaS platform without accessing each other's private information.

### Hierarchy

```text
Platform
   |
   +-- Organization A
   |      |
   |      +-- ASP Hostel, Pune
   |      |      +-- Building A
   |      |      +-- Building B
   |      |
   |      +-- ASP PG, Mumbai
   |
   +-- Organization B
          |
          +-- City Hostel
                 +-- Building A
```

### Tenant Isolation Rules

- Each organization has a unique identifier.
- Each property belongs to an organization.
- Students belong to the appropriate organization/property through the established domain relationships.
- Users receive access through authorized memberships.
- Backend services must derive tenant context from authenticated identity and verified memberships.
- Every tenant-owned query must enforce the correct access scope.
- Redis cache keys must include appropriate tenant context.
- Background jobs must carry verified tenant/property identifiers.
- Documents must be stored and accessed using tenant-aware authorization.
- Financial reports must only include records the requesting user is authorized to access.

Never rely on a frontend-supplied `tenantId` or `propertyId` as proof of authorization.

---

## 📦 Core Modules

### 1. Authentication and User Management

Responsibilities:

- Login and logout.
- Password hashing.
- Account activation.
- Password reset.
- Session/refresh-token management.
- Role and permission assignment.
- Protected routes.
- Account status management.

### 2. Property Management

Responsibilities:

- Organization and property records.
- Property contact details.
- Building and floor management.
- Room and bed management.
- Capacity and occupancy tracking.
- Property-specific configuration.

### 3. Student Management

Responsibilities:

- Student registration.
- Student ID generation.
- Personal details.
- Guardian information.
- Emergency contacts.
- Student documents.
- Student login provisioning.
- Student profile updates.
- Student account status.

### 4. Admission Management

Responsibilities:

- Admission records.
- Admission dates and status.
- Fee plan association.
- Admission verification.
- Stay period.
- Admission history.

### 5. Room and Bed Allocation

Responsibilities:

- Assign a student to a bed.
- Track current occupancy.
- Transfer a student.
- Vacate a bed.
- Preserve allocation history.
- Prevent duplicate active allocations.

### 6. Fee and Invoice Management

Responsibilities:

- Fee plans.
- Invoice generation.
- Invoice items.
- Billing periods.
- Discounts and charges.
- Payment tracking.
- Outstanding balance calculation.
- Overdue status.
- Receipts.

### 7. Payment Management

Responsibilities:

- Payment attempts.
- Transaction references.
- Demo payment processing.
- Payment history.
- Idempotency.
- Refund architecture.
- Future Razorpay integration.

### 8. Leave Management

Responsibilities:

- Leave application submission.
- Date validation.
- Leave duration calculation.
- Approval/rejection.
- Application history.
- Status notifications.

### 9. Complaint Management

Responsibilities:

- Complaint creation.
- Complaint categorization.
- Complaint assignment.
- Status updates.
- Internal notes.
- Student-visible responses.
- Resolution history.

### 10. Notification Management

Responsibilities:

- In-app notifications.
- Account activation notifications.
- Fee reminders.
- Payment status notifications.
- Leave decision notifications.
- Complaint status notifications.

### 11. Reporting and Analytics

Responsibilities:

- Student reports.
- Occupancy reports.
- Fee collection reports.
- Outstanding balance reports.
- Leave reports.
- Complaint reports.
- Property-level analytics.

---

## 🎓 Student Portal

The student portal is a dedicated interface for students to manage their hostel-related activities.

### Navigation

```text
Student Portal
│
├── Home
├── Fees
├── Leaves
├── Complaints
├── Contact Hostel
├── My Profile
└── Logout
```

### Home

Display:

- Student name.
- Student ID.
- Hostel name.
- Current room and bed.
- Admission status.
- Outstanding fee balance.
- Upcoming fee due dates.
- Recent payment activity.
- Leave application status.
- Complaint status.
- Hostel contact details.

### Fees

Display:

- Fee category.
- Invoice reference.
- Billing period.
- Due date.
- Total amount.
- Amount paid.
- Outstanding amount.
- Invoice status.
- Payment history.
- Receipt/download option, where implemented.

### Leaves

Display:

- Apply for Leave.
- Start date and end date.
- Calculated duration.
- Leave reason.
- Application date.
- Current status.
- Approval/rejection details.
- Leave history.

### Complaints

Display:

- Raise Complaint.
- Complaint category.
- Complaint description.
- Complaint reference.
- Created date.
- Current status.
- Resolution details.
- Complaint history.

### Contact Hostel

Display configured:

- Hostel name.
- Address.
- Office phone.
- Email.
- Emergency contact.
- Office hours.
- Hostel help information.

### My Profile

Display personal information, guardian information, emergency contacts, and current hostel allocation. Students may edit only the fields permitted by the system's business rules.

---

## 🔄 Student Management Workflow

### Student Registration

```text
Hostel Admin Login
        |
        v
Open Student Management
        |
        v
Register Student
        |
        v
Enter Personal Details
        |
        v
Enter Guardian Details
        |
        v
Select Property and Admission Details
        |
        v
Generate Unique Student ID
        |
        v
Provision Student Account
        |
        v
Student Activates Account
        |
        v
Student Logs In
        |
        v
Student Portal Access
```

### Important Rules

- Student IDs must be generated on the backend.
- Duplicate identifiers must be prevented.
- Authentication accounts and student profiles must be linked correctly.
- Student credentials must never be stored in plain text.
- Account activation links should expire and be single-use.
- Student access must be restricted to the authenticated student's own records.

---

## 💰 Fees and Payment Management

The system must distinguish between the invoice, the payment attempt, and the confirmed transaction.

### Fee Lifecycle

```text
Admin Creates Invoice
        |
        v
Invoice Issued
        |
        v
Student Views Invoice
        |
        v
Student Initiates Payment
        |
        v
Backend Validates Invoice
        |
        v
Payment Attempt Created
        |
        v
Payment Processed
        |
        v
Transaction Recorded
        |
        v
Invoice Balance Recalculated
        |
        v
Payment History Updated
```

### Supported Fee Categories

- Hostel rent.
- Mess fees.
- Electricity.
- Maintenance.
- Laundry.
- Admission charges.
- Security deposits.
- Penalties.
- Miscellaneous charges.

### Invoice Statuses

- `DRAFT`
- `ISSUED`
- `PARTIALLY_PAID`
- `PAID`
- `OVERDUE`
- `CANCELLED`
- `REFUNDED`, where applicable to the financial model.

### Demo Payment Mode

During development, the platform will support simulated payments.

Example:

```text
Invoice Reference: INV-2026-0001
Student ID: ASP-2026-0001
Fee Category: Hostel Rent
Invoice Amount: ₹5,000
Amount Paid: ₹0
Outstanding: ₹5,000
Status: ISSUED
```

The student clicks **Pay Now**.

The payment form automatically displays:

- Student name.
- Student ID.
- Registered mobile number.
- Registered email.
- Invoice reference.
- Amount due.

After confirmation, the backend processes the simulated payment and updates the payment history and invoice balance.

Demo transactions must be explicitly identified as simulated payments. They must not be represented as actual bank transactions.

The real Razorpay integration will be implemented separately, using verified server-side payment events and webhooks.

---

## 🏖️ Leave Management

### Student Workflow

```text
Student Logs In
       |
       v
Opens Leaves
       |
       v
Selects Start Date and End Date
       |
       v
Enters Leave Reason
       |
       v
Submits Application
       |
       v
Status: PENDING
       |
       v
Hostel Admin Reviews
       |
       +------------------+
       |                  |
       v                  v
    APPROVED            REJECTED
       |                  |
       +---------+--------+
                 |
                 v
         Student Sees Status
```

### Leave Statuses

- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

### Business Rules

- End date cannot precede start date.
- Duration must be calculated on the backend.
- The system must document its inclusive/exclusive date-counting convention.
- Unauthorized users cannot approve leave.
- Students may cancel pending requests where permitted.
- Approved leave does not automatically vacate a student's bed.
- Leave decisions must record the responsible staff member and timestamp.

---

## 🛠️ Complaint Management

### Complaint Categories

- Room-related issues.
- Plumbing.
- Electricity.
- Cleaning.
- Mess and food.
- Wi-Fi.
- Maintenance.
- Security.
- Staff/service.
- Other.

### Complaint Lifecycle

```text
Student Submits Complaint
          |
          v
         OPEN
          |
          v
      IN_PROGRESS
          |
          v
       RESOLVED
          |
          v
        CLOSED
```

Reopening a complaint may be supported according to the configured rules.

### Complaint Management Requirements

- Each complaint receives a unique reference.
- The complaint is associated with the authenticated student and authorized property.
- Students can see their own complaints only.
- Authorized staff can update complaint statuses.
- Internal notes must remain private.
- Student-visible responses must be stored separately from internal notes.
- Status changes and resolution details must be auditable.

---

## 🗄️ Database Architecture

PostgreSQL is the primary database.

Prisma manages schema definitions, migrations, and application-level database access.

### Main Entity Groups

#### Identity and Tenant

- `User`
- `Organization`
- `OrganizationMember`
- `PropertyMember`
- `Role`
- `Permission`
- `UserRole`
- `RolePermission`

#### Property and Accommodation

- `Property`
- `Building`
- `Floor`
- `Room`
- `Bed`
- `BedAllocation`
- `AllocationHistory`

#### Student and Admission

- `Student`
- `StudentGuardian`
- `StudentDocument`
- `Admission`

#### Fees and Payments

- `FeePlan`
- `FeePlanItem`
- `Invoice`
- `InvoiceItem`
- `Payment`
- `PaymentTransaction`
- `PaymentAttempt`
- `Receipt`
- `Refund`

#### Student Operations

- `LeaveRequest`
- `Complaint`
- `ComplaintComment`
- `Notification`
- `AuditLog`

These are proposed domain entities. Reuse the existing schema where equivalent models already exist and introduce new models only when needed.

### Database Design Principles

- Use foreign keys and unique constraints.
- Index frequently queried columns.
- Scope tenant-owned data appropriately.
- Preserve financial history.
- Use transactions for critical multi-record operations.
- Use suitable decimal types for monetary amounts.
- Avoid floating-point arithmetic for money.
- Use database migrations to evolve the schema.
- Prevent duplicate payment processing.
- Enforce bed-allocation invariants at the database/service level.

---

## 🔐 Security and Access Control

Security is a core requirement, not an optional enhancement.

### Authentication

- Secure password hashing.
- Protected routes.
- Secure token/session management.
- Account activation.
- Password reset.
- Logout and session revocation where supported.

### Authorization

- Role-based and permission-based access control.
- Backend validation for every protected operation.
- Student ownership verification.
- Property membership verification.
- Organization/tenant isolation.
- Least-privilege access.

### Payment Security

- Students cannot modify invoice totals.
- Students cannot mark their own payments successful.
- Duplicate payment requests must not produce duplicate financial entries.
- Payment amounts must be validated against the authoritative invoice balance.
- Real payment integrations must use verified server-side events.
- Payment secrets must never be committed to source control.

### Data Protection

- Validate file uploads.
- Restrict access to identity documents.
- Avoid exposing sensitive information in logs.
- Do not return private records from other tenants.
- Maintain audit trails for important administrative and financial actions.

---

## 💻 Development Environment Setup

### Prerequisites

Install the following:

- Git.
- Node.js LTS.
- npm.
- Docker Desktop for Windows.
- VS Code or another suitable IDE.

Docker Desktop requires its supported Windows virtualization/WSL configuration.

PostgreSQL and Redis will run in Docker for local development. A separate local MySQL installation is not required for this project.

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd hostel-saas
```

Replace `<YOUR_REPOSITORY_URL>` with the actual repository URL.

### 2. Install Dependencies

Follow the repository's existing package manager and workspace configuration.

For a standard npm project:

```bash
npm install
```

If the project uses npm workspaces, install dependencies from the repository root.

### 3. Configure Environment Variables

Create a local `.env` file based on `.env.example`.

```bash
cp .env.example .env
```

On Windows, you can copy the file manually if the command is unavailable in your terminal.

Configure the database connection and other required variables.

### 4. Start Local Infrastructure

From the directory containing `docker-compose.yml`:

```bash
docker compose up -d
```

Verify the running services:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

### 5. Run Database Migrations

Use the repository's existing Prisma setup:

```bash
npx prisma generate
npx prisma migrate dev
```

Run seed scripts only if they exist and are configured for your local environment.

### 6. Start the Application

Use the scripts defined in the project's `package.json`.

For example, if the repository has separate frontend and backend applications:

```bash
npm run dev
```

The actual command depends on the workspace configuration. Confirm the scripts in `package.json` before running them.

---

## ⚙️ Environment Variables

Maintain a `.env.example` containing variable names and safe placeholders.

Example:

```env
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# PostgreSQL
DATABASE_URL=postgresql://hostel_admin:CHANGE_ME@localhost:5432/hostel_saas

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
JWT_ACCESS_SECRET=CHANGE_ME
JWT_REFRESH_SECRET=CHANGE_ME
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# Storage - configure when implemented
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# Email - configure when implemented
EMAIL_FROM=
EMAIL_PROVIDER_API_KEY=

# Payment configuration
PAYMENT_MODE=DEMO
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

### Environment Variable Rules

- Never commit the actual `.env` file.
- Never use example secrets in production.
- Generate strong authentication secrets.
- Keep payment credentials server-side.
- Do not enable real payments merely by setting frontend variables.
- Configure real payment processing only after server-side verification and webhook handling are implemented.
- Validate required variables during application startup.

Variable names must match the actual configuration used by the application.

---

## 🐳 Docker Configuration

Docker Compose provides isolated local infrastructure for the Hostel SaaS.

A basic development configuration may look like:

```yaml
services:
  postgres:
    image: postgres:17
    container_name: hostel-saas-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: hostel_saas
      POSTGRES_USER: hostel_admin
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - hostel_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test:
        - CMD-SHELL
        - pg_isready -U hostel_admin -d hostel_saas
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7
    container_name: hostel-saas-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - hostel_redis_data:/data

volumes:
  hostel_postgres_data:
  hostel_redis_data:
```

This is a development configuration. Set `POSTGRES_PASSWORD` in the local environment or an appropriate untracked environment file before starting the containers.

For production, configure authentication, private networking, backups, monitoring, and managed secrets appropriately.

### Useful Docker Commands

Start services:

```bash
docker compose up -d
```

Stop services without removing data:

```bash
docker compose down
```

View running containers:

```bash
docker compose ps
```

View PostgreSQL logs:

```bash
docker compose logs -f postgres
```

View Redis logs:

```bash
docker compose logs -f redis
```

**Important:** Avoid `docker compose down -v` unless you intentionally want to delete the associated Docker volumes and their stored development data.

---

## 🗃️ Database Commands

Generate Prisma Client:

```bash
npx prisma generate
```

Create a development migration:

```bash
npx prisma migrate dev --name describe_the_change
```

Check migration status:

```bash
npx prisma migrate status
```

Open Prisma Studio:

```bash
npx prisma studio
```

Deploy existing migrations in a deployment environment:

```bash
npx prisma migrate deploy
```

Do not use development migration commands indiscriminately against production databases. Review migrations and take appropriate backups before deployment.

---

## 🔄 Development Workflow

The development process follows this sequence:

```text
Requirements
     |
     v
Architecture Review
     |
     v
Database Design
     |
     v
API Contracts
     |
     v
Backend Implementation
     |
     v
Frontend Integration
     |
     v
Automated Testing
     |
     v
Integration Testing
     |
     v
Security Review
     |
     v
Deployment
```

### Development Principles

1. Inspect existing code before modifying it.
2. Reuse existing domain entities and components.
3. Agree on API contracts before parallel development.
4. Keep business logic in the appropriate backend services.
5. Validate input on the server.
6. Use database migrations.
7. Add tests for important business rules.
8. Keep frontend components reusable.
9. Never hardcode production data into dashboard components.
10. Document new environment variables and API behavior.
11. Avoid unrelated changes in shared modules.
12. Test existing functionality after integration.

