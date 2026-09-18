# Master Web Application Production-Readiness Checklist

A technology-agnostic, actionable, and detailed pre-production audit checklist designed for solo developers and development teams deploying web applications to production.

---

## Overview & Scope Guidance

Not every application requires every item on this list. Use the following scope markers for each task:

*   **[Required]**: Essential for all applications before deployment.
*   **[Recommended]**: Best practice; skip only with conscious acceptance of risk.
*   **[If Applicable]**: Architecture-dependent (e.g., backend, database, payments, user authentication).

> ⚠️ **When a Checklist is Not Enough**: High-risk domains (e.g., handling sensitive personal health data, compliance like HIPAA/GDPR, payment processing, complex cryptography) require specialized external audits, penetration testing, or legal review beyond this checklist.

---

## Checklist Index

1. [Application & Feature Completeness](#1-application--feature-completeness)
2. [Requirements & Business Logic](#2-requirements--business-logic)
3. [Code Quality](#3-code-quality)
4. [Dependencies & Packages](#4-dependencies--packages)
5. [Environment Configuration](#5-environment-configuration)
6. [Secrets & Credentials](#6-secrets--credentials)
7. [Authentication](#7-authentication-if-applicable)
8. [Authorization & Access Control](#8-authorization--access-control)
9. [Frontend Security](#9-frontend-security)
10. [Backend & API Security](#10-backend--api-security-if-applicable)
11. [Database](#11-database-if-applicable)
12. [Data Integrity](#12-data-integrity)
13. [File & Image Uploads](#13-file--image-uploads-if-applicable)
14. [API & Network Communication](#14-api--network-communication)
15. [Error Handling](#15-error-handling)
16. [Loading, Empty & Offline States](#16-loading-empty--offline-states)
17. [Forms](#17-forms)
18. [Accessibility (a11y)](#18-accessibility-a11y)
19. [Responsive Design](#19-responsive-design)
20. [Browser Compatibility](#20-browser-compatibility)
21. [Performance](#21-performance)
22. [SEO (Search Engine Optimization)](#22-seo-search-engine-optimization)
23. [Routing](#23-routing)
24. [Email & Notifications](#24-email--notifications-if-applicable)
25. [Third-Party Services](#25-third-party-services)
26. [Logging](#26-logging)
27. [Monitoring](#27-monitoring)
28. [Backup & Disaster Recovery](#28-backup--disaster-recovery)
29. [Deployment Infrastructure](#29-deployment-infrastructure)
30. [Domain, DNS & HTTPS](#30-domain-dns--https)
31. [Git & Repository](#31-git--repository)
32. [CI/CD](#32-cicd)
33. [Testing](#33-testing)
34. [Security Testing](#34-security-testing)
35. [Privacy & Data Protection](#35-privacy--data-protection)
36. [Legal & Compliance](#36-legal--compliance)
37. [Production Data](#37-production-data)
38. [User Experience (UX)](#38-user-experience-ux)
39. [Analytics & Product Monitoring](#39-analytics--product-monitoring)
40. [Final Production Smoke Test](#40-final-production-smoke-test)
41. [Post-Deployment Verification](#41-post-deployment-verification)
42. [Rollback Plan](#42-rollback-plan)
43. [Final Go-Live Gate](#43-final-go-live-gate)
44. [Risk Classification Matrix](#44-risk-classification-matrix)

---

### 1. Application & Feature Completeness
Verify that the application is functionally complete.

- [x] **[Required]** All required features are implemented.
- [x] **[Required]** All primary user workflows have been completed.
- [ ] **[Required]** No critical functionality depends on mock/static data unless intentionally designed that way.
- [x] **[Required]** No unfinished features are exposed to users.
- [x] **[Required]** No placeholder content remains (e.g., "Lorem Ipsum", draft text).
- [x] **[Required]** No temporary development UI remains.
- [ ] **[Required]** No unnecessary debug functionality remains.
- [x] **[Required]** No broken buttons or links exist.
- [x] **[Required]** All forms perform their intended actions.
- [x] **[If Applicable]** All CRUD operations work correctly.
- [x] **[Required]** Success states are implemented and clear.
- [x] **[Required]** Error states are implemented and actionable.
- [x] **[Required]** Empty states are implemented for screens with no data.
- [x] **[Required]** Loading states are implemented for asynchronous processes.
- [x] **[Required]** Confirmation states exist for destructive actions (e.g., delete account, clear data).
- [x] **[Required]** User workflows work end-to-end without interruption.

---

### 2. Requirements & Business Logic

- [x] **[Required]** Application requirements have been reviewed against the implementation.
- [x] **[Required]** Business rules are implemented correctly.
- [x] **[Required]** Edge cases have been identified and handled.
- [x] **[Required]** Invalid operations are prevented at the client and server levels.
- [x] **[Required]** User permissions match business requirements.
- [x] **[Required]** Data ownership rules are enforced.
- [x] **[If Applicable]** Role-specific functionality has been verified.
- [x] **[Required]** Critical calculations (financial, usage metrics, totals) have been tested for accuracy.
- [x] **[Required]** Date/time logic has been verified (handling timezones, leap years, formatting).
- [x] **[If Applicable]** Currency and number formatting has been verified.
- [x] **[If Applicable]** Localization (i18n) requirements have been verified.
- [x] **[Required]** Business-critical workflows have been manually tested.

---

### 3. Code Quality
Review the entire codebase before deployment.

- [x] **[Required]** No unnecessary `console.log` or debug statements remain.
- [x] **[Required]** No temporary comments or TODOs for critical functionality remain.
- [x] **[Recommended]** Unused code and dead code paths have been removed.
- [x] **[Recommended]** Unused imports and unused dependencies have been pruned.
- [x] **[Recommended]** No duplicated critical logic exists unnecessarily.
- [x] **[Recommended]** Naming conventions are consistent across the codebase.
- [x] **[Recommended]** Modules and components have single, reasonable responsibilities.
- [x] **[Required]** Error handling is consistent across the application.
- [x] **[Recommended]** Shared functionality is properly abstracted and reused.
- [x] **[Required]** Configuration is separated from application logic.
- [x] **[Required]** Environment-specific behavior is handled correctly.
- [x] **[Recommended]** Code formatting is consistent.
- [x] **[Required]** Code linter passes without blocking errors.
- [x] **[If Applicable]** Type checking passes without critical type overrides or errors.
- [x] **[Required]** Production build succeeds cleanly without warnings treated as errors.
- [x] **[Required]** No known critical code-quality issues remain.

---

### 4. Dependencies & Packages

- [x] **[Required]** All declared dependencies are actually required by the production application.
- [x] **[Required]** Dependencies are using appropriate, locked versions.
- [x] **[Required]** Known critical security vulnerabilities (`npm audit`, `snyk`, etc.) have been investigated and patched.
- [x] **[Required]** Lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, etc.) are committed.
- [x] **[Required]** Development dependencies are separated from production dependencies.
- [x] **[Recommended]** Unused packages have been removed.
- [x] **[Recommended]** Deprecated packages have been identified and replaced where appropriate.
- [x] **[Required]** License requirements (e.g., GPL vs MIT/Apache) have been reviewed for legal compliance.
- [x] **[Required]** Dependency installation works cleanly from a fresh environment.
- [x] **[Required]** The application does not depend on packages installed globally on a developer's machine.

---

### 5. Environment Configuration

- [x] **[Required]** Production environment variables are documented.
- [ ] **[Required]** All required environment variables are explicitly configured in the production environment.
- [ ] **[Required]** Development/staging values (e.g., test API keys, localhost URLs) are not used in production.
- [ ] **[If Applicable]** Production API URLs are correct.
- [ ] **[If Applicable]** Production database URLs are correct.
- [x] **[If Applicable]** Production authentication/OAuth provider configurations are correct.
- [ ] **[If Applicable]** Third-party service configurations (Stripe, SendGrid, S3, etc.) are set to production mode.
- [x] **[Required]** Environment-specific configurations are cleanly separated.
- [x] **[Required]** `.env` files containing secrets are NOT committed to version control.
- [x] **[Recommended]** An `.env.example` file exists with dummy values for development setup.
- [x] **[Recommended]** Required environment variables are validated at application startup.
- [x] **[Required]** Missing environment variables produce clear configuration errors during build or boot.

---

### 6. Secrets & Credentials

- [x] **[Required]** API keys are not hardcoded in the codebase.
- [x] **[Required]** Database credentials are not hardcoded.
- [x] **[Required]** Authentication secrets (JWT secrets, session keys) are not hardcoded.
- [x] **[Required]** Private tokens and backend keys are NOT exposed to the client/frontend bundle.
- [ ] **[Required]** Production secrets are stored securely in the hosting provider’s secret manager.
- [x] **[Required]** `.env` files and local secret stores are explicitly excluded in `.gitignore`.
- [x] **[Required]** Git history has been scanned for accidentally committed secrets (`trufflehog`, `git-leaks`).
- [x] **[Required]** Any credentials exposed during development/testing have been rotated.
- [x] **[Recommended]** Service accounts and API keys use the principle of least privilege.
- [x] **[Required]** Development and production credentials are strictly isolated.

---

### 7. Authentication *(If Applicable)*

- [x] **[Required]** User registration works cleanly.
- [x] **[Required]** User login works as intended.
- [x] **[Required]** User logout works and revokes sessions/tokens properly.
- [x] **[Required]** Password hashing uses secure, modern algorithms (e.g., Argon2, bcrypt, scrypt).
- [ ] **[Required]** Password reset workflows function securely with expiring single-use tokens.
- [ ] **[If Applicable]** Email verification works prior to full account access.
- [ ] **[Required]** Sessions and tokens (JWTs, cookies) are handled securely (`HttpOnly`, `SameSite`, `Secure`).
- [x] **[Required]** Session expiration is configured appropriately.
- [ ] **[If Applicable]** Refresh-token rotation and revocation are implemented securely.
- [x] **[Required]** Invalid login attempts return generic, non-revealing error messages.
- [ ] **[Recommended]** Account enumeration protection is implemented (e.g., generic reset messages).
- [x] **[Required]** Authentication state persists correctly across page refreshes where intended.
- [ ] **[Required]** Authentication works properly in the live production environment setup.

---

### 8. Authorization & Access Control

- [x] **[Required]** Every protected resource and endpoint requires valid authorization.
- [x] **[Required]** Users cannot view, modify, or delete another user's private data (IDOR prevention).
- [x] **[If Applicable]** User roles and permissions are strictly enforced on the server side.
- [x] **[Required]** Permission checks are executed for every sensitive operation.
- [x] **[Required]** Administrative interfaces and features are strictly restricted.
- [x] **[If Applicable]** API endpoints enforce role/permission boundaries.
- [x] **[Required]** Direct URL navigation cannot bypass authorization barriers.
- [x] **[Required]** Object-level ownership is verified on all incoming requests.
- [x] **[Required]** Privilege escalation vectors (e.g., passing `role: admin` in JSON) are prevented.
- [x] **[Required]** Hiding UI components on the client is NOT relied upon as a security boundary.

---

### 9. Frontend Security

- [x] **[Required]** User-generated content is safely rendered to prevent Cross-Site Scripting (XSS).
- [x] **[Required]** Dangerous HTML insertion (`innerHTML`, `dangerouslySetInnerHTML`) is sanitized or avoided.
- [x] **[Required]** Sensitive information (JWTs with administrative privileges, PII) is not stored unnecessarily in `localStorage` or `sessionStorage`.
- [x] **[Recommended]** Third-party scripts (analytics, widgets) are reviewed for safety.
- [x] **[Required]** All external scripts, assets, and API requests use HTTPS.
- [x] **[Required]** Production source maps are configured intentionally (hidden or disabled if source code exposure is a concern).
- [x] **[Required]** Client-side environment variables (`NEXT_PUBLIC_`, `VITE_`, etc.) contain ONLY public values safe for client exposure.

---

### 10. Backend & API Security *(If Applicable)*

- [x] **[Required]** All public and private API endpoints have been reviewed.
- [x] **[Required]** Server-side input validation is enforced for all inputs.
- [x] **[Required]** Request bodies, query params, and path params are schema-validated.
- [x] **[Required]** Authentication and authorization are enforced on backend endpoints.
- [x] **[Recommended]** Rate limiting is configured on public, authentication, and expensive endpoints.
- [x] **[Required]** Request body payload size limits are configured to prevent Denial of Service (DoS).
- [x] **[Required]** Cross-Origin Resource Sharing (CORS) is configured strictly to allow only authorized origins.
- [x] **[Required]** Errors do not leak raw database errors or stack traces to the client in production.
- [x] **[Required]** API responses do not leak unnecessary sensitive fields (e.g., password hashes, internal IDs).
- [x] **[Required]** Unused HTTP methods (e.g., `TRACE`, `OPTIONS`, `PUT` on read-only endpoints) are disabled.
- [ ] **[Recommended]** API versioning is structured if breaking changes are anticipated.
- [x] **[Recommended]** A dedicated health-check endpoint (`/health` or `/api/health`) exists.

---

### 11. Database *(If Applicable)*

- [ ] **[Required]** Production database instance is provisioned and running.
- [ ] **[Required]** Database connection works securely from the production environment.
- [ ] **[Required]** Database connection strings and credentials are saved in production secrets.
- [x] **[Required]** Production database schema is finalized.
- [x] **[Required]** Database relationships, foreign key constraints, and unique constraints are established.
- [x] **[Required]** Indexes exist on frequently queried, joined, or sorted columns.
- [x] **[Required]** Database migration scripts are written, versioned, and tested.
- [ ] **[Required]** Production database migrations have been executed and verified against a staging environment.
- [x] **[Required]** Development/test seed data is strictly isolated from production.
- [x] **[Required]** Database transactions are used for multi-step atomic operations.
- [x] **[Recommended]** Database connection pooling is configured appropriately for production load.
- [x] **[Required]** Automated database backups are configured.
- [ ] **[Required]** Database restoration has been tested at least once.
- [x] **[Required]** Storage capacity and connection limits are understood.
- [ ] **[Recommended]** Database monitoring and alert thresholds are set up.

---

### 12. Data Integrity

- [x] **[Required]** Invalid or malformed data is rejected before persistence.
- [x] **[Required]** Referential integrity is enforced across data models.
- [x] **[Required]** Duplicate records are blocked via unique constraints where necessary.
- [ ] **[Recommended]** Concurrent write operations and race conditions have been analyzed for critical features (e.g., inventory deduction, booking slots).
- [x] **[If Applicable]** Financial or floating-point calculations use precise numeric formats (e.g., integers in cents, decimal types) to avoid rounding errors.
- [x] **[Required]** Data deletion mechanisms (hard vs. soft delete) are explicitly defined.
- [ ] **[If Applicable]** Audit trails or change histories exist for critical administrative data operations.

---

### 13. File & Image Uploads *(If Applicable)*

- [x] **[Required]** Allowed upload file extensions and MIME types are explicitly whitelisted.
- [x] **[Required]** Strict file size limits are enforced on both client and server.
- [x] **[Required]** Filenames are sanitized, or replaced with unique generated IDs (UUIDs) before storage.
- [ ] **[Recommended]** File contents/signatures (magic bytes) are validated rather than trusting headers or extensions alone.
- [x] **[Required]** Storage permissions are configured correctly (private assets remain non-public).
- [x] **[Required]** Publicly accessible uploads are served via dedicated storage or CDN with appropriate headers.
- [x] **[Required]** File upload endpoints are authenticated and rate-limited.
- [x] **[Recommended]** Image optimization (compression, resizing, modern formats like WebP) is enabled.
- [x] **[Required]** Uploaded files cannot be executed as scripts on the server (disallow executable extensions in web root).

---

### 14. API & Network Communication

- [ ] **[Required]** Production API traffic is served strictly over HTTPS.
- [x] **[Required]** The frontend application points strictly to the production API base URL.
- [ ] **[Required]** API requests succeed from the live production domain without CORS errors.
- [x] **[Required]** Network request failures are caught and surfaced gracefully in the user interface.
- [ ] **[Required]** Network timeout thresholds are set for external network requests.
- [ ] **[Recommended]** Controlled retry logic is implemented for transient network errors.
- [ ] **[Required]** Sensitive operations reject unencrypted plain-text HTTP connections.
- [ ] **[Required]** Third-party API integrations have been tested against live production endpoints/keys.

---

### 15. Error Handling

- [x] **[Required]** Graceful handling is implemented for:
  - [x] Network failures
  - [x] API timeouts / 5xx errors
  - [x] Authentication / Session expiration (401)
  - [x] Unauthorized actions (403)
  - [x] Form validation errors (400 / 422)
  - [x] Missing resources (404)
  - [x] Database errors
  - [x] File upload failures
  - [ ] Third-party service downtime
- [x] **[Required]** Users receive friendly, understandable error messages without technical jargon.
- [x] **[Required]** Developers receive structured logs with contextual detail for troubleshooting.
- [x] **[Required]** Internal system implementation details (stack traces, SQL queries) are obscured from end-users.
- [x] **[Required]** Failed requests do not leave the application state corrupted or locked.

---

### 16. Loading, Empty & Offline States

- [x] **[Required]** Skeletal placeholders or spinners indicate loading states on screen components.
- [x] **[Required]** Clear empty states inform users when lists or collections contain no data.
- [ ] **[Required]** Actionable retry buttons exist for user-facing network errors.
- [x] **[Required]** Submit buttons are disabled or put into a loading state during form submission to prevent duplicate submissions.
- [x] **[Required]** Long-running background operations provide progress indicators or async completion notifications.
- [ ] **[If Applicable]** Offline or loss-of-connectivity warnings inform the user when network connectivity drops.

---

### 17. Forms

- [x] **[Required]** Required fields are explicitly marked and enforced on both client and server.
- [x] **[Required]** Field formats (email, URL, phone, numbers) are validated.
- [x] **[Required]** Length limits (min/max characters) and numeric bounds are enforced.
- [x] **[Required]** Validation messages appear adjacent to the corresponding input fields.
- [x] **[Required]** Form submission clearly communicates success (toast notification, redirection, or state change).
- [x] **[Required]** Form state resets correctly after successful submission where expected.
- [x] **[Required]** Forms are fully usable via keyboard navigation (Tab / Shift+Tab / Enter).
- [x] **[Required]** Mobile input field types (`type="email"`, `type="tel"`, `type="number"`) trigger appropriate mobile keyboards.

---

### 18. Accessibility (a11y)

- [x] **[Required]** Semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<button>`, `<article>`) are used appropriately.
- [x] **[Required]** Non-decorative images have informative `alt` text.
- [x] **[Required]** Form fields have associated `<label>` tags or `aria-label` attributes.
- [x] **[Required]** Interactive elements (buttons, links, inputs) are focusable and clickable via keyboard.
- [x] **[Required]** Focus indicators (focus rings) are visible when navigating via keyboard.
- [x] **[Required]** Focus order follows a logical visual reading order.
- [ ] **[If Applicable]** Modal dialogs capture and trap focus, returning focus to the trigger element upon closing.
- [x] **[Required]** Color is not used as the sole indicator for conveying state, status, or errors.
- [x] **[Recommended]** Text and background color contrast ratios meet standard accessibility guidelines (WCAG AA).
- [x] **[Recommended]** Interactive touch targets are sufficiently sized (minimum 44x44 pixels).

---

### 19. Responsive Design
Verify layout stability and usability across standard viewports:

- [x] Small mobile (~360px - 480px)
- [x] Large mobile (~480px - 768px)
- [x] Tablet (~768px - 1024px)
- [x] Laptop / Desktop (~1024px - 1440px)
- [x] Large desktop (1440px+)

**Verification Checkpoints:**
- [x] **[Required]** No unintended horizontal scrolling or overflow exists on any screen size.
- [x] **[Required]** Navigation controls (e.g., hamburger menus, drawer navigation) adapt cleanly.
- [x] **[Required]** Complex forms remain usable on mobile screens.
- [x] **[Required]** Data tables collapse, scroll horizontally, or adapt to cards on smaller viewports.
- [x] **[Required]** Modals and dialog overlays fit within mobile viewports without blocking actions.
- [x] **[Required]** Device orientation changes (portrait/landscape) do not break the UI.

---

### 20. Browser Compatibility
Verify core workflows (Navigation, Authentication, Forms, Media, API requests) on target browsers:

- [x] Desktop Chrome
- [ ] Desktop Safari
- [x] Desktop Firefox
- [x] Desktop Edge
- [ ] Mobile Safari (iOS)
- [x] Mobile Chrome (Android)

*Note: Focus testing efforts strictly on browsers relevant to your audience analytics.*

---

### 21. Performance

- [x] **[Required]** Production build production flags and minification options are enabled.
- [x] **[Recommended]** JavaScript bundle size has been inspected and optimized.
- [x] **[Recommended]** Images are optimized, compressed, and served in modern formats (WebP, AVIF).
- [x] **[Recommended]** Images below the fold are lazy-loaded.
- [x] **[Recommended]** Web fonts are subsetted, preloaded, or optimized (`font-display: swap`).
- [x] **[Required]** Duplicate or unnecessary API requests are eliminated.
- [ ] **[If Applicable]** Large data sets use pagination, infinite scrolling, or windowing/virtualization.
- [x] **[If Applicable]** Slow database queries are identified and optimized using indexes or query restructuring.
- [ ] **[Recommended]** Static assets (JS, CSS, images) are served with long-term caching headers via a CDN.
- [ ] **[Recommended]** Core Web Vitals metrics (LCP, FID/INP, CLS) are evaluated.
- [ ] **[Recommended]** Application responsiveness has been evaluated on throttled 3G/4G connections.

---

### 22. SEO (Search Engine Optimization) *(If Applicable)*

- [x] **[Required]** Page `<title>` tags are unique and descriptive for key routes.
- [x] **[Recommended]** Meta descriptions are configured for public pages.
- [x] **[Required]** URLs are human-readable and consistent.
- [ ] **[Recommended]** Canonical tags (`<link rel="canonical">`) are defined on public pages to prevent duplicate content issues.
- [x] **[Recommended]** Open Graph (OG) and Twitter card tags are set up for social sharing.
- [x] **[Required]** A favicon and app icon are configured.
- [x] **[If Applicable]** A valid `robots.txt` file is present (permitting indexing for public routes, blocking admin routes).
- [x] **[If Applicable]** An updated `sitemap.xml` is generated and accessible.
- [ ] **[Required]** Authenticated or private application routes include `<meta name="robots" content="noindex, nofollow">`.

---

### 23. Routing

- [x] **[Required]** All public and internal application links resolve to valid routes.
- [x] **[Required]** Unauthenticated users attempting to access protected routes are redirected to the login page.
- [x] **[Required]** Unmatched or unknown routes render a custom, friendly 404 page.
- [x] **[Required]** Hard browser page refreshes (`F5`) on deep routes function correctly without throwing server 404s (SPA fallback configured).
- [ ] **[Required]** Browser Back and Forward navigation buttons preserve or cleanly update state.
- [ ] **[Required]** Deep links (direct links to nested sub-pages) load correctly when opened directly.

---

### 24. Email & Notifications *(If Applicable)*

- [ ] **[Required]** Production email delivery service (SendGrid, Postmark, AWS SES, Resend, etc.) is configured.
- [ ] **[Required]** Custom sending domain, SPF, DKIM, and DMARC records are authenticated.
- [ ] **[Required]** Transactional emails (password resets, welcome emails, receipts) deliver reliably.
- [ ] **[Required]** Links inside emails point to the production domain (not `localhost` or staging).
- [ ] **[Required]** Email templates are responsive and tested across major email clients.
- [ ] **[Required]** Delivery failures, bounces, and spam complaints are handled or logged.

---

### 25. Third-Party Services

- [x] **[Required]** All third-party dependencies and APIs are documented.
- [ ] **[Required]** Production keys and live account credentials are configured for every service.
- [x] **[Required]** Rate limits, API quotas, and usage tiers are verified and understood.
- [x] **[Required]** Service outages or API errors from third parties fail gracefully without taking down the main application.
- [x] **[Required]** Terms of service and data privacy disclosures for integrated services have been reviewed.
- [x] **[Required]** Fallback strategies exist for business-critical third-party integrations (e.g., fallback payment options, caching external content).

---

### 26. Logging

- [x] **[Required]** Unhandled server-side exceptions and application errors are logged.
- [x] **[Required]** Logs include timestamps, request correlation IDs, and actionable error context.
- [x] **[Required]** Passwords, credit card numbers, authorization tokens, and personal secrets are strictly filtered out of logs.
- [x] **[Required]** Sensitive personal data (PII) is not logged unnecessarily.
- [x] **[Required]** Log verbosity level is configured to `info` or `error` in production (disabling verbose `debug` logs).
- [x] **[Recommended]** Centralized log collection (Datadog, Logtail, CloudWatch, Papertrail) is configured.
- [x] **[Required]** Log storage policies and retention durations are established.

---

### 27. Monitoring

- [ ] **[Recommended]** Uptime monitoring (Pingdom, UptimeRobot, Better Stack) is enabled for primary endpoints.
- [x] **[Recommended]** Application Error Tracking (Sentry, Bugsnag, Rollbar) is integrated for real-time exception reporting.
- [ ] **[If Applicable]** Server and database resource metrics (CPU, RAM, Disk space, IOPS) are monitored.
- [x] **[If Applicable]** Hosting free-tier or plan-specific usage limits are monitored to prevent unexpected service suspensions.
- [ ] **[Recommended]** Automated alerts (email, Slack, PagerDuty) notify the team of critical service outages or spike in 5xx errors.

---

### 28. Backup & Disaster Recovery

- [x] **[Required]** Automated database backups are active.
- [x] **[If Applicable]** User-uploaded assets and critical persistent storage are backed up.
- [x] **[Required]** Backup frequency (e.g., hourly, daily) and retention periods are defined.
- [x] **[Required]** A documented recovery procedure exists for restoring data from backups.
- [ ] **[Required]** At least one backup restoration drill has been executed successfully.
- [x] **[Required]** Application source code is committed to a secure remote version control platform.
- [x] **[Required]** Infrastructure configurations or deployment scripts are version-controlled or fully documented.

---

### 29. Deployment Infrastructure

- [ ] **[Required]** Production hosting platform is fully provisioned.
- [x] **[Required]** Build and start commands are configured accurately in the deployment settings.
- [ ] **[Required]** Environment variables are assigned to the deployment environment.
- [x] **[Required]** A fresh, clean production build triggers and deploys without errors.
- [ ] **[Recommended]** Automatic deployment pipeline triggers from the main release branch.
- [x] **[Required]** Deployment build logs are accessible for auditing and troubleshooting.
- [x] **[Required]** Hosting plan resource limits (bandwidth, execution timeout, memory limits) are understood and sufficient for expected launch traffic.

---

### 30. Domain, DNS & HTTPS

- [ ] **[Required]** Domain registration is active and ownership verified.
- [ ] **[Required]** DNS records (`A`, `AAAA`, `CNAME`) point accurately to production hosting.
- [ ] **[Required]** An active SSL/TLS certificate is installed covering main domain and subdomains.
- [ ] **[Required]** Automatic SSL certificate renewal is verified.
- [ ] **[Required]** Plain HTTP requests automatically redirect to secure HTTPS.
- [x] **[Required]** CORS origins match the exact production domain(s).
- [ ] **[If Applicable]** Authentication cookie domains are scoped strictly to valid production hostnames.

---

### 31. Git & Repository

- [x] **[Required]** All production-ready code is committed and merged into the main release branch.
- [x] **[Required]** `.gitignore` accurately ignores local configuration, node_modules, build artifacts, and `.env` files.
- [x] **[Required]** Main deployment branch is stable, protected, and free of experimental work.
- [x] **[Recommended]** A clear project `README.md` exists with local development setup and architecture overview.
- [x] **[Recommended]** Deployment and environment variable configuration instructions are documented in the repository.
- [x] **[Required]** Repository permissions and team access levels are configured securely.

---

### 32. CI/CD *(If Applicable)*

- [ ] **[Recommended]** Automated integration pipelines run linting, type checks, and tests on push/pull request.
- [x] **[Required]** Deployment fails automatically if automated build or test steps fail.
- [x] **[Required]** Production deployments deploy strictly from designated release branches or git tags.
- [ ] **[Required]** Secrets required during build/deployment are injected securely through CI runner secrets.
- [ ] **[Required]** Build or deployment failures generate immediate team notifications.

---

### 33. Testing
Ensure testing coverage proportional to project risk:

#### Unit Testing
- [x] **[Recommended]** Essential utility functions, helpers, and data transformers are tested.
- [x] **[Required]** Business-critical calculations and validations are unit-tested.

#### Integration Testing
- [x] **[If Applicable]** Critical API endpoints and database access layers are tested.
- [x] **[If Applicable]** Authentication flows and permission gates are verified.

#### End-to-End (E2E) & Manual Testing
- [x] **[Required]** User registration, login, and password management flows verified.
- [x] **[Required]** Primary application user workflows manually tested from end-to-end in production mode.
- [x] **[Required]** Critical CRUD operations verified.
- [x] **[Required]** Destructive actions and confirmation prompts verified manually on mobile and desktop.

---

### 34. Security Testing

- [x] **[Required]** Unauthenticated requests to protected API endpoints are verified to return `401 Unauthorized`.
- [x] **[Required]** Unauthorized attempts to access high-privilege resources return `403 Forbidden`.
- [x] **[Required]** Common application vulnerability vectors reviewed:
  - [x] Cross-Site Scripting (XSS)
  - [x] SQL Injection (SQLi) / NoSQL Injection
  - [x] Cross-Site Request Forgery (CSRF)
  - [x] Insecure Direct Object References (IDOR)
- [x] **[Required]** File upload endpoints are checked for potential arbitrary code execution risks.
- [x] **[Required]** Dependency vulnerability scanner shows no unaddressed critical vulnerabilities.
- [ ] **[Required]** Basic security headers are set (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`).

---

### 35. Privacy & Data Protection *(If Applicable)*

- [x] **[Required]** Types of personal user data collected are documented.
- [x] **[Required]** Only data strictly necessary for application functionality is collected (Data Minimization).
- [x] **[Required]** Privacy Policy and Terms of Service links are visible to users.
- [ ] **[Required]** User account and personal data deletion workflows are defined and functional.
- [x] **[Required]** Cookie consent banners or tracking disclosures are present if analytics/tracking cookies are utilized.
- [x] **[Required]** Storage and transfer of sensitive personal data are encrypted (in transit and at rest).

---

### 36. Legal & Compliance *(If Applicable)*

- [x] **[Required]** Terms of Service and Privacy Policy documents are finalized.
- [x] **[Required]** Open-source licenses of third-party packages are respected.
- [x] **[If Applicable]** Payment gateway compliance (PCI-DSS compliance via Stripe, Paddle, etc.) is satisfied.
- [x] **[If Applicable]** Industry-specific regulatory requirements (GDPR, CCPA, HIPAA) are reviewed.

---

### 37. Production Data

- [ ] **[Required]** Production database is clean and contains no test or dummy user data.
- [x] **[Required]** Default administrative accounts or credentials have their default passwords changed.
- [x] **[Required]** Database seed scripts are verified so they cannot accidentally overwrite live production data.
- [x] **[Required]** Essential initial data (lookup tables, default settings) is seeded into production.

---

### 38. User Experience (UX)

- [x] **[Required]** Main application navigation is intuitive and easy to discover.
- [x] **[Required]** Primary action buttons on screens are clear and distinct.
- [x] **[Required]** System feedback (toasts, notifications, status indicators) acknowledges user actions.
- [x] **[Required]** Error messages guide the user on how to fix or recover from the problem.
- [ ] **[Required]** Unexpected data loss is prevented when users accidentally navigate away during active form entry.

---

### 39. Analytics & Product Monitoring *(If Applicable)*

- [ ] **[If Applicable]** Production analytics tool (Google Analytics, PostHog, Plausible, Mixpanel) is configured with production tokens.
- [ ] **[Required]** Development and staging usage is strictly excluded or filtered from production analytics streams.
- [x] **[Required]** High-priority feature conversions and key workflow completions are tracked.
- [x] **[Required]** Personally Identifiable Information (PII) is masked or excluded from analytics payloads.
- [x] **[Required]** Analytics script blocking or failures do not crash or interrupt application execution.

---

### 40. Final Production Smoke Test
*Perform these checks against the live production domain immediately upon deployment:*

- [ ] Landing/Homepage loads properly via HTTPS.
- [ ] Styles, scripts, images, and fonts load correctly without missing assets.
- [ ] Registration, login, and logout work end-to-end.
- [ ] Database read and write operations function as expected.
- [ ] API integrations return valid data.
- [ ] Key forms submit successfully.
- [ ] File uploads work correctly (if applicable).
- [ ] Primary business workflows complete cleanly.
- [ ] Custom 404 page functions on invalid paths.
- [ ] Mobile navigation and layouts function on physical mobile devices.
- [ ] Browser developer console contains no critical errors.

---

### 41. Post-Deployment Verification

- [ ] **[Required]** Monitor server and application logs for unexpected startup errors during the first hour.
- [ ] **[Required]** Monitor error tracking tools (Sentry, etc.) for client-side or server exceptions.
- [ ] **[Required]** Check database performance metrics and connection count stability under initial user traffic.
- [ ] **[Required]** Verify that scheduled cron jobs or background task runners execute properly in production.
- [ ] **[Required]** Confirm automated backups complete on schedule.
- [ ] **[Required]** Create prioritized tracking tasks for non-blocking minor issues discovered during launch.

---

### 42. Rollback Plan
*Answer and document the following before opening access to users:*

1. **Frontend Rollback Procedure**: How do you revert to the previous production deployment/commit?
2. **Backend Rollback Procedure**: How is the server/container instance reverted to the previous release tag?
3. **Database Migration Reversal**: Can recent migrations be safely reversed? If not, what is the strategy for forward-fixing schema changes?
4. **Data Corruption Recovery**: How will damaged data be restored from backups if a critical bug occurs during deployment?
5. **Responsible Owner**: Who holds designated responsibility for authorizing and executing a rollback?

---

### 43. Final Go-Live Gate

| Category | Gate Requirement | Status |
| :--- | :--- | :---: |
| **Critical** | Functional requirements and business workflows tested and passing in production | [ ] Pass |
| **Critical** | Production build succeeds without critical warnings or errors | [x] Pass |
| **Critical** | Security audit completed; credentials, secrets, and environment variables secured | [x] Pass |
| **Critical** | HTTPS configured and SSL certificate valid | [ ] Pass |
| **Critical** | Automated database backups verified and recovery strategy documented | [x] Pass |
| **Quality** | Responsive design, loading/empty states, and accessibility reviewed | [x] Pass |
| **Operations** | Logging, crash reporting, and uptime monitoring active | [ ] Pass |
| **Documentation** | Repository setup, environment variables, and rollback steps documented | [x] Pass |

---

## 44. Risk Classification Matrix

Classify any unresolved issues remaining before launch using this priority matrix:

| Severity Level | Definition & Criteria | Launch Decision | Action Required |
| :--- | :--- | :--- | :--- |
| **P0 — Blocking** | - Security vulnerabilities, data leaks, or unencrypted secrets.<br>- Total failure of primary business workflows.<br>- Data loss, database corruption, or system crash.<br>- Authentication or authorization bypass. | ⛔ **NO GO** | Must be resolved prior to production launch. |
| **P1 — High** | - Major feature partially broken without an easy workaround.<br>- Significant performance degradation on key pages.<br>- Major mobile or browser incompatibility.<br>- Critical monitoring or backup system missing. | ⚠️ **CONDITIONAL** | Fix immediately before launch or within 24 hours post-launch with explicit team agreement. |
| **P2 — Medium** | - Minor visual defects or layout shifts.<br>- Non-critical edge case bug with existing simple workaround.<br>- Minor accessibility oversights.<br>- Secondary performance optimizations. | ✅ **GO** | Schedule for resolution in the upcoming sprint iteration. |
| **P3 — Low** | - Cosmetic polish, minor copy edits, or formatting inconsistencies.<br>- Optional feature enhancement requests.<br>- Non-essential refactoring tasks. | ✅ **GO** | Add to general backlog for normal development planning. |