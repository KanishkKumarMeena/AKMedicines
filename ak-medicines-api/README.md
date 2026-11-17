# AK Medicines API

`api/` contains the routes and request schemas. `background/` contains email alerts, scheduler setup, and the alert CLI commands. Shared database models, inventory logic, and configuration stay at the project root.

Run commands from this folder. The database connection still comes from `DATABASE_URL` in `.env`.

```sh
uv sync
uv run flask --app app init-db
uv run flask --app app dummy-db
uv run python app.py
```

`init-db` creates missing tables. It does not migrate existing tables. `dummy-db` adds demo medicines, a vendor, and receive transactions only when there are no medicines or vendors. The API runs at `http://127.0.0.1:5000`. Running `python app.py` also starts the six-hour background alert schedule.

| Endpoint | Purpose |
| --- | --- |
| GET /api/medicines | Medicine catalog with calculated stock and status |
| POST /api/medicines | Register a medicine and optional initial stock |
| GET /api/transactions | Ledger; optionally filter with `?medicine_id=1` |
| POST /api/transactions | Record RECEIVE or DISPENSE |
| GET /api/vendors | Registered vendors and their formulations |
| POST /api/vendors | Register a vendor and supplied formulations |
| POST /api/users | Admin-only: register a user for a vendor |
| GET /api/alerts | Low/depleted medicines with matching vendors |

Create a medicine:

```json
{
  "name": "Paracetamol 500 mg",
  "category": "Analgesic",
  "salt_ingredients": "Paracetamol",
  "min_threshold": 25,
  "initial_stock": 100,
  "party": "Local donor"
}
```

`min_threshold` defaults to 25 and `initial_stock` defaults to zero. Initial stock creates a RECEIVE ledger entry. There are no ledger edit or delete endpoints.

Record a transaction:

```json
{
  "medicine_id": 1,
  "transaction_type": "DISPENSE",
  "quantity": 10,
  "party": "Field clinic"
}
```

Quantities must be positive integers. Dispensing more than available returns HTTP 409. PostgreSQL locks the medicine row during transactions so simultaneous dispenses cannot spend the same stock. Stock is always calculated from the ledger.

Register a vendor:

```json
{
  "name": "Generic Supplier",
  "email": "supplier@example.com",
  "phone": "1234567890",
  "salt_ingredients": ["Paracetamol", "Amoxicillin + Clavulanic Acid"]
}
```

Vendor creation returns a generated vendor ID such as `GENE7890-7Q4M`. It uses
the first four organization-name letters, the last four phone digits, and a
random four-character suffix. Phone is required for vendor registration.

Only JWTs with a `role` claim of `admin` can create users:

```json
{
  "name": "Asha Patel",
  "username": "asha.patel",
  "email": "asha@example.com",
  "password": "a-long-password",
  "vendor_id": "GENE7890-7Q4M"
}
```

Each vendor list entry is a complete formulation. Matching ignores capitalization, spacing and ingredient order, but requires the same ingredients. Stock below the threshold is low; zero is depleted; stock at or above the threshold is ample.

Add email settings to your existing `.env`:

```dotenv
MAIL_SERVER=smtp.example.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=your-smtp-username
MAIL_PASSWORD=your-smtp-password
MAIL_DEFAULT_SENDER=inventory@example.com
ADMIN_EMAIL=admin@example.com
ALERT_INTERVAL_HOURS=6
JWT_SECRET=replace-with-a-long-random-secret
JWT_ISSUER=ak-medicines-node
JWT_AUDIENCE=ak-medicines-api
```

All `/api` routes require a JWT issued by the Node proxy. The proxy must send
it as `Authorization: Bearer <token>`. Tokens use HS256 and must contain `sub`
and `exp` claims, with the configured issuer and audience.

Emails include stock, thresholds, formulations and matching vendor contacts. No email is sent when stock is healthy. Missing email configuration or delivery failures are logged, and the next scheduled run still happens. Persistent shortages appear in each six-hour email. The first scheduled check happens after the interval; to send immediately:

```sh
uv run flask --app app send-alerts
```

When serving Flask through a separate web server, run exactly one scheduler process alongside the web workers:

```sh
uv run flask --app app run-scheduler
```

Tests use an isolated SQLite database and capture email without SMTP:

```sh
uv run python -m unittest discover -s tests -v
```
