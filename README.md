# Amazon Clone - MERN Assignment II

A simple Amazon-inspired shopping application for **Bibek · SCA24CA0016 · BCA Semester V · Section A**.

**Course:** 24CA3511 - Full Stack Development. **Faculty:** Ms. Priyanka D Rukesh. **Submission:** 18 November 2026.

## Run the project

Requirements: Node.js 22.12 or later, npm, and Docker Desktop running. MongoDB runs locally in Docker; no paid service or API key is needed.

```bash
npm ci
npm run setup
npm run dev
```

Open **http://localhost:5173**. The API runs at **http://localhost:5001/api**.

`setup` creates `.env` with a random JWT secret, starts MongoDB, waits until it is healthy, and seeds eight products plus two demo accounts. Re-running the seed preserves existing accounts, catalog data, carts, and orders.

| Role          | Email             | Password    |
| ------------- | ----------------- | ----------- |
| Customer      | demo@example.com  | Demo12345!  |
| Administrator | admin@example.com | Admin12345! |

The sign-in page also has **Try customer demo** and **Try admin demo** buttons. New registrations always receive the customer role. Use the admin account to demonstrate product CRUD.

## Features

- Responsive Amazon-style header, product grid, product details, and prices in INR.
- Product search, category filters, price/rating sorting, and deal listings.
- Registration and login with bcrypt password hashing and JWT authentication.
- JWT stored in an HttpOnly, SameSite cookie; protected API and React routes.
- Persistent MongoDB cart: add items, view, update quantity, delete items.
- Address form and cash-on-delivery **demo** checkout with server-calculated totals.
- Order history with product snapshots that survive product deletion.
- Admin-only product create, read, update, and delete screens and REST endpoints.
- Local product photographs; no remote image or font requests during use.
- Sixteen integration tests against real MongoDB, using a disposable isolated test database.

This is a college demonstration. Product descriptions and ratings are sample data. Checkout does not charge money, ship goods, track stock counts, or contact a delivery service. Availability is managed with an in-stock flag. Product photos are selected from eight bundled images; uploads, reviews, payments, returns, and email delivery are outside this version.

## Manual setup / MongoDB Atlas

If you already have MongoDB, skip Docker. Copy `.env.example` to `.env`, set `MONGODB_URI`, and replace `JWT_SECRET` with a random string of at least 32 characters. Then run:

```bash
npm ci
npm run seed
npm run dev
```

For Atlas, use the connection URI supplied by your own Atlas project. Do not put credentials in source files. The supplied `.env` is ignored by Git and omitted from the submission ZIP.

## Build and start

```bash
npm run build
npm start
```

Open **http://localhost:5001** to use the built React application served by Express. Keep `NODE_ENV=development` for this local HTTP demonstration. For a real HTTPS deployment, set `NODE_ENV=production` to enable Secure cookies and production security headers. `server/src/index.js` binds to loopback for this local assignment; change the host explicitly if deploying to a hosting provider.

## Validation

Keep MongoDB running, then:

```bash
npm test
npm run build
npm run format:check
```

Tests create a unique `amazon_test_*` database, check the API, then drop only that test database. Optional `TEST_MONGODB_URI` selects another MongoDB server for tests; do not point it at a server where you lack permission to create and drop test databases.

## Project structure

```text
client/
  public/images/     Bundled product photography
  src/App.tsx        React Router pages, catalog, cart, checkout, admin
  src/context.tsx    Authentication and store state via React Context
  src/components.tsx Reusable product cards, rating, modal, add-to-cart
  src/api.ts         Shared JSON fetch helper
  src/types.ts       TypeScript models and currency formatting
  src/styles.css     Responsive CSS
server/
  src/app.js         Express REST endpoints, JWT/role middleware, validation
  src/models.js      User, Product, Cart, and Order Mongoose schemas
  src/index.js       MongoDB connection and HTTP server
  src/seed.js        Demo accounts and product catalog
  test/api.test.js   16 MongoDB integration tests
scripts/setup.mjs    Local environment and database setup
docs/                Project report, API reference, viva guide, verification
output/pdf/          Submission-ready report
output/playwright/   Actual application screenshots
```

## Assignment requirements

| Required item               | Implementation                                                   |
| --------------------------- | ---------------------------------------------------------------- |
| MongoDB                     | Mongoose models persist accounts, products, carts, and orders    |
| Node.js + Express REST API  | `server/src/app.js`                                              |
| Full CRUD                   | Admin product CRUD and customer cart CRUD                        |
| JWT authentication          | Signed HS256 JWT, expiry validation, HttpOnly cookie             |
| Protected middleware        | `protect` and `admin` API middleware                             |
| React functional components | All frontend pages and components                                |
| React Router                | Catalog, product, login, register, cart, checkout, orders, admin |
| Context API or Redux        | `AuthProvider` and `StoreProvider`                               |
| API consumption             | Shared `api()` fetch helper and Context actions                  |

## Useful commands

| Command           | Purpose                                       |
| ----------------- | --------------------------------------------- |
| `npm run setup`   | Create env, start MongoDB, seed               |
| `npm run dev`     | Run React and Express together                |
| `npm run db:up`   | Start the MongoDB container                   |
| `npm run db:down` | Stop MongoDB and retain its data              |
| `npm run seed`    | Add missing demo accounts and initial catalog |
| `npm run build`   | Type-check and compile frontend               |
| `npm start`       | Serve API and built React app                 |
| `npm test`        | Run API integration tests                     |
| `npm run format`  | Format source and documentation               |

If a port is occupied, stop the previous copy of the project. The defaults are 5173 (Vite), 5001 (API), and 27017 (MongoDB). When changing the API port, also update the proxy target in `client/vite.config.ts`. If Docker fails, start Docker Desktop or follow the manual MongoDB instructions above.

The React code uses no component framework. The only UI dependency is Lucide for icons. See `docs/ASSET_CREDITS.md` for image sources.
