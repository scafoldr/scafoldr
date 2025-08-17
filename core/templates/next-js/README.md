# Next.js Starter with Architectural Boundaries

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and enhanced with strict architectural boundaries using ESLint.

## 🏗️ Architecture Rules for LLMs

**This project enforces strict architectural boundaries via ESLint. When working on this codebase, you MUST follow these import rules:**

```
App Layer (src/app/**)
    ↑ can import from
Entities Layer (src/entities/**)
    ↑ can import from
Shared Layer (src/components, src/lib, src/hooks, etc.)
```

**Critical Rules:**
- **Shared modules** → Can ONLY import from other shared modules
- **Entities** → Can ONLY import from shared modules + same entity
- **App pages** → Can import from shared modules + any entity
- **Entities CANNOT import from other entities** (strict isolation)

**ESLint will block any violations of these rules.**

## 📁 Directory Structure

```
src/
├── app/                    # 🎯 Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── entities/              # 🧩 Entity modules (isolated)
│   ├── products/          # Product entity
│   ├── users/             # User management entity
│   └── sales/             # Sales entity
├── components/            # 📦 Shared UI components
├── lib/                   # 📦 Shared utilities & configurations
├── hooks/                 # 📦 Shared React hooks
├── drizzle/              # 📦 Database schema & migrations
├── server/               # 📦 Server-side utilities
└── tasks/                # 🚫 Build/deployment scripts (restricted)
```

## 🛡️ Architectural Rules

Our ESLint configuration enforces these architectural boundaries:

### 📦 Shared Layer
- **Location**: `src/{components,lib,hooks,drizzle,server,data}/**/*`
- **Can import**: Only other shared modules
- **Purpose**: Reusable utilities, components, and configurations

### 🧩 Entities Layer  
- **Location**: `src/entities/{entityName}/**/*`
- **Can import**: Shared modules + same entity only
- **Purpose**: Isolated business logic and entity-specific code

### 🎯 App Layer
- **Location**: `src/app/**/*`
- **Can import**: Shared modules, any entity, CSS files
- **Purpose**: Next.js pages, layouts, and routing

### 🚫 Restricted Files
- **Location**: `src/*`, `src/tasks/**/*`
- **Can import**: Shared modules and entities
- **Purpose**: Root-level files and build scripts

## 🔧 ESLint Configuration

This project uses ESLint 9 with `eslint-plugin-project-structure` to enforce architectural boundaries:

- **Configuration**: [`eslint.config.mjs`](eslint.config.mjs)
- **Boundary Rules**: [`independentModules.jsonc`](independentModules.jsonc)

## 🚀 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Linting

Run ESLint to check architectural boundaries:

```bash
npm run lint
```

The linter will enforce:
- ✅ Proper import boundaries between layers
- ✅ Feature isolation (features can't import from other features)
- ✅ Shared module restrictions
- ✅ Circular dependency detection

## 📚 Learn More

To learn more about Next.js and the architectural patterns used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [ESLint Plugin Project Structure](https://github.com/Igorkowalski94/eslint-plugin-project-structure) - architectural linting
