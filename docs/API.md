# REST API reference

Base URL: `http://localhost:5001/api`. During development, Vite proxies `/api` requests to Express. All request bodies are JSON. Mutations require `Content-Type: application/json`. Cookies are sent automatically by the frontend.

Responses use `{ message: "..." }` for errors. Common codes: 400 invalid input, 401 sign-in required, 403 role denied, 404 missing resource, 409 conflict, 415 wrong content type, 429 too many sign-in attempts, 500 unexpected server failure.

## Authentication

| Method | Path             | Access    | Result                                                |
| ------ | ---------------- | --------- | ----------------------------------------------------- |
| POST   | `/auth/register` | Public    | Create customer; set JWT cookie; return `{ user }`    |
| POST   | `/auth/login`    | Public    | Verify credentials; set JWT cookie; return `{ user }` |
| GET    | `/auth/me`       | Signed in | Return public user fields                             |
| POST   | `/auth/logout`   | Public    | Clear authentication cookie                           |
| GET    | `/health`        | Public    | MongoDB health status                                 |

Registration body:

```json
{ "name": "Bibek", "email": "bibek@example.com", "password": "Example123!" }
```

Login body omits `name`. Public user fields are `_id`, `name`, `email`, and `role`; password hashes are never returned. Registration does not accept a `role` field. Password length is 8-72 characters. Authentication is rate-limited to 60 attempts per 15 minutes per IP. Sessions expire after seven days. Logout clears the browser cookie; this simple stateless design does not maintain a server-side token revocation list.

## Products - full CRUD

| Method | Path            | Access | Result                                           |
| ------ | --------------- | ------ | ------------------------------------------------ |
| GET    | `/products`     | Public | `{ products }`; optional `search` and `category` |
| GET    | `/products/:id` | Public | `{ product }`                                    |
| POST   | `/products`     | Admin  | Create; return 201 `{ product }`                 |
| PATCH  | `/products/:id` | Admin  | Update selected fields; return `{ product }`     |
| DELETE | `/products/:id` | Admin  | Delete and remove references from carts          |

Example creation body:

```json
{
  "title": "Wireless Headphones",
  "description": "Comfortable wireless headphones for daily use.",
  "price": 1999,
  "originalPrice": 3999,
  "category": "Electronics",
  "image": "/images/headphones.jpg",
  "inStock": true
}
```

Categories: `Electronics`, `Fashion`, `Home & Kitchen`. Images must be one of the eight bundled photo paths shown in the admin selector. Selling price must be positive, have at most two decimals, and not exceed original price. Unknown fields are rejected. Search values are escaped before use in a case-insensitive regular expression. Search query operators and unexpected query fields are rejected.

## Cart - full CRUD

| Method | Path               | Access    | Request                                 |
| ------ | ------------------ | --------- | --------------------------------------- |
| GET    | `/cart`            | Signed in | No body                                 |
| POST   | `/cart`            | Signed in | `{ "productId": "...", "quantity": 1 }` |
| PATCH  | `/cart/:productId` | Signed in | `{ "quantity": 2 }`                     |
| DELETE | `/cart/:productId` | Signed in | `{}`                                    |

All cart endpoints return `{ items: [{ product, quantity }], total }`. Quantities are integers between 1 and 10. Add increments an existing line. Prices are read from the current product documents, not trusted from the client. Each query uses the authenticated user's ID. Optimistic concurrency detects competing saves to an existing cart.

## Orders

| Method | Path      | Access    | Result                                 |
| ------ | --------- | --------- | -------------------------------------- |
| GET    | `/orders` | Signed in | Only the current user's orders         |
| POST   | `/orders` | Signed in | Save a demo order, then empty the cart |

```json
{
  "requestId": "62d4ed9a-5950-4f9e-9561-b5f9ba5f02f7",
  "address": {
    "fullName": "Bibek",
    "phone": "9876543210",
    "line": "123 Demo Street",
    "city": "Bengaluru",
    "postalCode": "560001"
  }
}
```

The client generates a UUID for each checkout attempt. A compound unique index on `(user, requestId)` prevents duplicate order documents when the same request is retried. The server validates the address, rechecks product availability, computes totals from MongoDB, snapshots purchased items, saves the order, and clears the cart. No payment service is called. Order creation and cart clearing are separate writes; this classroom version does not implement a transaction across those collections or multi-tab checkout locking.

Order records are historical and intentionally do not have update/delete endpoints. The required full CRUD demonstration is provided by products and carts. Later product changes do not alter historical order item titles or prices.
