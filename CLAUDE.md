# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Telegram Mini Apps template built with Next.js, TypeScript, and the Telegram SDK. It includes user authentication with better-auth, database management with Prisma, and Telegram-specific features like TON Connect integration.

## Development Commands

```bash
# Install dependencies (requires pnpm)
pnpm install

# Development server
pnpm run dev                 # Standard development mode (http://localhost:3000)
pnpm run dev:https          # HTTPS development mode for Telegram testing

# Build and deploy
pnpm run build              # Includes Prisma generate & migrate deploy
pnpm run start              # Start production server
pnpm run lint               # Run ESLint

# Database management (Prisma)
pnpm prisma generate        # Generate Prisma client
pnpm prisma migrate dev     # Create migrations in development
pnpm prisma migrate deploy  # Apply migrations in production
pnpm prisma studio          # Open Prisma Studio GUI
```

## Architecture Overview

### Core Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth with Telegram init data validation
- **UI**: Telegram UI components + Tailwind CSS
- **Internationalization**: next-intl (en/ru locales)

### Key Directories

1. **`/src/app/`** - Next.js App Router pages and API routes
   - `api/` - API endpoints including user management and protected routes
   - Pages demonstrate Telegram SDK features (init-data, theme-params, ton-connect)

2. **`/src/lib/`** - Core utilities and services
   - `auth.ts` - better-auth configuration
   - `validate-telegram-data.ts` - Telegram init data validation with HMAC-SHA256
   - `services/` - Business logic (telegram-service, user-service)
   - `api-client.ts` - Client-side API wrapper with Telegram auth headers

3. **`/src/components/`** - React components
   - `Root/` - App wrapper with providers and Telegram SDK initialization
   - Uses CSS modules for styling

4. **`/src/core/`** - Application initialization
   - `init.ts` - Telegram SDK setup and component mounting
   - `i18n/` - Internationalization configuration

5. **`/prisma/`** - Database schema and migrations
   - Models: User, TelegramUser, Session, Account, Verification

### Authentication Flow

1. **Production**: Validates Telegram init data using HMAC-SHA256 with bot token
2. **Development**: When `NEXT_PUBLIC_ENABLE_DEV_MODE=true`, uses mock authentication  
3. API routes expect `authorization: tma <initData>` header
4. User data synced between Telegram and database via `/api/users` endpoint

### Development Mode Features

- **Mock Environment**: `src/hooks/useTelegramMock.ts` simulates Telegram environment (imported in Root component)
- **Dev Authentication**: Set `NEXT_PUBLIC_ENABLE_DEV_MODE=true` and `TELEGRAM_DEV_SECRET` in `.env`
- **Eruda Debugger**: Mobile debugging tool can be enabled
- **macOS Fixes**: Special handling for Telegram Desktop on macOS

### Environment Variables

Required in `.env`:
```bash
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
TELEGRAM_BOT_TOKEN="your-bot-token"

# Development only
NEXT_PUBLIC_ENABLE_DEV_MODE=true
TELEGRAM_DEV_SECRET="dev-secret"
```

### Testing in Telegram

1. Run `pnpm run dev:https` for HTTPS development server
2. Accept the SSL certificate warning in browser
3. Submit `https://127.0.0.1:3000` to @BotFather as Mini App URL
4. Test in Telegram Web/Desktop/Mobile apps

### Key Integration Points

- **Telegram SDK**: Initialized in `src/core/init.ts`, mounts theme params, viewport, back button
- **User Context**: `src/contexts/UserContext.tsx` provides authenticated user data
- **API Client**: `src/lib/api-client.ts` automatically includes Telegram auth headers
- **Route Protection**: API routes validate Telegram user before processing requests
- **Telegram Validation**: `src/lib/validate-telegram-data.ts` handles auth validation for API routes