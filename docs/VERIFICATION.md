# Verification record

Verified locally on 17 November 2026 with Node.js 22.23.0, the installed npm lockfile, and a real MongoDB 7 Docker container.

## API integration tests

`npm test`: **16 passed, 0 failed, 0 skipped**. Tests create a unique disposable `amazon_test_*` database and drop it after the run. They do not modify the demo database.

| Area             | Evidence                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| Database         | Health endpoint reports `{"status":"ok","database":"MongoDB"}`          |
| Catalog          | Public reads, item reads, search, filters, escaped query input          |
| Auth             | Validated registration, bcrypt hash storage, cookie flags, login/logout |
| JWT              | Missing, invalid, and expired tokens rejected                           |
| Roles            | Customer cannot write products or register an admin account             |
| Product CRUD     | Admin create/read/update/delete persisted in MongoDB                    |
| Cart CRUD        | Add/read/update/remove, quantity limits, unavailable item rejection     |
| Checkout         | Address validation, server pricing, rejection of a supplied total       |
| Orders           | Saved item snapshots, empty cart after checkout, retry deduplication    |
| Isolation        | Another account sees an empty cart and its own empty order history      |
| Deletion         | Product references removed from carts; order snapshots preserved        |
| Request controls | Cross-site JSON changes and form-encoded mutations rejected             |

## Browser checks

The working React interface was driven in a Chromium browser against the local Express API and MongoDB database.

| Story                                         | Result                                              |
| --------------------------------------------- | --------------------------------------------------- |
| Customer sign-in using demo account           | Passed                                              |
| New account registration and page reload      | Account created; session restored                   |
| Sign-out and direct checkout navigation       | Redirected to sign-in                               |
| Add headphones to cart                        | Passed                                              |
| Change quantity from 1 to 2 and reload        | Quantity 2 persisted; subtotal INR 3,998            |
| Reload checkout directly                      | Signed-in cart restored before rendering the form   |
| Enter sample address and place demo order     | Order saved and cart cleared                        |
| Reload order history                          | Purchased headphones, quantity, and total persisted |
| Customer visits `/admin`                      | Administrator access denied                         |
| Administrator sign-in and management page     | Passed                                              |
| Admin creates a temporary product             | Visible in catalog management                       |
| Admin edits the temporary product and reloads | Updated title persisted                             |
| Admin deletes temporary product               | Removed from catalog                                |
| Header search for headphones                  | One matching product                                |
| Product details navigation                    | Correct product detail page                         |
| Mobile home at 390 px                         | Document width 390 px, no horizontal page overflow  |
| Product photography                           | No broken product images                            |

An initial browser search assertion ran before React finished navigation. It passed after waiting for the matching product to appear. A checkout restoration issue found during implementation was fixed by tracking which user's cart has finished loading.

The expected unauthenticated `/auth/me` check returns 401 on the sign-in/home page. No application exception was found during the completed shopping or admin flows. React development mode may repeat initial reads.

## Build and source checks

- `npm run build`: TypeScript and Vite compilation passed.
- Compiled frontend served by Express at port 5001: all eight MongoDB products rendered.
- `npm run setup`: fresh database setup succeeded; repeating setup preserved seeded data.
- Dependency installation audit: no known vulnerabilities reported at installation time.
- `npm run format:check`: source and documentation formatting checked before packaging.
- PDF report rendered to images and visually reviewed before delivery.

## Screenshots

Actual captures are in `output/playwright/`:

1. `01-home-desktop.png` - storefront and eight products.
2. `02-cart-desktop.png` - saved customer cart and quantity controls.
3. `03-checkout-desktop.png` - sample delivery address and order summary.
4. `04-orders-desktop.png` - saved order history.
5. `05-admin-desktop.png` - admin product management.
6. `06-product-desktop.png` - product details.
7. `07-home-mobile.png` - responsive 390 px storefront.

## Practical limits

This verification covers the local classroom workflow. It does not establish payment, delivery, concurrent multi-tab checkout, or large-scale production behavior. Orders and cart clearing use separate writes. JWT logout clears the cookie without server-side revocation. A real deployment needs HTTPS and production configuration.
