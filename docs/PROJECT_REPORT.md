# Amazon Clone - Assignment II

**Dayananda Sagar University - School of Computer Applications**

| Detail             | Value                                    |
| ------------------ | ---------------------------------------- |
| Student            | Bibek                                    |
| Register number    | SCA24CA0016                              |
| Programme          | Bachelor of Computer Applications        |
| Semester / section | V / A                                    |
| Course             | 24CA3511 - Full Stack Development        |
| Faculty            | Ms. Priyanka D Rukesh                    |
| Academic period    | Odd Semester 2026-2027                   |
| Submission date    | 18 November 2026                         |
| Project            | Simple Amazon Clone using the MERN stack |

## 1. Abstract

The Amazon Clone is a small e-commerce application that demonstrates the complete MERN development workflow. Customers browse a product catalog, search and filter products, open details, create accounts, manage a persistent shopping cart, submit a demo order, and view their own order history. Administrators manage the catalog through create, read, update, and delete operations.

MongoDB stores the application data. Express and Node.js expose REST endpoints. React functional components render the interface, React Router handles navigation, and React Context holds authentication and shopping state. Authentication uses signed JSON Web Tokens in HttpOnly cookies. The project is intentionally limited to a local college demonstration with sample products and cash-on-delivery demo checkout.

## 2. Problem statement and objectives

An online shopping interface must coordinate product information, account identity, cart changes, and order storage. A static clone can display products but cannot demonstrate reliable persistence, access control, or communication between frontend and backend.

The objective is to build a simple working Amazon-inspired application that connects every screen to a real REST API and MongoDB database. Specific objectives are to implement product and cart CRUD, authenticate users with JWT, enforce customer/admin permissions, preserve cart and order data across page reloads, and provide an understandable project suitable for demonstration and viva.

## 3. Scope and requirements

Functional requirements include registration, sign-in/sign-out, public catalog browsing, case-insensitive search, category filters, sorting, product details, cart quantity changes, item removal, address validation, demo checkout, account-specific order history, and administrator product management.

Nonfunctional requirements include responsive layouts, input validation, hidden password hashes, protected endpoints, descriptive errors, persistent storage, and repeatable setup. The application uses local product images and system fonts, so normal use does not depend on external font or image hosts.

The project does not include real payments, shipping, returns, email notifications, product uploads, customer-written reviews, or stock-count reservation. Ratings and product claims are seeded sample content. Inventory availability is represented by a Boolean flag. The familiar visual style is educational and does not connect to Amazon services.

## 4. Requirement mapping

| Assignment requirement      | Project implementation                                |
| --------------------------- | ----------------------------------------------------- |
| MongoDB database            | Four Mongoose models: User, Product, Cart, Order      |
| Node.js / Express REST API  | JSON endpoints under `/api`                           |
| Full CRUD operations        | Product CRUD for admins; cart-item CRUD for customers |
| JWT authentication          | HS256 signature validation with seven-day expiry      |
| Protected middleware        | Authentication and administrator role checks          |
| React functional components | Catalog, auth, detail, cart, checkout, orders, admin  |
| React Router navigation     | Public and protected routes                           |
| Context API or Redux        | AuthProvider and StoreProvider                        |
| Frontend API consumption    | Fetch helper and Context actions                      |

## 5. Technology and architecture

The frontend uses React 19, TypeScript, React Router, Vite, plain CSS, and Lucide icons. The backend uses Node.js, Express 5, Mongoose 8, bcryptjs, jsonwebtoken, Zod, Helmet, cookie-parser, and express-rate-limit. MongoDB 7 runs locally in Docker with a persistent volume. Exact dependency versions are recorded in `package-lock.json`.

The request flow is: browser action -> React page -> shared API helper -> Express route -> validation/authentication middleware -> Mongoose model -> MongoDB -> JSON response -> Context state update -> rendered page. In development, Vite proxies `/api` requests to port 5001; in the compiled local build, Express serves both the React application and the API from port 5001.

The code separates reusable UI components, shared state, API transport, database schemas, seed data, server startup, and API handlers. This keeps the project small enough to explain while preserving clear responsibilities.

## 6. Database design

### User

Fields: name, unique normalized email, password hash, role, createdAt, updatedAt. New accounts default to `customer`. Administrator accounts are provisioned by the trusted seed script, not by a public role-update endpoint.

### Product

Fields: title, description, price, originalPrice, category, image, rating, reviewCount, inStock, timestamps. Public reads are allowed. Administrator authentication is required for create, update, and delete. Original price must not be below selling price.

### Cart

Fields: unique user reference, items containing product reference and quantity, timestamps. One cart belongs to one user. Product references are populated to calculate current prices. Quantities range from 1 to 10. Optimistic concurrency detects conflicting saves to an existing cart.

### Order

Fields: user reference, requestId, purchased item snapshots, delivery address, total, status, payment method, timestamps. The `(user, requestId)` unique index prevents duplicate order documents for the same checkout request. Snapshots preserve product name, image, unit price, and quantity even when the live catalog changes.

Relationships: one User has one Cart and many Orders; one Cart references many Products; one Order contains many purchased item snapshots. Product deletion removes cart references but retains historical order snapshots.

## 7. Authentication and access control

Registration validates input, checks unique email, hashes the password using bcrypt with cost factor 12, saves a customer account, signs an HS256 JWT, and returns only public user fields. Login verifies the stored password hash before issuing the session cookie.

The authentication middleware verifies the JWT signature and expiry and loads the current user from MongoDB. Administrator middleware then checks the current database role before allowing catalog writes. Cart and order queries always include the authenticated user's ID, preventing access to another account's private data.

The session cookie is HttpOnly and SameSite Strict. Secure cookies are enabled in production. Mutating endpoints accept JSON only, cross-site Fetch Metadata requests are denied, request bodies are limited, and authentication attempts are rate-limited. Zod rejects unexpected fields, invalid quantities, invalid prices, and malformed addresses. The design is stateless: logout clears the browser cookie but does not maintain a token revocation list.

## 8. Main algorithms and modules

**Catalog:** Fetch products from Express, derive visible results from search/category query parameters, apply the selected sort, and render reusable product cards. The API also supports validated search and category queries.

**Cart:** After authentication, fetch the user's cart. Add either creates a cart line or increments an existing quantity. Update validates a quantity between 1 and 10. Delete removes a product line. Returned totals use current MongoDB product prices.

**Checkout:** Validate the address and request UUID, return an existing order when that request has already completed, reject empty carts or unavailable products, calculate total from the current catalog, create item snapshots, store the demo order, clear the cart, and navigate to order history. Saving the order and clearing the cart are separate writes in this simple local version; a production extension would add transactional handling and concurrent-checkout coordination.

**Admin CRUD:** A protected React route displays catalog rows. A form creates or updates validated product fields. Deletion requires a confirmation dialog. After each mutation, the product list refreshes from the API. Hiding the page is supplemented by server-side role checks.

**State management:** AuthProvider restores account identity through `/auth/me`. StoreProvider holds products, cart data, loading states, errors, and toast messages. A cart-loading identity marker prevents checkout from treating an as-yet-unloaded cart as empty during a page reload.

## 9. User interface

The interface contains an Amazon-inspired dark header, search bar, category navigation, promotional area, product cards, ratings, INR prices, and yellow shopping actions. Product details explain the sample item and provide an add-to-cart action. The cart displays quantities and server-derived subtotals. Checkout collects a demo delivery address. Orders show saved item snapshots and totals. Admin management provides a compact CRUD table and forms.

The layout adapts to desktop and mobile. Form controls have labels, keyboard focus is visible, dialogs support Escape and focus trapping, and reduced-motion preferences are respected. Actual application screenshots are in `output/playwright/` and included in the PDF report.

## 10. Testing

Sixteen automated API integration tests run against a real MongoDB server using a unique disposable database. They cover health/catalog reads, protected routes, registration validation, role escalation rejection, password hashing, JWT cookie flags, duplicate accounts, invalid credentials/tokens, admin product CRUD, safe search, price validation, cart CRUD, availability and quantity limits, checkout validation, correct totals, checkout retry deduplication, account isolation, catalog deletion cleanup, historical snapshots, cross-site rejection, and logout/login.

Browser checks cover customer sign-in, adding an item, changing quantity, persistence after reload, checkout reload, submitting a demo order, persisted order history, customer denial from admin pages, admin sign-in, product creation/editing/deletion, search, details navigation, and responsive layouts. Build validation uses TypeScript and Vite. See `docs/VERIFICATION.md` for results and evidence.

## 11. Installation and demonstration

Install Node.js 22.12 or later and start Docker Desktop. From the source folder run `npm ci`, `npm run setup`, and `npm run dev`. Visit `http://localhost:5173`. For a compiled local demonstration run `npm run build`, `npm start`, and open `http://localhost:5001`.

Customer account: `demo@example.com` / `Demo12345!`. Admin account: `admin@example.com` / `Admin12345!`.

Demonstration sequence: browse products; search; sign in as customer; add to cart; update quantity; reload to show persistence; remove/re-add an item; checkout using sample address details; show order history; sign out; sign in as admin; create, edit, and delete a test product. Finish by showing the MongoDB models, JWT middleware, Context providers, and passing tests.

## 12. Limitations and future enhancements

This version is a local educational shopping demo. Future work could introduce payment-provider integration, uploaded product images, real customer reviews, stock counts and reservation, order cancellation, email receipts, pagination, password recovery, session revocation, and transactions for checkout. Public deployment would also require HTTPS, appropriate hosting network configuration, private production credentials, and removal of demo account shortcuts.

## 13. Conclusion

The Amazon Clone demonstrates a complete MERN application with a practical shopping workflow. Product and cart CRUD, signed JWT authentication, server-side access control, React navigation, Context-based state, MongoDB persistence, and tested checkout logic satisfy the required full-stack learning outcomes while keeping the project straightforward to run and explain.

## References

- React documentation: https://react.dev/learn
- React Context: https://react.dev/reference/react/createContext
- React Router routing: https://reactrouter.com/start/declarative/routing
- Express routing: https://expressjs.com/en/guide/routing/
- Mongoose validation: https://mongoosejs.com/docs/validation.html
- MongoDB documentation: https://www.mongodb.com/docs/manual/
- jsonwebtoken source and API: https://github.com/auth0/node-jsonwebtoken
- Zod documentation: https://zod.dev/
- Product image URLs: `docs/ASSET_CREDITS.md`
