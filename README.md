# MedInvo Frontend

This is the React frontend for the MedInvo pharmacy management system. It provides a simple interface for managing inventory and creating customer orders.

## Stack

- React 19
- Vite
- JavaScript + CSS
- Nginx for production serving

## Features

- View all products in inventory
- Add new products
- Create customer orders
- Refresh data from the backend APIs
- Display recent orders and inventory totals

## Project structure

```text
.
├── .github/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
├── .gitignore
├── Dockerfile
├── index.html
├── nginx.conf
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Prerequisites

- Node.js 20+
- npm
- Running backend services for:
  - `product-service` at `/api/products`
  - `order-service` at `/api/orders`

## Installation

```bash
git clone https://github.com/MedInvo/frontend.git
cd frontend
npm ci
```

## Running in development

```bash
npm run dev
```

The app runs with Vite's default dev server, typically on:

```text
http://localhost:5173
```

## Production build

```bash
npm run build
```

The built files are generated in the `dist/` directory.

## Docker

```bash
docker build -t medinvo-frontend .
docker run -p 80:80 medinvo-frontend
```

The production container serves the app with nginx and proxies API requests to the backend services configured in `nginx.conf`.

## API routing expectations

The frontend expects these endpoints:

- `GET /api/products`
- `POST /api/products`
- `GET /api/orders`
- `POST /api/orders`

In the production nginx configuration, these are proxied to:

- `http://product-service:8001`
- `http://order-service:8000`

## Scripts

```bash
npm run dev    # start vite dev server
npm run build  # create production build
npm test       # run Vitest tests
```

## Notes

- This repository intentionally does not include a README before this addition; this file documents how to install dependencies and run the app.
- If you run the app in a local development environment, make sure the backend APIs are reachable from the browser or configure a Vite proxy to route `/api` requests appropriately.
