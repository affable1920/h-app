# H-App

A full-stack telehealth application built with React, TypeScript, FastAPI, and PostgreSQL. H-App brings doctor discovery, scheduling, appointment workflows, AI chat, and real-time video consultations together in one application.

## Overview

The application includes patient and doctor workflows for browsing profiles, setting up doctor accounts, managing schedules and appointments, and initiating consultations. The frontend communicates with the backend over HTTP and authenticated WebSockets. The backend persists application data in PostgreSQL and exposes an OpenAPI schema used to generate client types.

## Development highlights

- Separate patient and doctor routes, profiles, and onboarding flows.
- Scheduling data models recurring schedule rules separately from bookable slots and appointments.
- WebRTC peer connections use browser media streams and exchange SDP offers/answers and ICE candidates through authenticated WebSocket signaling.
- Incoming ICE candidates are buffered until the remote description is ready; the calling flow tracks states such as connecting, ringing, and connected.
- AI chat supports authenticated requests, conversation history, and streamed responses.
- Docker Compose starts the client, API, and PostgreSQL database for local development.

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Client data and forms | TanStack Query, Zustand, React Hook Form, Zod |
| Backend | Python, FastAPI, Pydantic, Uvicorn |
| Database | PostgreSQL, SQLAlchemy, Alembic, asyncpg, psycopg2 |
| Real-time communication | WebSockets, WebRTC |
| AI integration | Groq API |
| Development tools | Docker, Docker Compose, ESLint |

## Selected libraries and frameworks

### React and TypeScript

React provides the component model for the client UI. TypeScript adds static types to components, application state, and API data.

### Vite

Vite runs the client development server and builds the frontend. From `Client/`, use `npm run dev` to start the development server or `npm run build:check` to run TypeScript checks and create a production build.

### React Router

React Router defines application navigation, route layouts, loaders, and patient/doctor route areas.

### TanStack Query

TanStack Query manages server-state in the client: it runs queries, caches results, exposes loading and error states, and supports refreshing data after mutations. Query hooks are used for API-backed data such as doctors and appointments.

### React Hook Form and Zod

React Hook Form manages form state and submissions. Zod schemas define input validation, connected through the Hook Form resolver; this is used in workflows such as doctor onboarding.

### Zustand

Zustand provides lightweight shared client state, including authentication-related state used across routes and the calling experience.

### FastAPI

FastAPI defines the backend's HTTP and WebSocket endpoints, dependency injection, and generated OpenAPI documentation. The interactive API docs are available at `/docs` when the server is running.

### Pydantic

Pydantic validates and serializes backend request/response data and loads typed application settings from environment variables. It is also used to validate structured WebSocket messages.

### SQLAlchemy

SQLAlchemy maps Python models to relational tables and manages database connections and sessions. The application uses async sessions for request-time database operations and a synchronous engine for migration tooling.

### PostgreSQL and database drivers

PostgreSQL stores application records. `asyncpg` provides the asynchronous PostgreSQL driver used by the API, while `psycopg2` provides the synchronous driver used by the migration setup.

### Alembic

Alembic tracks and applies database schema changes. The backend container runs `alembic upgrade head` during startup.

### WebRTC and WebSocket signaling

WebRTC handles peer-to-peer audio/video media in the browser. The WebSocket connection carries authenticated call setup and lifecycle messages, including SDP offers/answers and ICE candidates; it does not carry the audio/video stream itself. The current peer connection configuration uses public STUN servers. Networks that require relaying may need TURN infrastructure.

## Architecture

```text
React + TypeScript client
  ├── HTTP requests ───────────────> FastAPI ─────> PostgreSQL
  ├── WebSocket signaling ─────────> FastAPI ─────> call setup messages
  └── Streamed AI chat requests ───> FastAPI ─────> AI provider

Browser A <──────── WebRTC media connection ────────> Browser B
```

## Repository layout

```text
.
├── Client/                  # React + TypeScript application
│   └── src/
│       ├── components/      # Shared UI and route components
│       ├── features/        # Feature modules, including calling and onboarding
│       ├── routing/         # Route configuration, loaders, and middleware
│       └── types/           # API and application types
├── Server/                  # FastAPI application
│   ├── app/
│   │   ├── core/            # Configuration and application infrastructure
│   │   ├── database/        # SQLAlchemy models and database sessions
│   │   ├── features/        # Authentication, chat, and calling
│   │   ├── routes/          # HTTP endpoints
│   │   └── schemas/         # Request, response, and domain schemas
│   ├── alembic/             # Database migrations
│   └── tests/               # Backend tests
└── docker-compose.yaml      # Local database, API, and client services
```

## Local development

Run commands in a terminal on your development machine. Docker Compose commands run from the **repository root** (`h-app/`); commands for a specific service run from that service's directory, as noted below.

### Prerequisites

- Git
- Docker with Docker Compose
- [mkcert](https://github.com/FiloSottile/mkcert) for local HTTPS certificates
- Node.js 20+ and Python 3.12+ only if running the client or server directly outside Docker

### 1. Clone the repository

Run in your terminal. `cd h-app` changes the current directory into the cloned repository:

```bash
git clone https://github.com/affable1920/h-app.git
cd h-app
```

### 2. Configure local environment files

Create a `.env` file in the **repository root** for the PostgreSQL container:

```dotenv
POSTGRES_USER=happ
POSTGRES_PASSWORD=choose_a_local_password
POSTGRES_DB=happ
```

Create `Server/.env` for backend settings:

```dotenv
ENV=dev
DATABASE_URL=postgresql://happ:choose_a_local_password@localhost:5432/happ
DATABASE_URL_ASYNC=postgresql+asyncpg://happ:choose_a_local_password@localhost:5432/happ
ALLOWED_ORIGINS=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
GROQ_API_KEY=your_groq_api_key
GMAIL_PASSWORD=your_email_app_password
```

Use the same database name, user, and password in both files. Replace the example values with your local credentials. The backend settings require these variables; the AI and email integrations also require valid provider credentials when you use those features. Do not commit either `.env` file.

**Why are there two database URLs?** They connect to the same PostgreSQL database through different drivers. `DATABASE_URL` uses synchronous `psycopg2` for the migration tooling; `DATABASE_URL_ASYNC` uses `asyncpg` for the API's asynchronous SQLAlchemy sessions. When running in Compose, the backend changes the database hostname from `localhost` to the Compose service name `db`. If a password contains URL-reserved characters, percent-encode them (for example, `@` as `%40`).

### 3. Create local HTTPS certificates

From the repository root, install mkcert's local certificate authority and generate the filenames expected by Docker Compose:

```bash
mkcert -install
mkcert -key-file localhost+3-key.pem -cert-file localhost+3.pem localhost 127.0.0.1 ::1
```

The certificate and key files are local development files; keep them out of commits.

### 4. Start the application with Docker Compose

From the repository root, build and start the database, backend, and frontend services:

```bash
docker compose up --build
```

Compose waits for PostgreSQL and the backend health check before starting dependent services. The backend container applies Alembic migrations during startup. When the services are ready, open:

- Client: `https://localhost:5173`
- API documentation: `https://localhost:8000/docs`
- API health check: `https://localhost:8000/ping`

If the browser reports a certificate warning, check that mkcert's local certificate authority is installed and trusted by the browser/operating system.

To stop the running services, press `Ctrl+C` in the Compose terminal. To remove the containers while keeping the database volume, run from the repository root:

```bash
docker compose down
```

To also delete the PostgreSQL data volume and reset the local database, run:

```bash
docker compose down -v
```

### Frontend checks on your machine

Run these commands in a terminal from the `Client/` directory. `npm ci` installs the versions recorded in `package-lock.json`; lint and build commands check the frontend.

```bash
cd Client
npm ci
npm run lint
npm run build:check
```

To run the Vite development server directly on your machine, use `npm run dev` from `Client/`. This starts only the client; the API and database must also be running, and the client proxy/environment settings must match your local setup. Docker Compose provides the configured full stack.

### Backend tests on your machine

Run these commands from `Server/`. A Python virtual environment keeps this project's installed packages separate from other Python projects. Activation applies to the current terminal session; activate it again in each new terminal.

**macOS/Linux (bash or zsh):**

```bash
cd Server
python3 -m venv .venv               # Create the isolated environment in Server/.venv
source .venv/bin/activate           # Activate it in this terminal
python -m pip install -r requirements.txt  # Install backend dependencies into the environment
python -m unittest discover -s tests      # Run backend tests
```

**Windows (PowerShell):**

```powershell
cd Server
py -m venv .venv                         # Create the isolated environment in Server\.venv
.\.venv\Scripts\Activate.ps1            # Activate it in this PowerShell session
python -m pip install -r requirements.txt # Install backend dependencies into the environment
python -m unittest discover -s tests      # Run backend tests
```

Backend commands that load application settings require `Server/.env`. Running the API directly also requires a reachable PostgreSQL database.

### Generate frontend API types

Start the API with local HTTPS enabled. Then, in a separate terminal, run from `Client/`:

```bash
cd Client
npm run generate-types
```

This reads `https://localhost:8000/openapi.json` and writes generated types into the client. The Docker Compose development command uses the Docker-specific type-generation script to access the API over the Compose network.

## API and data flow

FastAPI publishes an OpenAPI schema at `/openapi.json` and interactive documentation at `/docs`. The client can generate TypeScript types from that schema. TanStack Query manages API request state and cached server data in the frontend.

The database layer uses synchronous and asynchronous SQLAlchemy engines for different use cases: synchronous migration tooling and asynchronous request-time database access, respectively.

## License

A software license defines the terms for using, modifying, and distributing code. Refer to the license information in the repository for the applicable terms.
