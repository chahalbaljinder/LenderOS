# LenderOS Routes Reference

This file documents the main application routes and their purpose.

## Core Routes

- `/` — Home route that now resolves to the dashboard flow for the active demo user.
- `/dashboard` — Main dashboard for the current active role.
- `/tenants` — Tenant management view for super admins.
- `/applications` — Loan application queue and review page.
- `/customers` — Customer registry and profile view.
- `/loans` — Active loan portfolio and repayment tracking.
- `/collections` — Collections and delinquency management view.
- `/apply` — Customer-facing loan application flow.

## Auth Routes

- `/sign-in` — Authentication sign-in route.
- `/sign-up` — Authentication sign-up route.

## Notes

- The dashboard route switches between super-admin and tenant views based on the current user role.
- The apply route is intended for the borrower/customer application experience.
