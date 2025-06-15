# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a **LINE Fitness BOT** - a Japanese healthcare assistant that operates through LINE's messaging platform. The bot provides AI-powered fitness guidance, goal setting, training plans, progress tracking, and health consultations using LLM integration.

## Development Commands

Currently, this project is in the specification phase. Based on the documentation, the following commands are expected:

```bash
# Package management (uses pnpm as preferred)
pnpm install           # Install dependencies
pnpm run dev           # Start development server
pnpm run build         # Build for production
pnpm run start         # Start production server

# Code quality
pnpm run lint          # Run ESLint
pnpm run type-check    # Run TypeScript type checking

# Testing
pnpm run test:unit     # Run unit tests
pnpm run test:integration  # Run integration tests
pnpm run test:e2e      # Run end-to-end tests

# Database (when implemented)
pnpm run db:migrate    # Run Prisma migrations
pnpm run db:seed       # Seed database
```

## Architecture Overview

### Core Design Patterns
- **Event-Driven Architecture**: All user interactions flow through an Event Mediator
- **Domain-Driven Design**: Separated into distinct domains (Goal Setting, Workout Planning, etc.)
- **Layer Separation**: Interface → Application → Domain → Infrastructure

### Key Components

**Application Layer:**
- **Event Mediator**: Central orchestrator for all events (messages, button clicks, timers)
- **Session Manager**: Manages user conversation state and context
- **UI Manager**: Handles LINE-specific UI components (rich menus, carousels, etc.)
- **LINE Adapter**: Converts between LINE Messaging API and internal events

**Domain Layer:**
- **Goal Setting**: SMART goal creation with LLM assistance
- **Workout Planning**: AI-generated personalized training plans
- **Workout Execution**: Progress tracking and recording
- **Health Consultation**: LLM-powered health Q&A
- **Prompt Manager**: Manages LLM prompts and conversation history

**Infrastructure Layer:**
- **ChatCompletion**: LLM API wrapper with retry logic
- **Supabase Connector**: Database access with RLS compliance

### Data Flow Pattern

1. LINE Platform → LINE Adapter → Event Mediator
2. Event Mediator → Session Manager (state check) → Domain Module
3. Domain Module → Prompt Manager → ChatCompletion → LLM API
4. Response flows back: LLM → Domain → Event Mediator → LINE Adapter → LINE

## Technology Stack

- **Runtime**: Node.js 18.x, TypeScript 5.x
- **Framework**: Next.js 13.x with App Router
- **Database**: Supabase (PostgreSQL)
- **LLM Integration**: OpenAI, Anthropic Claude, Google Gemini
- **Messaging**: LINE Messaging API
- **Testing**: Jest/Vitest, Playwright for E2E
- **Linting**: ESLint with Airbnb config + Prettier

## Directory Structure

```
src/
├── app/api/line/webhook/     # LINE webhook endpoint
├── domains/                  # Domain modules
│   ├── goal-setting/
│   ├── workout-planning/
│   ├── workout-execution/
│   └── health-consultation/
├── server/                   # Application layer
│   ├── event-mediator/
│   ├── session-manager/
│   ├── prompt-manager/
│   └── ui-manager/
├── lib/                      # Infrastructure
│   ├── supabase/
│   ├── line/
│   └── llm/
└── types/                    # Type definitions
```

## Key Implementation Patterns

### Domain Module Structure
Each domain follows this pattern:
```
domains/[domain-name]/
├── index.ts              # Public interface
├── types.ts              # Domain-specific types
├── service.ts            # Business logic
├── repository.ts         # Data access
├── handlers/             # Event handlers
├── prompts/              # LLM prompt templates
└── messages/             # LINE message templates
```

### Event-Driven Flow
- All user interactions become events
- Event Mediator routes events to appropriate domains
- Domains are loosely coupled through events
- Session Manager maintains conversation state

### LLM Integration Strategy
- Multiple LLM providers with fallback (OpenAI → Claude → Gemini)
- Prompt Manager handles context building and conversation history
- Domain-specific prompt templates
- Structured output with fallback to rule-based responses

## Environment Variables

```bash
# LINE API
LINE_CHANNEL_ID=
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# LLM APIs
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_OAUTH_TOKEN=
```

## Error Handling Strategy

- **API Errors**: Retry with exponential backoff, fallback to alternative providers
- **LLM Failures**: Fallback to pre-defined responses or rule-based logic
- **State Issues**: Provide recovery options to users ("continue from where you left off")
- **Database Errors**: Use in-memory cache where possible

## Testing Strategy

- **Unit Tests**: 80%+ coverage for core logic
- **Integration Tests**: API flows and component interactions
- **E2E Tests**: Complete user scenarios with mocked external services
- **LLM Testing**: Mock LLM responses for consistent testing

## Naming Conventions

- **Files**: kebab-case (`goal-setting.ts`)
- **Classes**: PascalCase (`GoalSettingService`)
- **Functions/Variables**: camelCase (`createGoal`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_GOALS_PER_USER`)

## Development Notes

- This project is currently in specification phase - implementation is based on detailed documentation
- The system is designed for Japanese users with extensive Japanese documentation
- Rich Menu is the primary UI paradigm for LINE interactions
- All user data must comply with Row Level Security (RLS) in Supabase
- LLM prompts should be externalized and versioned
- Conversation history is crucial for context-aware responses

## Important Constraints

- Must work within LINE's messaging constraints (character limits, message types)
- All database access must respect RLS policies
- LLM responses should be safe and appropriate for health advice
- Japanese language support is essential
- Mobile-first design (LINE is primarily mobile)