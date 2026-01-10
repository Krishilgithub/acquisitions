# Acquisitions App

A Node.js application using Express, Drizzle ORM, and Neon Database.

## Docker Setup

The project supports two Docker environments:

1.  **Development**: Runs the application alongside a local Neon proxy for isolated development.
2.  **Production**: Runs the application connected to the live Neon Cloud Cloud.

### Prerequisites

- Docker & Docker Compose
- Neon Account & API Key (for Development proxy)

### Development Environment

In this mode, we use `neondatabase/neon_local` to proxy database requests, allowing for ephemeral branching and local testing.

1.  **Configure Environment**:
    Copy `.env.development.example` to `.env`.

    ```bash
    cp .env.development.example .env
    ```

    Fill in your `NEON_API_KEY`, `NEON_PROJECT_ID`, and `BRANCH_ID`.

2.  **Start Services**:

    ```bash
    docker-compose -f docker-compose.dev.yml up --build
    ```

    - The app will reside at `http://localhost:3000`.
    - The database is proxied at `localhost:5432`.
    - The app container is configured to talk to `neon-proxy:5432`.

3.  **Local Dev (No Docker App)**:
    If you want to run the app on your host machine but use the Dockerized Neon proxy:
    - Ensure `.env` has `USE_NEON_LOCAL=true` and `NEON_LOCAL_HOST=localhost`.
    - Run `docker-compose -f docker-compose.dev.yml up neon-proxy`.
    - Run `npm run dev` locally.

### Production Environment

In production, the app connects directly to the Neon Cloud URL.

1.  **Configure Environment**:
    Copy `.env.production.example` to `.env`.

    ```bash
    cp .env.production.example .env
    ```

    Set `DB_URL` to your Neon connection string (e.g., `postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).
    Set `NODE_ENV=production`.

2.  **Start Services**:
    ```bash
    docker-compose -f docker-compose.prod.yml up --build -d
    ```

### Environment Variables

| Variable | Description |
|s---|---|
| `DB_URL` | Postgres connection string (Standard or Neon Local proxy) |
| `NEON_API_KEY` | (Dev Only) Key for Neon API to manage branches |
| `USE_NEON_LOCAL` | Set to `true` to enable HTTP proxy config for Neon Local |
| `NEON_LOCAL_HOST` | Hostname of Neon proxy (`neon-proxy` in docker, `localhost` on host) |
