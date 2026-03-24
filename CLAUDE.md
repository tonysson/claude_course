# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Database operations
npx prisma generate       # Regenerate Prisma client after schema changes
npx prisma migrate dev    # Apply pending migrations
npm run db:reset          # Reset database (destructive)
```

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. Without it, a mock LLM provider is used instead of Claude.
- `JWT_SECRET` — Optional. Defaults to `"development-secret-key"` for local dev.

## Architecture

UIGen is a Next.js 15 app where users describe React components in a chat interface and Claude AI generates them in real time with a live preview.

### Data flow

```
Chat Input → /api/chat (streaming) → Claude with tool calls
  → str_replace_editor / file_manager tools update VirtualFileSystem
  → FileSystemContext propagates changes to UI
  → PreviewFrame re-renders, CodeEditor shows updated files
  → Project saved to SQLite (if authenticated)
```

### Key abstractions

**VirtualFileSystem** (`src/lib/file-system.ts`) — in-memory file system (no disk writes). All generated code lives here. The `FileSystemContext` wraps it and broadcasts changes to the UI.

**AI tools** — Claude is given two tools:
- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/modify files via string replacement
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete files

**LLM provider** (`src/lib/provider.ts`) — selects Anthropic or a mock provider based on whether `ANTHROPIC_API_KEY` is set.

**Chat API** (`src/app/api/chat/route.ts`) — streams responses, handles tool call results, persists projects to DB after each turn.

**Auth** (`src/lib/auth.ts`) — JWT sessions via `jose`. Anonymous usage is allowed; projects are saved per-user only when authenticated. Middleware at `src/middleware.ts` protects `/api/projects` and `/api/filesystem`.

### UI layout

Three-panel layout in `src/app/main-content.tsx`:
1. **Left** — Chat interface (`src/components/chat/`)
2. **Center** — Live preview iframe (`src/components/preview/PreviewFrame.tsx`) or Monaco code editor (`src/components/editor/CodeEditor.tsx`)
3. **File tree** — `src/components/editor/FileTree.tsx` for navigating generated files

### Data persistence

Prisma + SQLite (`prisma/dev.db`). Two models:
- `User` — email/password (bcrypt hashed)
- `Project` — stores chat `messages` and file system `data` as JSON blobs; `userId` is nullable to support anonymous projects

### Path alias

`@/*` maps to `src/*`.

### Testing

Vitest with jsdom + React Testing Library. Tests live in `__tests__/` directories alongside the code they test.
