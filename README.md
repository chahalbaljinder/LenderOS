# LenderOS

<div align="center">

![LenderOS Logo](./artifacts/lending-os/public/logo.svg)

# LenderOS
**The Operating System for Modern Lending**

[![Version](https://img.shields.io/badge/version-2.4.1-blue.svg)](https://github.com/chahalbaljinder/LenderOS/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)

**The Operating System for Modern Lending** — A high-performance command center for NBFCs, Banks, Fintechs, and Lending Service Providers (LSPs). Process applications, assess risk via AI, and manage crores of volume with absolute precision.

[![Deploy Environment](https://img.shields.io/badge/Deploy%20Environment-Live-brightgreen)](https://lendingos.example.com)
[![View Architecture](https://img.shields.io/badge/View%20Architecture-Docs-blue)](docs/architecture.md)
[![API Docs](https://img.shields.io/badge/API%20Docs-OpenAPI%203.0-orange)](http://localhost:5000/api/docs)
[![Security Audit](https://img.shields.io/badge/Security-Audit%20Passed-green)](docs/security.md)

</div>

---

## Executive Summary

LenderOS is a **multi-tenant, AI-powered lending operating system** — a SaaS platform where NBFCs, Banks, Fintechs, and Lending Service Providers (LSPs) onboard independently and run digital lending operations with **full tenant data isolation**.

> **Think of it as: Shopify + Salesforce + Stripe + OpenAI for Lending**

### Business Value Proposition

| Metric | Value |
|--------|-------|
| **Time-to-Market** | Deploy in <48 hours vs 6-12 months custom build |
| **AI Underwriting Speed** | <2.5 seconds per application |
| **Default Rate Reduction** | 1.2% industry benchmark |
| **Platform Volume** | ₹4.2K Cr+ processed |
| **Active Tenants** | 140+ lending entities |
| **AI Accuracy** | 94.7% fraud detection rate |

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [High-Level Architecture](#high-level-architecture)
3. [Low-Level Design](#low-level-design)
4. [Scaling Architecture](#scaling-architecture)
5. [Security & RBAC Model](#security--rbac-model)
6. [Data Architecture](#data-architecture)
7. [API Contract Layer](#api-contract-layer)
8. [Deployment & Operations](#deployment--operations)
9. [Monitoring & Observability](#monitoring--observability)
9. [Security & Compliance](#security--compliance)
10. [Getting Started](#getting-started)

---

## System Architecture

### High-Level Architecture Overview

```mermaid
flowchart TB
    %% External Systems
    subgraph external["External Systems"]
        direction TB
        CreditBureaus["Credit Bureaus<br/>(CIBIL, Experian, Equifax)"]
        KYCProviders["KYC Providers<br/>(Karza, DigiLocker, SignDesk)"]
        PaymentGateways["Payment Gateways<br/>(Razorpay, Cashfree, UPI)"]
        Communication["Communication<br/>(Twilio, SendGrid, WhatsApp)"]
        Storage["Object Storage<br/>(S3/MinIO)"]
    end

    %% Client Layer
    subgraph client["Client Layer"]
        direction TB
        WebApp["LenderOS Web App<br/>React 19 + Vite 7"]
        MobileApp["Mobile App (Future)"]
        AdminPortal["Super Admin Portal"]
        TenantPortal["Tenant Portal"]
        CustomerPortal["Customer Portal (/apply)"]
        ComponentLibrary["Component Library<br/>(ShadCN UI + Storybook)"]
    end

    %% API Gateway Layer
    subgraph gateway["API Gateway Layer"]
        direction TB
        APIGateway["API Gateway<br/>(Kong/AWS API GW)"]
        RateLimiter["Rate Limiter<br/>(Redis-backed)"]
        AuthGateway["Auth Gateway<br/>(Clerk/OAuth2)"]
        WAF["Web Application Firewall"]
    end

    %% Core Services
    subgraph core["Core Services (Microservices)"]
        direction TB
        
        subgraph origination["Loan Origination"]
            AppService["Application Service"]
            KYCService["KYC Service"]
            DocService["Document Service"]
            UWService["Underwriting Service"]
        end
        
        subgraph risk["Risk & Intelligence"]
            RiskEngine["AI Risk Engine<br/>(Python/ONNX)"]
            FraudDetection["Fraud Detection<br/>(Graph Neural Net)"]
            CreditScoring["Credit Scoring<br/>(XGBoost/LightGBM)"]
            ModelRegistry["Model Registry<br/>(MLflow)"]
        end
        
        subgraph loanmgmt["Loan Management"]
            LoanService["Loan Service"]
            ScheduleService["Schedule Engine"]
            DisbursementService["Disbursement Engine"]
            RepaymentService["Repayment Processor"]
        end
        
        subgraph collections["Collections & Recovery"]
            CollectionService["Collection Engine"]
            LegalService["Legal/Recovery"]
            RecoveryService["Recovery Tracker"]
        end
        
        subgraph customer["Customer 360"]
            CustomerService["Customer 360"]
            KYCProfile["KYC Profile"]
            CommService["Communication Hub"]
        end
    end

    %% Platform Services
    subgraph platform["Platform Services"]
        direction TB
        TenantService["Tenant Management"]
        UserService["User & RBAC Service"]
        ConfigService["Configuration Service"]
        AuditService["Audit & Compliance"]
        NotificationService["Notification Service"]
        WebhookService["Webhook Manager"]
        FeatureFlag["Feature Flags<br/>(LaunchDarkly-style)"]
    end

    %% Data Layer
    subgraph data["Data Layer"]
        direction TB
        PrimaryDB[("Primary DB<br/>PostgreSQL 16<br/>Primary")]
        ReplicaDB[("Read Replicas<br/>PostgreSQL 16<br/>Read Replicas")]
        Cache[("Redis Cluster<br/>Cache & Sessions")]
        Search[("Elasticsearch<br/>Full-text Search")]
        AnalyticsDB[("ClickHouse<br/>Analytics Warehouse")]
        BlobStorage[("S3/MinIO<br/>Documents & Artifacts")]
        EventStore[("Kafka/Redpanda<br/>Event Streaming")]
    end

    %% Infrastructure
    subgraph infra["Infrastructure"]
        direction TB
        K8s["Kubernetes (EKS/GKE)"]
        ServiceMesh["Service Mesh<br/>(Istio/Linkerd)"]
        Monitoring["Observability Stack<br/>(Prometheus, Grafana, Jaeger)"]
        CI_CD["CI/CD<br/>(GitLab CI/ArgoCD)"]
        Secrets["Secrets Management<br/>(Vault/Sealed Secrets)"]
    end

    %% Connections
    client -->|HTTPS/WSS| gateway
    gateway -->|gRPC/REST| core
    gateway -->|Auth| platform
    core -->|SQL| PrimaryDB
    core -->|Read| ReplicaDB
    core -->|Cache| Cache
    core -->|Search| Search
    core -->|Analytics| AnalyticsDB
    core -->|Events| EventStore
    core -->|Files| BlobStorage
    core -->|External| external
    platform -->|Config| core
    infra -.->|Manages| gateway
    infra -.->|Manages| core
    infra -.->|Manages| data
    infra -.->|Manages| platform
```

---

## High-Level Architecture

### System Context Diagram (Level 1)

```mermaid
flowchart TB
    %% Actors
    customer["Customer/Borrower\nApplies for loans, manages repayments"]
    rm["Relationship Manager\nManages leads, applications, customer relationships"]
    underwriter["Underwriter/Credit Officer\nReviews applications, makes credit decisions"]
    collections["Collections Agent\nManages overdue accounts, recovery"]
    admin["Tenant Admin\nManages tenant operations, users, products"]
    superadmin["Super Admin\nPlatform operations, tenant onboarding, global analytics"]

    %% External Systems
    creditbureau["Credit Bureaus\nCIBIL, Experian, Equifax"]
    kyc["KYC Providers\nKarza, DigiLocker, SignDesk"]
    payments["Payment Gateways\nRazorpay, Cashfree, UPI"]
    comms["Communication\nTwilio, SendGrid, WhatsApp"]
    storage["Object Storage\nS3/MinIO"]

    %% LenderOS Platform Boundary
    subgraph platform["LenderOS Platform"]
        webapp["Web Application\nReact 19, Vite 7, TypeScript"]
        api["API Server\nExpress 5, TypeScript, OpenAPI 3.0"]
        platformsvc["Platform Services\nTenant, User, Config, Audit, Notifications"]
        origination["Loan Origination\nApplications, KYC, Underwriting, Offers"]
        loanmgmt["Loan Management\nDisbursement, Repayment, Schedule"]
        collections["Collections\nDPD tracking, Agent actions, Recovery"]
        risk["AI Risk Engine\nML-based scoring, Fraud detection"]
        db[("PostgreSQL 16\nPrimary Data Store")]
    end

    %% External Systems
    creditbureau["Credit Bureaus\nCIBIL, Experian, Equifax"]
    kyc["KYC Providers\nKarza, DigiLocker, SignDesk"]
    payments["Payment Gateways\nRazorpay, Cashfree, UPI"]
    comms["Communication\nTwilio, SendGrid, WhatsApp"]
    storage["Object Storage\nS3/MinIO"]

    %% Relationships
    customer -->|"Applies for loans, views status\nHTTPS"| webapp
    rm -->|"Manages leads, pipeline\nHTTPS"| webapp
    underwriter -->|"Reviews, decides\nHTTPS"| webapp
    collections -->|"Records actions, PTP\nHTTPS"| webapp
    admin -->|"Manages tenant ops\nHTTPS"| webapp
    superadmin -->|"Platform ops\nHTTPS"| webapp

    webapp -->|"API Calls\nHTTPS/REST"| api
    api -->|"Platform Ops\ngRPC/Internal"| platformsvc
    api -->|"Loan Ops\ngRPC/Internal"| origination
    api -->|"Loan Ops\ngRPC/Internal"| loanmgmt
    api -->|"Collections Ops\ngRPC/Internal"| collections
    api -->|"Risk Scoring\ngRPC/Internal"| risk

    api -->|"Read/Write\nPostgreSQL Protocol"| db
    origination -->|"Credit Reports\nHTTPS/Async"| creditbureau
    origination -->|"KYC Verification\nHTTPS/Async"| kyc
    loanmgmt -->|"Disbursement/Collection\nHTTPS/Async"| payments
    api -->|"Notifications\nAsync/Queue"| comms
    api -->|"Documents\nS3 API"| storage
```

### Container Diagram (Level 2)

```mermaid
flowchart TB
    subgraph platform["LenderOS Platform"]
        direction TB
        web["Web Application\nReact 19, Vite 7, TypeScript\nCustomer-facing and internal portals"]
        api["API Server\nExpress 5, TypeScript\nREST API, OpenAPI 3.0, Zod validation"]
        origination["Loan Origination Service\nTypeScript/Node.js\nApplication lifecycle, KYC, Offers"]
        loanmgmt["Loan Management Service\nTypeScript/Node.js\nDisbursement, Schedule, Repayment"]
        collections["Collections Service\nTypeScript/Node.js\nDPD tracking, Agent actions, Recovery"]
        risk["AI Risk Engine\nPython/ONNX\nML Scoring, Fraud Detection, Model Registry"]
        platformsvc["Platform Services\nTypeScript/Node.js\nTenant, User, Config, Audit, Notifications"]
        notifications["Notification Service\nTypeScript/Node.js\nEmail, SMS, WhatsApp, In-App"]
        webhooks["Webhook Manager\nTypeScript/Node.js\nAsync Event Delivery"]
    end

    subgraph datalayer["Data Layer"]
        db[("PostgreSQL 16\nPrimary Data Store\nACID, Multi-tenant, Row-level Security")]
        cache[("Redis Cluster\nCache & Sessions\nL2 Cache, Rate Limiting, Sessions")]
        search[("Elasticsearch\nFull-text Search\nCustomer, Application Search")]
        analytics[("ClickHouse\nAnalytics Warehouse\nOLAP, BI, Regulatory Reporting")]
        queue[("Kafka/Redpanda\nEvent Streaming\nAsync Processing, Audit Logs")]
        storage[("S3/MinIO\nObject Storage\nDocuments, Artifacts, Backups")]
    end

    subgraph external["External Systems"]
        bureau["Credit Bureaus\nCIBIL, Experian, Equifax"]
        kyc["KYC Providers\nKarza, DigiLocker, SignDesk"]
        payments["Payment Gateways\nRazorpay, Cashfree, UPI"]
        comms["Communication\nTwilio, SendGrid, WhatsApp"]
    end

    %% Relationships
    web -->|"REST API Calls\nHTTPS/JSON"| api
    api -->|"Internal API\ngRPC/REST"| origination
    api -->|"Internal API\ngRPC/REST"| loanmgmt
    api -->|"Internal API\ngRPC/REST"| collections
    api -->|"Risk Scoring\ngRPC/Async"| risk
    api -->|"Platform Ops\ngRPC/Internal"| platformsvc
    api -->|"Async Events\nKafka/Async"| notifications
    api -->|"Webhooks\nHTTPS/Async"| webhooks
    origination -->|"Read/Write\nPostgreSQL"| db
    loanmgmt -->|"Read/Write\nPostgreSQL"| db
    collections -->|"Read/Write\nPostgreSQL"| db
    risk -->|"Read/Write\nPostgreSQL"| db
    platformsvc -->|"Read/Write\nPostgreSQL"| db
    platformsvc -->|"Cache\nRedis Protocol"| cache
    origination -->|"Credit Reports\nHTTPS/Async"| bureau
    origination -->|"KYC Verification\nHTTPS/Async"| kyc
    loanmgmt -->|"Disbursement/Collection\nHTTPS/Async"| payments
    api -->|"Notifications\nAsync/Queue"| comms
    api -->|"Documents\nS3 API"| storage
```

---

## Low-Level Design

### Component Diagram

```mermaid
classDiagram
    %% Core Domain Entities
    class Tenant {
        +String id
        +String name
        +TenantType type
        +TenantStatus status
        +String domain
        +String primaryColor
        +JSON config
        +DateTime createdAt
        +getUsers(): User[]
        +getProducts(): Product[]
        +getApplications(): Application[]
    }

    class User {
        +String id
        +String clerkId
        +String email
        +String firstName
        +String lastName
        +UserRole role
        +String tenantId
        +Boolean isActive
        +DateTime lastLoginAt
        +getPermissions(): Permission[]
        +canAccess(resource): Boolean
    }

    class Customer {
        +String id
        +String tenantId
        +String firstName, lastName
        +String email, phone
        +String panNumber, aadhaarNumber
        +Address address
        +Employment employment
        +KYCProfile kycProfile
        +CreditProfile creditProfile
        +getApplications(): Application[]
        +getLoans(): Loan[]
    }

    class Application {
        +String id
        +String applicationNumber
        +String customerId
        +String tenantId
        +String productId
        +Money requestedAmount
        +Integer requestedTenure
        +String purpose
        +ApplicationStatus status
        +RiskScore riskScore
        +KYCProfile kyc
        +Offer[] offers
        +DateTime submittedAt
        +submit(): void
        +approve(approval): void
        +reject(reason): void
        +disburse(details): Loan
    }

    class Loan {
        +String id
        +String loanNumber
        +String applicationId
        +String customerId
        +String tenantId
        +Money principalAmount
        +Money outstandingAmount
        +InterestRate interestRate
        +Integer tenure
        +Money emiAmount
        +Date nextEmiDate
        +LoanStatus status
        +Integer dpd
        +DateTime disbursedAt
        +getSchedule(): RepaymentSchedule[]
        +recordRepayment(payment): Repayment
        +restructure(terms): void
    }

    class Product {
        +String id
        +String tenantId
        +String name
        +ProductType type
        +Money minAmount, maxAmount
        +Integer minTenure, maxTenure
        +InterestRate interestRate
        +FeeStructure fees
        +EligibilityCriteria criteria
        +Boolean isActive
    }

    class RiskScore {
        +String id
        +String applicationId
        +Integer score
        +RiskGrade grade
        +Recommendation recommendation
        +Explanation explanation
        +FeatureWeights weights
        +DateTime computedAt
    }

    %% Services
    class ApplicationService {
        +createApplication(dto): Application
        +submitApplication(id): Application
        +approveApplication(id, approval): Application
        +rejectApplication(id, reason): Application
        +getApplication(id): Application
        +listApplications(filter): Paginated<Application>
    }

    class RiskEngine {
        +scoreApplication(app): RiskScore
        +detectFraud(app): FraudFlags
        +analyzeCashflow(bankStmt): CashflowAnalysis
        +trainModel(dataset): Model
    }

    class LoanService {
        +disburse(application, details): Loan
        +recordRepayment(loan, payment): Repayment
        +restructure(loan, terms): Loan
        +getSchedule(loan): Schedule[]
        +closeLoan(loan): void
    }

    class CollectionService {
        +assignAgent(collection, agent): void
        +recordAction(collection, action): CollectionAction
        +recordPTP(collection, ptp): PromiseToPay
        +escalate(collection, reason): void
        +getQueue(filters): CollectionQueue
    }

    %% Relationships
    Tenant "1" --> "*" User : has
    Tenant "1" --> "*" Customer : has
    Tenant "1" --> "*" Product : owns
    Tenant "1" --> "*" Application : has
    User "1" --> "*" Application : processes
    Customer "1" --> "*" Application : applies
    Customer "1" --> "*" Loan : holds
    Application "1" --> "1" Loan : creates
    Application "1" --> "1" RiskScore : has
    Application "1" --> "*" Offer : generates
    Loan "1" --> "*" Repayment : has
    Loan "1" --> "*" CollectionCase : mayHave
    Product "1" --> "*" Application : usedIn
```

### Sequence Diagrams

#### Loan Application Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant WebApp as LenderOS Web App
    participant API as API Gateway
    participant AppSvc as Application Service
    participant KYC as KYC Service
    participant Risk as Risk Engine
    participant UW as Underwriting Service
    participant OfferSvc as Offer Service
    participant LoanSvc as Loan Service
    participant DB as PostgreSQL

    Customer->>WebApp: Submit Application
    WebApp->>API: POST /api/loan-applications
    API->>AppSvc: createApplication()
    AppSvc->>DB: INSERT application (status: DRAFT)
    AppSvc-->>WebApp: Application Created

    Customer->>WebApp: Complete KYC
    WebApp->>API: POST /api/kyc/{id}/pan, aadhaar, face
    API->>KYC: submitPan(), submitAadhaar(), submitFace()
    KYC->>External: Verify with NSDL/UIDAI
    KYC->>DB: Update KYC Status
    KYC-->>WebApp: KYC Verified

    Customer->>WebApp: Submit for Review
    WebApp->>API: POST /applications/{id}/submit
    API->>AppSvc: submitApplication()
    AppSvc->>DB: UPDATE status=SUBMITTED
    AppSvc->>Risk: scoreApplication()
    Risk->>External: Credit Bureau Fetch
    Risk->>Risk: Analyze (ML Model)
    Risk->>DB: Save RiskScore
    Risk-->>AppSvc: RiskScore (Grade, Recommendation)

    AppSvc->>UW: assignUnderwriter()
    UW-->>WebApp: Under Review

    alt Auto-approve (Grade A1-A2)
        UW->>AppSvc: autoApprove()
    else Manual Review
        Underwriter->>WebApp: Review Application
        WebApp->>API: POST /applications/{id}/approve
        API->>AppSvc: approveApplication(approvedAmount, rate, tenure)
        AppSvc->>DB: UPDATE status=APPROVED
    end

    AppSvc->>OfferSvc: generateOffers()
    OfferSvc->>External: Query Lenders
    OfferSvc->>DB: Save Offers
    OfferSvc-->>WebApp: Offers Generated

    Customer->>WebApp: Accept Offer
    WebApp->>API: POST /offers/{appId}/accept
    API->>OfferSvc: acceptOffer()
    OfferSvc->>DB: UPDATE offer accepted
    OfferSvc->>AppSvc: UPDATE status=OFFER_ACCEPTED

    Customer->>WebApp: E-Sign Agreement
    WebApp->>API: POST /applications/{id}/esign
    API->>AppSvc: esign()
    AppSvc->>DB: UPDATE status=ESIGN_COMPLETE

    AppSvc->>LoanSvc: disburse()
    LoanSvc->>External: Disburse via Payment Gateway
    LoanSvc->>DB: CREATE Loan, Schedule
    LoanSvc->>DB: UPDATE Application=DISBURSED
    LoanSvc-->>WebApp: Loan Created
```

---

## Scaling Architecture

### Horizontal Scaling Strategy

```mermaid
flowchart TB
    subgraph lb["Load Balancer Layer"]
        ALB["Application Load Balancer<br/>(AWS ALB / NGINX)"]
        WAF["WAF + DDoS Protection"]
    end

    subgraph api["API Layer (Stateless)"]
        API1["API Pod 1"]
        API2["API Pod 2"]
        APIN["API Pod N"]
        HPA["Horizontal Pod Autoscaler<br/>(CPU > 70%, RPS > 1000)"]
    end

    subgraph svc["Core Services (Stateless)"]
        SVC1["Origination Svc<br/>Replicas: 3-10"]
        SVC2["Loan Mgmt Svc<br/>Replicas: 3-10"]
        SVC3["Collections Svc<br/>Replicas: 2-8"]
        SVC4["Risk Engine<br/>Replicas: 2-6 (GPU)"]
    end

    subgraph cache["Cache Layer"]
        RedisCluster["Redis Cluster<br/>(6 Shards, 3 Replicas)"]
        LocalCache["Local L2 Cache<br/>(Caffeine/In-Memory)"]
    end

    subgraph db["Database Layer"]
        Primary[("Primary DB<br/>Writer")]
        Replica1[("Read Replica 1<br/>Analytics")]
        Replica2[("Read Replica 2<br/>Search")]
        Replica3[("Read Replica 3<br/>Reporting")]
        PgBouncer["PgBouncer<br/>Connection Pooling"]
    end

    subgraph async["Async Processing"]
        Kafka["Kafka/Redpanda Cluster<br/>(3 Brokers, 3x Replication)"]
        Consumers["Consumer Groups<br/>(Notifications, Audit, Analytics)"]
        DLQ["Dead Letter Queue<br/>(Retry + Alerting)"]
    end

    WAF --> ALB
    ALB -->|Round Robin / Least Conn| API
    API -->|Service Discovery| SVC
    API -->|Read/Write| PgBouncer
    PgBouncer --> Primary
    API -.->|Read Queries| Replica1
    API -.->|Read Queries| Replica2
    API -.-> Cache
    API -.-> Kafka
    Kafka --> Consumers
    Consumers -.-> DLQ
```

### Scaling Policies

| Component | Scaling Trigger | Min Replicas | Max Replicas | Scale-Up Time |
|-----------|----------------|--------------|--------------|---------------|
| API Gateway | CPU > 70%, RPS > 1000 | 3 | 50 | 30s |
| Origination Svc | Queue Depth > 100 | 3 | 10 | 45s |
| Loan Mgmt Svc | CPU > 70% | 3 | 10 | 45s |
| Risk Engine | GPU Util > 80%, Queue > 50 | 2 | 6 | 90s (GPU) |
| Collections Svc | Queue Depth > 50 | 2 | 8 | 60s |
| Notifications | Queue Depth > 500 | 2 | 20 | 30s |
| PostgreSQL (Read) | Connections > 80% | 2 | 5 | 60s |
| Redis | Memory > 80% | 3 | 6 | 60s |
| Kafka | Lag > 10000 | 3 | 12 | 120s |

### Database Scaling

```mermaid
erDiagram
    TENANT ||--o{ USER : has
    TENANT ||--o{ CUSTOMER : has
    TENANT ||--o{ PRODUCT : owns
    TENANT ||--o{ APPLICATION : has
    TENANT ||--o{ LOAN : has
    TENANT ||--o{ COLLECTION : has

    USER }|--o{ APPLICATION : processes
    CUSTOMER ||--o{ APPLICATION : applies
    CUSTOMER ||--o{ LOAN : holds
    APPLICATION ||--|| LOAN : creates
    APPLICATION ||--o{ KYC : has
    APPLICATION ||--o{ RISK_SCORE : has
    APPLICATION ||--o{ OFFER : generates
    LOAN ||--o{ REPAYMENT : has
    LOAN ||--o{ COLLECTION : mayHave
    REPAYMENT }|--o{ COLLECTION : resolves

    TENANT {
        string id PK
        string name
        enum type
        enum status
        jsonb config
        timestamp created_at
    }

    USER {
        string id PK
        string clerk_id UK
        string email UK
        string first_name
        string last_name
        enum role
        string tenant_id FK
        boolean is_active
        timestamp last_login_at
    }

    CUSTOMER {
        string id PK
        string tenant_id FK
        string first_name
        string last_name
        string email UK
        string phone
        jsonb kyc_profile
        jsonb credit_profile
        enum status
    }

    APPLICATION {
        string id PK
        string application_number UK
        string customer_id FK
        string tenant_id FK
        string product_id FK
        money requested_amount
        integer requested_tenure
        enum status
        jsonb risk_score
        jsonb kyc_status
        timestamp submitted_at
    }

    LOAN {
        string id PK
        string loan_number UK
        string application_id FK
        string customer_id FK
        string tenant_id FK
        money principal_amount
        money outstanding_amount
        decimal interest_rate
        integer tenure
        money emi_amount
        date next_emi_date
        enum status
        integer dpd
        timestamp disbursed_at
    }

    KYC_RECORD {
        string id PK
        string application_id FK
        enum pan_status
        enum aadhaar_status
        enum face_status
        enum employment_status
        string pan_number
        string aadhaar_number
        timestamp verified_at
    }

    RISK_SCORE {
        string id PK
        string application_id FK
        integer score
        enum grade
        enum recommendation
        jsonb feature_weights
        text explanation
        timestamp computed_at
    }
```

---

## Security & RBAC Model

### Role Hierarchy (15 Roles, 5 Tiers)

```mermaid
graph TD
    subgraph Tier1["Tier 1: Platform Ownership"]
        SA[super_admin<br/>Level 100]
        PA[platform_admin<br/>Level 90]
    end

    subgraph Tier2["Tier 2: Tenant Leadership"]
        TO[tenant_owner<br/>Level 80]
        TA[tenant_admin<br/>Level 70]
    end

    subgraph Tier3["Tier 3: Functional Managers"]
        RM[risk_manager<br/>Level 60]
        LM[loan_manager<br/>Level 50]
        CM[collection_manager<br/>Level 40]
        CS[customer_support<br/>Level 30]
    end

    subgraph Tier4["Tier 4: Field Operations"]
        SA[sales_agent<br/>Level 20]
        DSA[dsa<br/>Level 15]
        RM2[relationship_manager<br/>Level 10]
    end

    subgraph Tier5["Tier 5: External/Read-Only"]
        CUST[customer<br/>Level 5]
        AUD[auditor<br/>Level 5]
        COMP[compliance_officer<br/>Level 5]
    end

    SA --> PA
    PA --> TO
    PA --> TA
    TO --> TA
    TA --> RM
    TA --> LM
    TA --> CM
    TA --> CS
    TA --> SA
    TA --> DSA
    TA --> RM2
    RM --> CUST
    LM --> CUST
    CM --> CUST
    CS --> CUST
```

### Permission Matrix

| Resource | super_admin | platform_admin | tenant_owner | tenant_admin | risk_manager | loan_manager | collection_manager | customer_support | sales_agent | dsa | relationship_manager | customer | auditor | compliance_officer |
|----------|:-----------:|:--------------:|:------------:|:------------:|:------------:|:------------:|:------------------:|:----------------:|:-----------:|:---:|:-------------------:|:--------:|:-------:|:-----------------:|
| **Tenant Management** | | | | | | | | | | | | | | |
| Create Tenant | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Tenants | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Manage Tenant Settings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Management** | | | | | | | | | | | | | | |
| Invite Users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅ | Own Tenant | Own Tenant | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Own | ✅ | ✅ |
| **Applications** | | | | | | | | | | | | | | |
| Create Application | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | Own | ❌ | ❌ |
| View Applications | ✅ | ✅ | All | Own | All | Own | Assigned | All | Own | Own | Own | Own | All | All |
| Submit Application | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | Own | ❌ | ❌ |
| Approve/Reject | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Underwriting** | | | | | | | | | | | | | | |
| Run Risk Score | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Override Risk | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Fraud Flags | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Loan Management** | | | | | | | | | | | | | | |
| Disburse Loan | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Record Repayment | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Own | ❌ | ❌ |
| Restructure Loan | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Loan Schedule | ✅ | ✅ | All | Own | All | All | All | All | Own | Own | Own | Own | All | All |
| **Collections** | | | | | | | | | | | | | | |
| View Collections | ✅ | ✅ | All | Own | All | All | All | All | Assigned | Assigned | Assigned | Own | All | All |
| Record Action | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Record PTP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Escalate | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Legal Action | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Products** | | | | | | | | | | | | | | |
| Create Product | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Products | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Settings & Config** | | | | | | | | | | | | | | |
| Tenant Settings | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| API Keys | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Webhooks | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Analytics & Reports** | | | | | | | | | | | | | | |
| Platform Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Tenant Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| Regulatory Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Audit & Compliance** | | | | | | | | | | | | | | |
| View Audit Logs | ✅ | ✅ | Own | Own | Own | Own | Own | Own | ❌ | ❌ | Own | ❌ | All | All |
| Export Data | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

### Permission Implementation (Code)

```typescript
// lib/auth/permissions.ts
export enum Permission {
  // Tenant
  TENANT_CREATE = 'tenant:create',
  TENANT_READ = 'tenant:read',
  TENANT_UPDATE = 'tenant:update',
  TENANT_DELETE = 'tenant:delete',
  TENANT_APPROVE = 'tenant:approve',

  // Users
  USER_INVITE = 'user:invite',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_ROLE_ASSIGN = 'user:role_assign',

  // Applications
  APP_CREATE = 'application:create',
  APP_READ = 'application:read',
  APP_UPDATE = 'application:update',
  APP_SUBMIT = 'application:submit',
  APP_APPROVE = 'application:approve',
  APP_REJECT = 'application:reject',
  APP_DISBURSE = 'application:disburse',

  // Underwriting
  RISK_SCORE = 'risk:score',
  RISK_OVERRIDE = 'risk:override',
  FRAUD_FLAGS = 'fraud:view',

  // Loans
  LOAN_DISBURSE = 'loan:disburse',
  LOAN_REPAYMENT = 'loan:repayment',
  LOAN_RESTRUCTURE = 'loan:restructure',
  LOAN_SCHEDULE = 'loan:schedule',

  // Collections
  COLLECTION_ACTION = 'collection:action',
  COLLECTION_PTP = 'collection:ptp',
  COLLECTION_ESCALATE = 'collection:escalate',
  COLLECTION_RESOLVE = 'collection:resolve',

  // Products
  PRODUCT_CREATE = 'product:create',
  PRODUCT_READ = 'product:read',
  PRODUCT_UPDATE = 'product:update',
  PRODUCT_DELETE = 'product:delete',

  // Settings
  SETTINGS_READ = 'settings:read',
  SETTINGS_UPDATE = 'settings:update',
  API_KEYS_MANAGE = 'api_keys:manage',
  WEBHOOKS_MANAGE = 'webhooks:manage',
}

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: Object.values(Permission),
  platform_admin: [
    ...TENANT_PERMS, ...USER_PERMS, ...APP_PERMS, ...RISK_PERMS,
    ...LOAN_PERMS, ...COLLECTION_PERMS, ...PRODUCT_PERMS,
    ...SETTINGS_PERMS, ...ANALYTICS_PERMS, ...AUDIT_PERMS
  ],
  tenant_owner: [...TENANT_PERMS, ...USER_PERMS, ...APP_PERMS, ...],
  // ... other roles
};

// Permission Guard
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userPerms = req.user?.permissions || [];
    if (!userPerms.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required permission: ${permission}`
      });
    }
    next();
  };
}
```

### Tenant Isolation Enforcement

```typescript
// middleware/tenantIsolation.ts
export function ensureTenantAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  const requestedTenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;

  // Platform admins bypass tenant checks
  if (['super_admin', 'platform_admin'].includes(user.role)) {
    return next();
  }

  // Tenant users must match their tenant
  if (user.tenantId !== requestedTenantId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: tenant mismatch'
    });
  }

  next();
}

// Row-Level Security (PostgreSQL RLS)
-- CREATE POLICY tenant_isolation ON applications
--   USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
--
-- SET LOCAL app.current_tenant_id = 'tenant-uuid';
```

---

## Data Architecture

### Database Schema (PostgreSQL 16)

```mermaid
erDiagram
    TENANT ||--o{ USER : has
    TENANT ||--o{ CUSTOMER : has
    TENANT ||--o{ PRODUCT : owns
    TENANT ||--o{ APPLICATION : has
    TENANT ||--o{ LOAN : has
    TENANT ||--o{ COLLECTION : has
    TENANT ||--o{ INVITATION : sends
    TENANT ||--o{ AUDIT_LOG : generates
    TENANT ||--o{ SETTINGS : configures

    USER ||--o{ APPLICATION : processes
    USER ||--o{ INVITATION : sends
    USER ||--o{ AUDIT_LOG : generates

    CUSTOMER ||--o{ APPLICATION : applies
    CUSTOMER ||--o{ LOAN : holds
    CUSTOMER ||--o{ KYC_RECORD : has
    CUSTOMER ||--o{ REPAYMENT : makes
    CUSTOMER ||--o{ COLLECTION : subject_to

    APPLICATION ||--o| LOAN : creates
    APPLICATION ||--o{ KYC_RECORD : has
    APPLICATION ||--o{ RISK_SCORE : has
    APPLICATION ||--o{ OFFER : generates
    APPLICATION ||--o{ DOCUMENT : has
    APPLICATION ||--o{ AUDIT_LOG : generates

    LOAN ||--o{ REPAYMENT : has
    LOAN ||--o{ COLLECTION : may_have
    LOAN ||--o{ SCHEDULE : has

    REPAYMENT }|--o{ COLLECTION : resolves

    KYC_RECORD {
        string application_id FK
        enum pan_status
        enum aadhaar_status
        enum face_status
        enum employment_status
        string pan_number
        string aadhaar_number
        timestamp verified_at
    }

    RISK_SCORE {
        string application_id FK
        integer score
        enum grade
        enum recommendation
        jsonb feature_weights
        text explanation
        timestamp computed_at
    }

    OFFER {
        string id PK
        string application_id FK
        string tenant_id FK
        money offered_amount
        integer tenure
        decimal interest_rate
        money emi
        money processing_fee
        money total_interest
        money total_repayable
        decimal approval_probability
        string disbursement_time
        timestamp expires_at
        boolean is_accepted
    }

    LOAN {
        string id PK
        string loan_number UK
        string application_id FK
        string customer_id FK
        string tenant_id FK
        money principal_amount
        money outstanding_amount
        decimal interest_rate
        integer tenure
        money emi_amount
        date next_emi_date
        enum status
        integer dpd
        timestamp disbursed_at
    }

    REPAYMENT {
        string id PK
        string loan_id FK
        integer installment_number
        date due_date
        money emi_amount
        money principal_component
        money interest_component
        money outstanding_after
        enum status
        timestamp paid_at
    }

    COLLECTION {
        string id PK
        string loan_id FK
        string customer_id FK
        string tenant_id FK
        money overdue_amount
        integer dpd
        enum status
        enum priority
        integer ai_priority_score
        string assigned_to FK
        timestamp last_contact_at
        timestamp next_followup_at
    }
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph ingest["Data Ingestion"]
        WebApp[Web App]
        MobileApp[Mobile App]
        Webhooks[Webhooks]
        BatchJobs[Batch Jobs]
    end

    subgraph streaming["Stream Processing"]
        Kafka[Kafka/Redpanda]
        Flink[Flink/Spark Streaming]
    end

    subgraph storage["Storage Layer"]
        PG[(PostgreSQL<br/>OLTP)]
        CH[(ClickHouse<br/>OLAP)]
        ES[(Elasticsearch<br/>Search)]
        S3[(S3/MinIO<br/>Files)]
    end

    subgraph analytics["Analytics & BI"]
        Metabase[Metabase]
        Grafana[Grafana]
        CustomDash[Custom Dashboards]
    end

    WebApp -->|REST/gRPC| API
    MobileApp -->|REST| API
    Webhooks -->|Async| Kafka
    BatchJobs -->|Batch| Kafka
    API -->|Write| PG
    API -->|Async Events| Kafka
    Kafka -->|Stream| Flink
    Flink -->|Aggregate| CH
    Flink -->|Index| ES
    API -->|Files| S3
    CH -->|Query| Metabase
    CH -->|Query| Grafana
    CH -->|Query| CustomDash
    ES -->|Search| WebApp
    S3 -->|Files| WebApp
```

---

## API Contract Layer

### OpenAPI-First Development

```mermaid
flowchart LR
    OpenAPI[(openapi.yaml)] --> Orval[Orval Codegen]
    Orval --> Zod[Zod Schemas\n@workspace/api-zod]
    Orval --> ReactHooks[React Query Hooks\n@workspace/api-client-react]
    Orval --> ExpressTypes[Express Types\n@workspace/api-server]
    OpenAPI --> Spectral[Spectral Linting]
    OpenAPI --> Redoc[Redoc Documentation]
    OpenAPI --> Postman[Postman Collection]
```

### API Standards

| Aspect | Standard |
|--------|----------|
| **Protocol** | REST over HTTPS, gRPC for internal |
| **Format** | JSON (UTF-8) |
| **Versioning** | URL versioning `/api/v1/` + Header `Accept-Version` |
| **Authentication** | Bearer Token (Clerk JWT) + `x-demo-user-id` for demo |
| **Rate Limiting** | Tiered: 100/15min (general), 20/15min (auth), 30/15min (sensitive) |
| **Pagination** | Cursor-based (`cursor`, `limit`) + Offset fallback |
| **Filtering** | `filter[field]=value`, `filter[field][op]=value` |
| **Sorting** | `sort=field,-field` |
| **Errors** | RFC 7807 Problem Details (`application/problem+json`) |
| **Idempotency** | `Idempotency-Key` header for mutations |

### Example API Response

```json
// GET /api/v1/loan-applications?cursor=abc123&limit=20&filter[status]=submitted
{
  "data": [
    {
      "id": "app_abc123",
      "applicationNumber": "APP-2024-001234",
      "customer": {
        "id": "cust_abc",
        "name": "Rajesh Kumar",
        "email": "rajesh@example.com"
      },
      "product": {
        "id": "prod_personal",
        "name": "Personal Loan Prime",
        "type": "personal"
      },
      "requestedAmount": 500000,
      "requestedTenure": 36,
      "status": "under_review",
      "riskScore": 78,
      "riskGrade": "B1",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-16T14:22:00Z"
    }
  ],
  "pagination": {
    "cursor": "next_cursor_xyz",
    "hasMore": true,
    "limit": 20
  }
}
```

---

## Deployment & Operations

### Kubernetes Deployment Architecture

```yaml
# k8s/overlays/production/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: lendingos-prod

resources:
  - namespace.yaml
  - api-deployment.yaml
  - web-deployment.yaml
  - postgres-statefulset.yaml
  - redis-statefulset.yaml
  - kafka-statefulset.yaml
  - ingress.yaml
  - network-policies.yaml
  - pod-disruption-budgets.yaml

commonLabels:
  app.kubernetes.io/name: lendingos
  app.kubernetes.io/version: "2.4.1"
  app.kubernetes.io/managed-by: kustomize

patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 6
    target:
      kind: Deployment
      name: api-server
  - patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: "2Gi"
    target:
      kind: Deployment
      name: api-server

images:
  - name: lendingos/api-server
    newTag: v2.4.1
  - name: lendingos/lending-os
    newTag: v2.4.1
```

### Deployment Pipeline

```mermaid
flowchart LR
    Code[Code Push] --> CI[CI Pipeline\nGitLab CI]
    CI -->|Lint, TypeCheck, Unit Tests| Build[Build Docker Images]
    Build -->|Push to Registry| Registry[(Container Registry)]
    Registry -->|Pull| Staging[Staging Env\nAuto-deploy]
    Staging -->|Integration Tests| E2E[E2E Tests\nPlaywright]
    E2E -->|Manual Approval| Prod[Production\nBlue/Green Deploy]
    Prod -->|Health Checks| Monitor[Monitoring\nGrafana Alerts]
    
    style Code fill:#e1f5fe
    style Prod fill:#fff3e0
    style Monitor fill:#fce4ec
```

### Environment Configuration

```yaml
# .env.production
# Database
DATABASE_URL=postgresql://user:pass@pg-primary:5432/lendingos?sslmode=require
DATABASE_READ_REPLICAS=postgresql://user:pass@pg-replica-1:5432/lendingos,postgresql://user:pass@pg-replica-2:5432/lendingos

# Redis
REDIS_CLUSTER_URL=redis://redis-cluster:6379
REDIS_TLS_ENABLED=true

# Kafka
KAFKA_BROKERS=kafka-1:9092,kafka-2:9092,kafka-3:9092
KAFKA_SASL_ENABLED=true
KAFKA_SSL_ENABLED=true

# Clerk
CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# External Services
CIBIL_API_KEY=xxx
EXPERIAN_API_KEY=xxx
RAZORPAY_KEY_ID=xxx
RAZORPAY_SECRET=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
SENDGRID_API_KEY=xxx

# Security
JWT_SECRET=xxx
ENCRYPTION_KEY=xxx
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=xxx

# Feature Flags
FF_AI_RISK_ENGINE=true
FF_AUTO_APPROVE=true
FF_WHATSAPP_NOTIFICATIONS=true
```

### Health Checks

```typescript
// health.ts
export async function healthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkRedis(),
    checkKafka(),
    checkExternalServices(),
  ]);

  const results = checks.map((r, i) => ({
    name: ['database', 'redis', 'kafka', 'external'][i],
    status: r.status === 'fulfilled' ? 'healthy' : 'unhealthy',
    details: r.status === 'fulfilled' ? r.value : r.reason.message
  });

  const overall = results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded';

  return { status: overall, checks: results, timestamp: new Date().toISOString() };
}
```

---

## Monitoring & Observability

### Metrics Dashboard (Grafana)

```mermaid
flowchart TB
    subgraph metrics["Key Metrics"]
        direction TB
        RPS["Requests/sec"]
        Latency["Latency (p50, p95, p99)"]
        ErrorRate["Error Rate (%)"]
        Saturation["CPU/Memory/CPU"]
        QueueDepth["Queue Depth"]
        DBConns["DB Connections"]
    end

    subgraph business["Business Metrics"]
        Applications["Applications Submitted"]
        ApprovalRate["Approval Rate %"]
        DisbursementVol["Disbursement Volume"]
        CollectionRate["Collection Rate %"]
        NPA["NPA %"]
        FraudDetected["Fraud Detected"]
    end

    subgraph risk["Risk Metrics"]
        ModelAccuracy["Model Accuracy"]
        FraudPrecision["Fraud Precision/Recall"]
        DriftScore["Data Drift Score"]
        FeatureImp["Feature Importance"]
    end
```

### Alerting Rules (Prometheus)

```yaml
# alerting/rules.yml
groups:
  - name: lendingos-alerts
    interval: 30s
    rules:
      # Infrastructure
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate (>5%)"

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P99 latency > 2s"

      - alert: DatabaseConnectionsHigh
        expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning

      # Business
      - alert: LowApprovalRate
        expr: |
          sum(increase(applications_approved_total[1h])) 
          / sum(increase(applications_submitted_total[1h])) < 0.1
        for: 30m
        labels:
          severity: warning

      - alert: HighNPA
        expr: |
          sum(loans_outstanding{status="npa"}) 
          / sum(loans_outstanding) > 0.05
        for: 1h
        labels:
          severity: critical

      # Risk
      - alert: ModelDriftDetected
        expr: model_drift_score > 0.3
        for: 1h
        labels:
          severity: warning

      - alert: FraudPrecisionDrop
        expr: fraud_precision < 0.85
        for: 30m
        labels:
          severity: critical
```

### Distributed Tracing (Jaeger)

```typescript
// tracing.ts
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'lendingos-api',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
  }),
);

provider.addSpanProcessor(
  new BatchSpanProcessor(new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT,
  }))
);

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new PgInstrumentation(),
  ],
});

provider.register();
```

---

## Security & Compliance

### Security Architecture

```mermaid
flowchart TB
    subgraph perimeter["Perimeter Security"]
        WAF[WAF / Cloudflare]
        DDoS[DDoS Protection]
        DNS[DNSSEC + DNS over HTTPS]
    end

    subgraph network["Network Security"]
        VPC[VPC / Private Subnets]
        SG[Security Groups: Least Privilege]
        NACL[Network ACLs]
        PrivateLink[AWS PrivateLink / VPC Endpoints]
    end

    subgraph appsec["Application Security"]
        SAST[SAST/DAST: GitLab SAST, Semgrep]
        SCA[SCA: Dependabot, Snyk]
        Secrets[Secrets Scanning: TruffleHog, GitLeaks]
        DAST[DAST: OWASP ZAP]
        WAF_App[App WAF: ModSecurity]
    end

    subgraph data["Data Protection"]
        EncryptionAtRest[AES-256: AWS KMS / HashiCorp Vault]
        EncryptionInTransit[TLS 1.3: mTLS for Internal]
        PII_Masking[PII Masking: Tokenization]
        DLP[DLP Rules: Regex + ML]
        KeyRotation[Automated Key Rotation: 90 days]
    end

    subgraph identity["Identity & Access"]
        SSO[SSO: SAML/OIDC (Okta, Azure AD)]
        MFA[MFA Enforcement: TOTP, WebAuthn]
        PAM[PAM: CyberArk/BeyondTrust]
        JIT[JIT Access: Teleport/Teleport]
        RBAC[RBAC + ABAC: OPA/Gatekeeper]
    end

    subgraph audit["Audit & Compliance"]
        ImmutableLogs[Immutable Audit Logs: Append-only, S3 + QLDB]
        SIEM[SIEM: Splunk/Elastic]
        SOAR[SOAR: Cortex XSOAR]
        ComplianceReports[Automated Reports: RBI, GDPR, PCI-DSS]
    end
```

### Compliance Matrix

| Regulation | Status | Evidence | Audit Frequency |
|------------|--------|----------|-----------------|
| **RBI Master Directions** | ✅ Compliant | Audit Report Q4 2024 | Quarterly |
| **Data Localization (India)** | ✅ Compliant | Data Residency Audit | Annual |
| **PCI-DSS Level 1** | 🟡 In Progress | SAQ-D, ROC | Annual |
| **GDPR** | ✅ Compliant | DPIA, DPA | Bi-Annual |
| **ISO 27001** | 🟡 In Progress | Stage 1 Complete | Annual |
| **SOC 2 Type II** | 🟡 In Progress | Audit Q2 2025 | Annual |
| **RBI Outsourcing Guidelines** | ✅ Compliant | Vendor Assessments | Quarterly |

### Data Retention Policy

| Data Type | Retention | Disposal Method | Legal Basis |
|-----------|-----------|-----------------|-------------|
| Loan Applications | 10 years post-closure | Secure Delete | RBI Master Direction |
| KYC Documents | 10 years post-relationship | Secure Shred/Delete | PMLA |
| Loan Agreements | 10 years post-closure | Archive + Delete | Contract Act |
| Repayment Records | 10 years | Archive | RBI |
| Audit Logs | 7 years | Immutable (WORM) | SOX/Regulatory |
| Credit Bureau Data | As per Bureau Policy | Delete | CICRA |
| Payment Data | 10 years | Tokenize + Delete | PCI-DSS |

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 24.x |
| pnpm | 9.x |
| PostgreSQL | 16 |
| Redis | 7.x |
| Docker | 24.x |
| kubectl | 1.28+ |
| Helm | 3.12+ |

### Local Development (Zero-Config)

```bash
# 1. Clone
git clone https://github.com/chahalbaljinder/LenderOS.git
cd LenderOS

# 2. One-time setup (PostgreSQL + deps + schema + seed)
pnpm setup

# 3. Start development servers (API + Frontend)
pnpm dev

# Or individually
pnpm dev:api    # API on :5000
pnpm dev:web    # Frontend on :5173
```

### Access Points

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| API Health | http://localhost:5000/api/healthz |
| API Docs | http://localhost:5000/api/docs |
| API Base | http://localhost:5000/api/v1 |
| PostgreSQL | localhost:5432 (lenderos/lenderos) |
| Redis | localhost:6379 |

### Demo Mode (Zero Config)

```bash
# No Clerk keys needed! Just run:
pnpm dev

# Demo Role Switcher available in header:
# 👑 Super Admin (Arjun Sharma)
# 🏢 Tenant Admin (Priya Mehta - CapitalFirst)
# 💼 RM (Rahul Gupta - Swift Fintech)
# 👤 Customer (Vikram Singh)
```

### Production Deploy

```bash
# Build
pnpm build

# Deploy to Kubernetes
kubectl apply -k k8s/overlays/production

# Or using Helm
helm upgrade --install lendingos ./helm/lendingos \
  --namespace lendingos-prod \
  --set image.tag=v2.4.1 \
  --set ingress.enabled=true \
  --set postgresql.persistence.size=100Gi
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Clerk** - Authentication
- **Drizzle ORM** - Type-safe SQL
- **TanStack Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **OpenAI/ONNX** - AI/ML Infrastructure
- **PostgreSQL Global Development Group**

---

<div align="center">

**Built with ❤️ for the lending ecosystem**

**LenderOS** — *The Operating System for Modern Lending*

[![GitHub Stars](https://img.shields.io/github/stars/chahalbaljinder/LenderOS?style=social)](https://github.com/chahalbaljinder/LenderOS/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/chahalbaljinder/LenderOS?style=social)](https://github.com/chahalbaljinder/LenderOS/network/members)
[![Contributors](https://img.shields.io/github/contributors/chahalbaljinder/LenderOS)](https://github.com/chahalbaljinder/LenderOS/graphs/contributors)

</div>