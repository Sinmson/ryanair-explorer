# Contributing

## Development Setup

1. Clone the repository
2. Run `npm install`
3. Run `npx ng build ui` (build the UI library first)
4. Run `npm start` to start the dev server

## Project Structure

- `src/app/core/` — Business logic, models, services, store
- `src/app/shared/` — App-specific reusable components
- `src/app/pages/` — Route-level page components
- `projects/ui/` — Generic, publishable UI component library

## Conventions

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring
- `docs:` — Documentation
- `test:` — Tests
- `chore:` — Build, CI, tooling

### Branches

- `main` — Production-ready code
- `feat/<name>` — Feature branches
- `fix/<name>` — Bug fix branches

### Code Style

- All components are standalone
- Use Angular Signals (`signal()`, `computed()`, `input()`, `output()`, `model()`) everywhere
- Minimize RxJS usage — prefer Signals and `httpResource`
- Use `@ngrx/signals` SignalStore for state management
- Tailwind CSS for styling — no inline styles
- Generic interfaces for all data models (provider-agnostic)

### Testing

- Write tests with Vitest
- Run `npx vitest run` before pushing
- Tests are co-located with source files (`*.spec.ts`)

### Pull Requests

1. Create a feature/fix branch
2. Make changes and ensure CI passes
3. Open a PR against `main`
4. Get at least one review approval
