# Ryanair Explorer - Flight Search

A modern web app to explore and search for Ryanair flights, built with React, TypeScript, Vite, and Grommet. Features include airport selection, date range, trip duration, and a results table with direct Ryanair booking links.

## Features
- Search for round-trip Ryanair flights by departure/arrival airport, date range, and trip duration
- Modern UI with Grommet components
- Results table with country flags, city, airport, and direct booking links
- Locale-aware date and currency formatting
- Error boundary for robust error handling
- Fully containerized with Docker

## Getting Started

### Prerequisites
- Node.js (>=18)
- npm (>=9)
- Docker (for containerization)

### Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```
3. **Lint and format:**
   ```bash
   npm run lint
   npm run format
   ```
4. **Run tests:**
   ```bash
   npm test
   ```

### Build for Production
```bash
npm run build
```
The output will be in the `dist/` directory.

### Docker
Build and run the app in a container:
```bash
docker build -t yourdockerhubusername/ryanair-explorer:latest .
docker run -p 3000:80 yourdockerhubusername/ryanair-explorer:latest
```

### Environment Variables
- No special environment variables are required for the frontend.

## Project Structure
```
src/
  components/         # React components (flight search, table, etc.)
  styles/             # Global and component styles
  services/           # API clients
  types/              # TypeScript types
  App.tsx             # Main app
  main.tsx            # Entry point
public/
  index.html          # HTML template
```

## Deployment
- The app is production-ready and can be deployed to any static host or container platform.
- For Docker, see the instructions above.

## License
MIT 