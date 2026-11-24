# Viva and demonstration guide

## One-minute introduction

My project is a simple Amazon-inspired e-commerce application built using MongoDB, Express, React, and Node.js. Customers browse products, register and sign in, manage a persistent cart, place a demo order, and view their orders. Administrators perform full product CRUD. React Router handles navigation and React Context manages account and cart state. JWT authentication and server-side role checks protect private operations.

## Five-minute demo

1. Open the home page and show the product grid, categories, search, and sorting.
2. Sign in with the customer demo, open a product, and add it to the cart.
3. Change the quantity, refresh the page, and show that MongoDB preserved the cart. Delete and re-add an item to demonstrate cart CRUD.
4. Open checkout. Use a sample address, a 10-digit mobile number such as `9876543210`, and PIN `560001`. Explain that this is a demo with no real payment or delivery.
5. Place the demo order. Show order history and the empty cart.
6. Sign out and enter the administrator demo. Open Manage products. Create a test product, change its price/title, and delete it.
7. Show `server/src/models.js`, authentication middleware in `server/src/app.js`, and the Context providers in `client/src/context.tsx`.
8. Run `npm test` and explain the disposable test database.

## Likely questions

**What is MERN?** MongoDB is the database, Express provides the API, React renders the browser interface, and Node.js runs the server JavaScript.

**Where is full CRUD?** Products use POST, GET, PATCH, and DELETE endpoints. Cart items also support create, read, update, and delete. Orders are historical, so they intentionally do not have delete/edit operations.

**What is a JWT?** A signed token containing a subject (the user ID) and expiry. The server validates its signature and then loads the current account.

**Why is the token in a cookie?** An HttpOnly cookie is unavailable to browser JavaScript. SameSite Strict reduces cross-site cookie use; Secure is enabled when using the production HTTPS configuration.

**What protects admin actions?** Server middleware verifies the current user and checks the role stored in MongoDB. Frontend route protection is a convenience, while the API enforces the permission.

**Can customers register as administrators?** No. The registration schema rejects unknown fields such as role. The admin account is provisioned by the seed script.

**Why hash passwords?** bcrypt stores a one-way salted hash rather than the original password. Login compares a candidate password with the stored hash.

**What does React Context do?** AuthProvider shares identity, and StoreProvider shares catalog/cart data and actions without passing them through every level of the component tree.

**What does React Router do?** It maps URLs to pages and supports protected navigation, product IDs, and search query parameters without full-page navigation.

**What does Mongoose do?** It provides schemas, validation, models, references, timestamps, and queries on top of MongoDB.

**Can the browser change an order total?** The server calculates the total from stored product prices and cart quantities. The order request accepts an address and request ID, and rejects an extra total field.

**Why snapshot order items?** A historical order should show what was purchased even if an administrator later changes or deletes a product.

**How are duplicate checkout retries handled?** A request UUID and unique `(user, requestId)` index prevent duplicate order documents for a repeated checkout request. Multi-tab checkout with different request IDs is outside the current concurrency guarantees.

**Is checkout a database transaction?** No. Order creation and cart clearing are separate writes in this classroom version. A production system should coordinate these steps transactionally and reserve stock.

**How is one user's data separated from another's?** Cart and order queries always use the user ID obtained from authentication, rather than trusting a user ID sent by the client.

**What are the limitations?** No real payments, delivery, uploads, customer reviews, stock-count reservations, password reset, or token revocation list. Demo accounts and sample ratings are for classroom use.

**How was it tested?** Sixteen API integration tests exercise a real MongoDB server. Browser checks cover shopping, checkout persistence, access control, admin CRUD, and mobile layouts. TypeScript and Vite validate the build.
