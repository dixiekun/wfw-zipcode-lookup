# WFW Zipcode Lookup

A Svelte-based application for looking up WFW chapter information by zipcode, state, chapter, chapter ID, or seller number.

## Overview

This application provides a simple and efficient way to search for WFW chapter information using various search criteria. The data is sourced from a Google Sheet and displayed in a user-friendly interface with pagination and filtering capabilities.

## Features

- Real-time search as you type
- Search by zipcode, state, chapter, chapter ID, or seller number
- Prioritized search results (exact matches first, then partial matches)
- Responsive design with Tailwind CSS
- Pagination for easy navigation through results
- Loading indicators and error handling

## Tech Stack

- [Svelte 5](https://svelte.dev/) with runes for state management
- [SvelteKit](https://kit.svelte.dev/) for routing and server-side rendering
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Axios](https://axios-http.com/) for data fetching
- Google Sheets API for data storage

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, pnpm, or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
pnpm install
# or
yarn
```

### Development

Start the development server:

```bash
npm run dev
# or
npm run dev -- --open  # Opens browser automatically
```

### Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Data Source

The application fetches data from a Google Sheet. The Sheet ID is configured in the `googleSheetService.ts` file.

## Deployment

This application can be deployed to any static hosting service. You may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Additional Commands

- `npm run check` - Run type checking
- `npm run lint` - Run linting
- `npm run format` - Format code with Prettier
