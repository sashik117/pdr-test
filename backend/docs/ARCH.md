# System Architecture

## Overview

The PDR Website backend is built with **Nitro** (unjs/nitro), designed for high performance and deployment flexibility. It uses **MongoDB** as the primary data store.

## Core Components

### 1. Configuration Layer (`config/`)
- Handles environment variable validation using `zod`.
- Ensures type safety for all configuration values.
- Fails fast if required variables are missing.

### 2. Data Access Layer (`models/`)
- **Single Responsibility Principle**: Each model is in its own file.
- Exports TypeScript interfaces and functions to get MongoDB collections.
- Decoupled from connection logic to prevent circular dependencies.

### 3. Business Logic Layer (`services/`)
- Contains the core business rules.
- Stateless classes/functions.
- Uses `models` for data access.
- Examples: `AuthService`, `PaymentService`, `TestsService`.

### 4. API Layer (`api/`)
- Nitro event handlers.
- Validates request input.
- Calls services.
- Returns standardized responses.

### 5. Infrastructure / Cross-Cutting Concerns

- **Logging**: structured JSON logging using `winston` via `utils/logger.ts`. logs are rotated daily.
- **Rate Limiting**: Custom MongoDB-based rate limiter implementation (`services/rate-limit.service.ts` + `middleware/rate-limiter.ts`).
- **Resilience**: Exponential backoff retry utility (`utils/retry.ts`).
- **Idempotency**: `Idempotency-Key` header support for critical operations (`utils/idempotency.ts`).
- **Connecton Management**: Centralized connection logic in `utils/connection.ts`.

## Data Flow

Request -> Middleware (Auth/RateLimit) -> API Handler -> Service -> Model -> Database

## Key Design Decisions

- **Direct MongoDB Driver**: Used instead of Mongoose for better performance and explicit control.
- **Zod for Validation**: Used for both ENV validation and runtime request validation.
- **Stateless Services**: Services do not hold state, making horizontal scaling easier.
- **Repository Pattern (Light)**: `models/*` act as light repositories/DAOs.

## Future Improvements

- **Caching Layer**: Redis could be introduced for rate limiting and session storage if MongoDB becomes a bottleneck.
- **Queue System**: For long-running tasks like image processing or email sending (currently handled in-process or skipped).
