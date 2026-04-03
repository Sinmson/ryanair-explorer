# Ryanair Explorer

A modern flight search application built with Angular that helps you find the cheapest Ryanair flights. Features a generic provider architecture designed to support multiple airlines in the future.

## Tech Stack

- **Framework:** Angular 21 (Standalone Components, Zoneless)
- **State Management:** @ngrx/signals SignalStore
- **Styling:** Tailwind CSS v4 with custom design system
- **HTTP:** Angular HttpClient with httpResource
- **UI Library:** Custom reusable component library (`@ryanair-explorer/ui`)
- **Testing:** Vitest
- **Linting:** ESLint with angular-eslint
- **CI/CD:** GitHub Actions
- **Deployment:** Docker + nginx

## Architecture

The project follows a modular architecture with clear separation of concerns:

```
src/app/
├── core/                    # Core business logic
│   ├── models/              # Generic, provider-agnostic interfaces
│   ├── providers/           # Airline-specific adapters (Ryanair, ...)
│   │   └── ryanair/         # Ryanair API types, service, mapper
│   ├── store/               # SignalStore (provider-agnostic)
│   └── services/            # App-wide services (theme, etc.)
├── shared/                  # App-specific components
│   ├── header/
│   ├── footer/
│   ├── airport-selector/    # Wraps ui-autocomplete + ui-tag-input
│   ├── date-range/          # Wraps ui-date-picker
│   ├── days-selector/       # Wraps ui-range-slider
│   └── flight-table/        # Wraps ui-table
├── pages/
│   └── home/                # Main search page
└── app.ts                   # Root component

projects/ui/                 # Publishable generic UI library
├── src/lib/
│   ├── table/               # Generic sortable, paginated table
│   ├── autocomplete/        # Search with dropdown suggestions
│   ├── tag-input/           # Tag display with removal
│   ├── date-picker/         # Date input with label
│   └── range-slider/        # Dual-thumb min/max slider
└── package.json
```

### Adding a New Airline Provider

1. Create a new folder under `src/app/core/providers/` (e.g. `easyjet/`)
2. Define the raw API response types (`*-api.types.ts`)
3. Map wire formats into **shared models** (`Airport`, `FlightFare`, `FareAvailabilitySummary`, …)
4. Add a service: implement `FlightProviderService` when the provider matches airport list + round-trip fare search; otherwise expose focused methods (e.g. EasyJet calendar → `FareAvailabilitySummary`)
5. Wire into `FlightStore` (or other consumers) when ready

Dev proxy in `proxy.conf.json`: `/api/ryanair` → Ryanair, `/api/easyjet` → easyJet (see `pathRewrite`).

The home page runs **Ryanair** round-trip search and, in parallel, **easyJet CMS** “published” one-way hints when at least one airport tag is set. The CMS request mirrors the browser flags: **`AllOrigins` / `AllDestinations` are `true` only when you leave that side unconstrained**; otherwise `OriginIatas` / `DestinationIatas` (and preferred = first code) are sent. If easyJet uses different parameter names, adjust `EasyJetService.searchPublishedFlights`.

#### easyJet: curl, Bruno, and 403

Akamai often returns **403** for `ejcms/cache15m/api/flights/search` when the call is not close enough to a real browser session. A `curl` copied from **your** machine with **your** `Cookie` and `User-Agent` can still succeed there, while the same URL from WSL, CI, or Bruno without cookies may not.

- **Bruno:** optional variable `easyjetCookie` in `bruno-api-collection/environments/local.bru` — paste the raw `Cookie` header value from DevTools (Network → the request → Request Headers).
- **Angular:** the browser sends `localhost` as `Referer`; if easyJet stays empty in the UI, check the Network tab for `/api/easyjet/...` status.

## Getting Started

### Prerequisites

- Node.js >= 22
- npm >= 10

### Development

```bash
# Install dependencies
npm install

# Start dev server with API proxy
npm start
# App runs at http://localhost:4200

# Build UI library (needed for first run)
npx ng build ui

# Run tests
npx vitest run

# Run tests in watch mode
npx vitest

# Lint
npx ng lint

# Build for production
npx ng build --configuration production
```

### Docker

The image only packages the static `dist` output (nginx). Build the app first, then build the image:

```bash
npx ng build ui
npx ng build --configuration production
docker build -t ryanair-explorer .

docker run -p 8080:80 ryanair-explorer
```

On `main` / `master`, CI builds the app once, then builds this image from that artifact and can push it to GitHub Container Registry (`ghcr.io`) — see `.github/workflows/ci.yml`.

## UI Library

The `projects/ui/` library contains generic, reusable Angular components that can be published as an npm package:

| Component | Description |
|-----------|-------------|
| `ui-table` | Generic sortable table with pagination and custom cell templates |
| `ui-autocomplete` | Search input with filtered dropdown and keyboard navigation |
| `ui-tag-input` | Display and remove tags |
| `ui-date-picker` | Date input with optional label |
| `ui-range-slider` | Dual-thumb range slider |

### Publishing the Library

```bash
npx ng build ui
cd dist/ui
npm publish
```

## Design System

Custom Tailwind theme with:
- **Primary:** Ryanair Blue (#073590)
- **Accent:** Gold (#F5C518)
- **Surface:** Neutral grays
- **Dark mode** with class-based toggle and localStorage persistence
- **Font:** Inter (sans-serif), JetBrains Mono (monospace)

## License

MIT
