"""Generate the submission report. Run: uv run --with reportlab python scripts/build_report.py"""
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, KeepTogether
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/Amazon_Clone_Assignment_Bibek_SCA24CA0016.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
NAVY = colors.HexColor('#172635')
GOLD = colors.HexColor('#e5a52b')
GREEN = colors.HexColor('#426c59')
GREY = colors.HexColor('#66756f')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom', fontName='Helvetica-Bold', fontSize=36, leading=42, textColor=NAVY, spaceAfter=16))
styles.add(ParagraphStyle(name='SectionCustom', fontName='Helvetica-Bold', fontSize=22, leading=28, textColor=NAVY, spaceAfter=16))
styles.add(ParagraphStyle(name='SubCustom', fontName='Helvetica-Bold', fontSize=12, leading=17, textColor=GREEN, spaceBefore=13, spaceAfter=7))
styles.add(ParagraphStyle(name='BodyCustom', fontName='Helvetica', fontSize=10, leading=16, textColor=colors.HexColor('#39473f'), spaceAfter=10))
styles.add(ParagraphStyle(name='SmallCustom', fontName='Helvetica', fontSize=8, leading=12, textColor=GREY, spaceAfter=7))
styles.add(ParagraphStyle(name='CellCustom', fontName='Helvetica', fontSize=8.4, leading=12, textColor=colors.HexColor('#39473f')))
styles.add(ParagraphStyle(name='CellHead', fontName='Helvetica-Bold', fontSize=8.4, leading=12, textColor=colors.white))
styles.add(ParagraphStyle(name='CaptionCustom', fontName='Helvetica', fontSize=8, leading=12, textColor=GREY, spaceAfter=13, alignment=TA_CENTER))
styles.add(ParagraphStyle(name='CodeCustom', fontName='Courier', fontSize=9, leading=15, textColor=NAVY, backColor=colors.HexColor('#f0f3ee'), borderPadding=10, spaceAfter=14))
story = []

def p(text, style='BodyCustom'):
    return Paragraph(text, styles[style])

def add(text, style='BodyCustom'):
    story.append(p(text, style))

def heading(number, title):
    if story:
        story.append(PageBreak())
    add(f'FULL STACK DEVELOPMENT  /  {number:02d}', 'SmallCustom')
    add(title, 'SectionCustom')

def table(rows, widths):
    data = [[p(escape(str(cell)).replace('\n', '<br/>'), 'CellHead' if row == 0 else 'CellCustom') for cell in line] for row, line in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f1f5ef'), colors.white]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBELOW', (0, 0), (-1, 0), 2, GOLD),
        ('LINEBELOW', (0, 1), (-1, -1), .4, colors.HexColor('#dfe7dc')),
    ]))
    story.extend([t, Spacer(1, 12)])

def shot(filename, max_width=490, max_height=600):
    image = Image(str(ROOT / 'output/playwright' / filename))
    scale = min(max_width / image.imageWidth, max_height / image.imageHeight)
    image.drawWidth = image.imageWidth * scale
    image.drawHeight = image.imageHeight * scale
    image.hAlign = 'CENTER'
    return image

def screenshot(filename, caption, max_height=600):
    story.append(shot(filename, max_height=max_height))
    story.append(Spacer(1, 8))
    add(caption, 'CaptionCustom')

# 1 - Cover
story.extend([Spacer(1, 20), p('DAYANANDA SAGAR UNIVERSITY', 'SubCustom'), p('SCHOOL OF COMPUTER APPLICATIONS', 'SmallCustom'), Spacer(1, 64)])
add('AMAZON<br/>CLONE', 'TitleCustom')
add('A simple e-commerce application using the MERN stack', 'SubCustom')
add('ASSIGNMENT II  |  ODD SEMESTER 2026-2027', 'SmallCustom')
story.append(Spacer(1, 35))
table([
    ['SUBMITTED BY', 'COURSE DETAILS'],
    ['Bibek\nRegister No. SCA24CA0016\nBCA Semester V - Section A', '24CA3511\nFull Stack Development\nBachelor of Computer Applications'],
    ['Submitted to', 'Ms. Priyanka D Rukesh'],
    ['Submission date', '18 November 2026'],
], [245, 245])
story.append(Spacer(1, 30))
add('MongoDB  +  Express  +  React  +  Node.js', 'SubCustom')
add('Product CRUD / JWT authentication / Protected routes / Context API', 'SmallCustom')
add('Includes source code, setup guide, API reference, tests, screenshots, and viva notes.', 'SmallCustom')

# 2 - Overview and requirements
heading(2, 'Project overview')
add('The Amazon Clone is a simple shopping application that demonstrates the complete MERN workflow. Customers browse products, sign in, maintain a persistent cart, submit a demo order, and view their order history. Administrators manage the product catalog through full CRUD operations.')
add('Problem and objective', 'SubCustom')
add('A static shopping page cannot demonstrate database persistence or access control. This project connects a familiar storefront to a real Express API and MongoDB database, while keeping the implementation small enough to demonstrate and explain.')
add('Assignment requirement mapping', 'SubCustom')
table([
    ['REQUIREMENT', 'IMPLEMENTED IN THIS PROJECT'],
    ['MongoDB persistence', 'User, Product, Cart, and Order collections with Mongoose'],
    ['Node.js / Express REST API', 'JSON endpoints under /api'],
    ['Full CRUD operations', 'Admin product CRUD and customer cart-item CRUD'],
    ['JWT authentication', 'Signed HS256 token, expiry checks, HttpOnly cookie'],
    ['Protected middleware', 'Authentication checks and database-backed admin role checks'],
    ['React functional components', 'Catalog, details, auth, cart, checkout, orders, admin'],
    ['React Router', 'Public routes and protected customer/admin routes'],
    ['Context API', 'AuthProvider and StoreProvider share state and actions'],
    ['Frontend API consumption', 'Shared fetch helper, JSON requests, response-driven UI'],
], [164, 326])
add('Scope', 'SubCustom')
add('The project is a local classroom demo. Products, ratings, prices, and checkout are sample data. No real payment is collected and no goods are shipped. Product photo uploads, customer reviews, returns, and stock-count reservations are outside this version.')

# 3 - Architecture
heading(3, 'Architecture & technology')
add('The application has a browser frontend, a REST backend, and a MongoDB database. Vite proxies API calls during development. Express serves the compiled frontend and API together for the local build.')
d = Drawing(490, 172)
for x, title, sub in [(0, 'React frontend', 'Router + Context'), (171, 'Express API', 'JWT + validation'), (342, 'MongoDB', 'Mongoose models')]:
    d.add(Rect(x, 65, 148, 75, rx=8, ry=8, fillColor=colors.HexColor('#edf3e9'), strokeColor=colors.HexColor('#b8c9b1')))
    d.add(String(x + 74, 109, title, textAnchor='middle', fontName='Helvetica-Bold', fontSize=11, fillColor=NAVY))
    d.add(String(x + 74, 88, sub, textAnchor='middle', fontName='Helvetica', fontSize=9, fillColor=GREY))
for x in [148, 319]:
    d.add(Line(x + 3, 102, x + 19, 102, strokeColor=GOLD, strokeWidth=2))
    d.add(Polygon([x + 19, 102, x + 13, 106, x + 13, 98], fillColor=GOLD, strokeColor=GOLD))
d.add(String(245, 33, 'User action > API request > database operation > JSON response > UI update', textAnchor='middle', fontSize=8, fillColor=GREY))
story.append(d)
table([
    ['LAYER', 'TECHNOLOGIES'],
    ['Frontend', 'React 19, TypeScript, React Router, Vite, CSS, Lucide icons'],
    ['Backend', 'Node.js, Express 5, Mongoose 8'],
    ['Authentication', 'bcryptjs, jsonwebtoken, cookie-parser'],
    ['Validation / security', 'Zod, Helmet, express-rate-limit'],
    ['Database', 'MongoDB 7 in Docker with a persistent data volume'],
    ['Verification', 'Node test runner, Supertest, real MongoDB, browser checks'],
], [132, 358])
add('Code organization', 'SubCustom')
add('<b>client/src/App.tsx</b> contains routes and pages; <b>components.tsx</b> contains reusable UI; <b>context.tsx</b> holds account and store state; <b>api.ts</b> centralizes fetch requests. The server separates the Express app, Mongoose models, database startup, seed script, and integration tests.')
add('Exact dependency versions are recorded in package-lock.json. Product images are bundled locally and the interface uses system fonts.', 'SmallCustom')

# 4 - Data
heading(4, 'Database design')
table([
    ['COLLECTION', 'KEY FIELDS AND RESPONSIBILITY'],
    ['User', 'name, unique email, password hash, role, timestamps. New registrations are customers.'],
    ['Product', 'title, description, price, originalPrice, category, image, rating, reviewCount, inStock, timestamps.'],
    ['Cart', 'unique user reference, items [{ product reference, quantity }], timestamps. One cart per account.'],
    ['Order', 'user, requestId, purchased item snapshots, address, total, status, paymentMethod, timestamps.'],
], [105, 385])
add('Relationships', 'SubCustom')
add('One user owns one cart and can place many orders. Cart items reference product documents. Order items snapshot the title, image, unit price, and quantity at checkout so later catalog edits do not rewrite purchase history.')
add('Constraints and indexes', 'SubCustom')
add('User email and cart user are unique. Orders have a compound unique index on (user, requestId). Product prices must be positive; the original price must not be below the selling price. Cart quantities are integers from 1 to 10. Categories and image paths are allowlisted.')
add('Data integrity', 'SubCustom')
add('Cart totals use prices read from MongoDB. Checkout rejects client-supplied totals, rechecks availability, and calculates the order total on the server. Removing a product removes it from carts, while previous orders retain their snapshots.')
add('Checkout sequence', 'SubCustom')
table([
    ['STEP', 'OPERATION'],
    ['1', 'Authenticate the user and validate the address and request UUID.'],
    ['2', 'Return the earlier order if the same checkout request already completed.'],
    ['3', 'Read the cart, populate products, reject empty/unavailable items.'],
    ['4', 'Compute the total and create an order with item snapshots.'],
    ['5', 'Clear the cart and display saved order history.'],
], [55, 435])
add('The order and cart writes are separate in this simple project. Production checkout would add database transactions, stock reservation, and coordination of simultaneous checkout sessions.', 'SmallCustom')

# 5 - API and security
heading(5, 'REST API & authentication')
table([
    ['METHOD', 'ENDPOINT', 'ACCESS / PURPOSE'],
    ['POST', '/api/auth/register', 'Public - create customer and session'],
    ['POST', '/api/auth/login', 'Public - verify credentials and sign in'],
    ['GET / POST', '/api/auth/me / logout', 'Get current user / clear session'],
    ['GET', '/api/products', 'Public - list, search, category filter'],
    ['GET', '/api/products/:id', 'Public - read one product'],
    ['POST', '/api/products', 'Admin - create product'],
    ['PATCH', '/api/products/:id', 'Admin - update product'],
    ['DELETE', '/api/products/:id', 'Admin - delete product'],
    ['GET / POST', '/api/cart', 'Signed in - read cart / add item'],
    ['PATCH / DELETE', '/api/cart/:productId', 'Signed in - update quantity / remove item'],
    ['GET / POST', '/api/orders', 'Signed in - own history / demo checkout'],
], [82, 177, 231])
add('JWT and authorization', 'SubCustom')
add('Passwords are hashed with bcrypt at cost 12. The server signs an HS256 JWT with the user ID as its subject and a seven-day expiry. It stores the token in an HttpOnly, SameSite Strict cookie. Secure cookies are enabled for production HTTPS.')
add('Protected middleware verifies the signature and expiry and loads the account from MongoDB. Admin middleware checks its current role. Cart and order queries use the authenticated user ID. Public registration rejects a role field.')
add('Validation and errors', 'SubCustom')
add('Zod checks request shape, quantities, prices, addresses, categories, and image paths. Catalog search escapes regular-expression characters. JSON-only mutations, cross-site request rejection, request body limits, Helmet headers, and sign-in rate limits provide additional safeguards.')
add('The API returns descriptive JSON errors. Full request examples and status codes are documented in docs/API.md. Logout clears the cookie; this stateless demo does not implement server-side JWT revocation.', 'SmallCustom')

# 6 - Screenshot home
heading(6, 'Storefront')
add('The home page presents a product catalog, category filters, sorting, search, INR pricing, and add-to-cart actions. Images are served locally.', 'BodyCustom')
screenshot('01-home-desktop.png', 'Figure 1. Actual desktop storefront with eight seeded products.', max_height=525)

# 7 - Cart and checkout
heading(7, 'Shopping cart & checkout')
add('The cart saves quantity changes to MongoDB. Checkout collects a sample address and clearly labels its demo payment method.', 'BodyCustom')
screenshot('02-cart-desktop.png', 'Figure 2. Saved cart with quantity controls and server-derived subtotal.', max_height=265)
screenshot('03-checkout-desktop.png', 'Figure 3. Address validation and cash-on-delivery demo checkout.', max_height=265)

# 8 - Orders and admin
heading(8, 'Orders & product management')
add('Customers can see only their own order history. Administrators can create, read, edit, and delete products.', 'BodyCustom')
screenshot('04-orders-desktop.png', 'Figure 4. A completed demo order remains available after reload.', max_height=265)
screenshot('05-admin-desktop.png', 'Figure 5. Administrator catalog management with edit and delete actions.', max_height=265)

# 9 - Responsive
heading(9, 'Details & responsive layout')
add('Product details show the sample description, availability, pricing, and a shopping action. On smaller screens, navigation, cards, and forms reflow to fit the viewport.', 'BodyCustom')
left = [shot('07-home-mobile.png', max_width=166, max_height=440), Spacer(1, 8), p('Figure 6. Mobile storefront at 390 px.', 'CaptionCustom')]
right = [shot('06-product-desktop.png', max_width=300, max_height=440), Spacer(1, 8), p('Figure 7. Product details with availability and purchase controls.', 'CaptionCustom')]
t = Table([[left, right]], colWidths=[178, 312])
t.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0)]))
story.append(t)
add('Usability', 'SubCustom')
add('Forms have labels, buttons expose descriptive names, keyboard focus is visible, and dialogs support Escape and focus trapping. Layouts respect reduced-motion preferences. A mobile check confirmed a page width of 390 px inside a 390 px viewport with no broken images.')

# 10 - Tests
heading(10, 'Testing & verification')
add('Sixteen API integration tests passed against a real MongoDB server. Each run creates a uniquely named disposable test database and deletes it after completion.')
table([
    ['AREA', 'VERIFIED BEHAVIOR'],
    ['Catalog / health', 'Connected MongoDB and public product reads'],
    ['Authentication', 'Registration validation, hashing, login, cookie flags, logout'],
    ['JWT protection', 'Anonymous, tampered, and expired tokens rejected'],
    ['Authorization', 'Customer role enforced; admin-only catalog writes'],
    ['Product CRUD', 'Create, read, update, delete; validated prices and fields'],
    ['Search', 'Search/filter results and safe handling of query metacharacters'],
    ['Cart CRUD', 'Add, read, change quantities, remove; MongoDB persistence'],
    ['Availability', 'Unavailable products and quantity overflow rejected'],
    ['Checkout', 'Address validation, server totals, item snapshots, cart clearing'],
    ['Order integrity', 'Retry deduplication, own-account history, preserved snapshots'],
    ['Request controls', 'Cross-site changes and non-JSON mutations rejected'],
], [118, 372])
add('Browser verification', 'SubCustom')
add('The customer flow was exercised through the interface: sign in, add an item, change quantity, reload, open checkout, place a demo order, and reload order history. The administrator flow verified create, edit, reload persistence, and delete. Search and product navigation were checked. A customer was blocked from the admin page.')
add('Build and formatting', 'SubCustom')
add('TypeScript and Vite validate the frontend build. Source and documentation are formatted with Prettier. Screenshots in this report were captured from the working local application.')

# 11 - Setup
heading(11, 'Setup & demonstration')
add('Prerequisites', 'SubCustom')
add('Node.js 22.12 or later, npm, and Docker Desktop running. A local MongoDB installation or an Atlas connection may be used instead of Docker. No paid API or payment key is required.')
add('npm ci<br/>npm run setup<br/>npm run dev', 'CodeCustom')
add('Open http://localhost:5173. The setup script creates .env with a random JWT secret, starts MongoDB, waits for readiness, and seeds products and accounts. Existing seed data is preserved.')
table([
    ['ROLE', 'EMAIL', 'PASSWORD'],
    ['Customer', 'demo@example.com', 'Demo12345!'],
    ['Administrator', 'admin@example.com', 'Admin12345!'],
], [110, 230, 150])
add('Compiled local build', 'SubCustom')
add('npm run build<br/>npm start', 'CodeCustom')
add('Open http://localhost:5001. For local HTTP use the supplied development environment. For a real HTTPS deployment enable the production environment and adjust the loopback binding to suit the hosting platform.')
add('Demonstration sequence', 'SubCustom')
add('1. Browse, search, filter, and open a product.<br/>2. Sign in as customer, add to cart, update quantity, and reload.<br/>3. Remove/re-add an item, enter sample address details, and place a demo order.<br/>4. Show order history and the empty cart.<br/>5. Sign in as admin; create, edit, and delete a test product.<br/>6. Show the database models, JWT middleware, Context providers, and passing tests.')
add('npm test<br/>npm run build<br/>npm run format:check', 'CodeCustom')

# 12 - Conclusion and viva
heading(12, 'Conclusion & viva notes')
add('The project demonstrates a complete MERN shopping workflow with product/cart CRUD, JWT authentication, protected routes, React Router, Context state, and MongoDB persistence. It meets the full-stack assignment requirements while keeping the screens and code understandable.')
add('Key viva points', 'SubCustom')
table([
    ['QUESTION', 'SHORT ANSWER'],
    ['Where is full CRUD?', 'Products for admins and cart items for customers.'],
    ['Why Context API?', 'Share account, catalog, cart state, and actions across pages.'],
    ['What does JWT protect?', 'Signed-in identity for private endpoints; admin role is checked separately.'],
    ['Why hash passwords?', 'Store salted one-way hashes instead of plaintext passwords.'],
    ['Can the client set the total?', 'No. The API derives it from stored prices and quantities.'],
    ['Why snapshot order items?', 'Preserve historical purchases after catalog edits/deletion.'],
    ['What is not implemented?', 'Real payments/delivery, uploads, user reviews, stock reservation.'],
], [158, 332])
add('Future enhancements', 'SubCustom')
add('Payment integration, uploads, real reviews, pagination, password recovery, order cancellation, session revocation, stock reservations, and transactional checkout would extend the project beyond its classroom scope.')
add('References', 'SubCustom')
for text, url in [
    ('React and Context API', 'https://react.dev/reference/react/createContext'),
    ('React Router', 'https://reactrouter.com/start/declarative/routing'),
    ('Express routing', 'https://expressjs.com/en/guide/routing/'),
    ('Mongoose validation', 'https://mongoosejs.com/docs/validation.html'),
    ('MongoDB manual', 'https://www.mongodb.com/docs/manual/'),
    ('jsonwebtoken', 'https://github.com/auth0/node-jsonwebtoken'),
    ('Zod', 'https://zod.dev/'),
]:
    add(f'<link href="{url}" color="#007185">{text}</link> - {url}', 'SmallCustom')
add('Product photography: Unsplash CDN; exact source URLs are listed in docs/ASSET_CREDITS.md. The application uses local copies. Full editable report: docs/PROJECT_REPORT.md. Detailed viva guide: docs/VIVA_AND_DEMO.md.', 'SmallCustom')

def decorate(canvas, doc):
    width, height = A4
    canvas.saveState()
    canvas.setFillColor(GOLD)
    canvas.rect(45, height - 36, 30, 3, fill=1, stroke=0)
    canvas.setStrokeColor(colors.HexColor('#dee5dc'))
    canvas.line(45, 43, width - 45, 43)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GREY)
    canvas.drawString(45, 29, 'BIBEK  /  SCA24CA0016  /  AMAZON CLONE')
    canvas.drawRightString(width - 45, 29, f'{doc.page:02d}')
    canvas.restoreState()

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=52.5, leftMargin=52.5, topMargin=57, bottomMargin=58,
    title='Amazon Clone - MERN Assignment II - Bibek SCA24CA0016', author='Bibek', subject='24CA3511 Full Stack Development, BCA V, Section A')
doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
print(OUT)
