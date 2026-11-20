### Part 1: (Frontend + Core Inventory API)

* **React Frontend (UI/UX):**
* [completed] Build the Main Dashboard (viewing current stock and alerts).
* [completed] Build the Data Entry Forms (Log a Dispense/Receive transaction, Add new medicine).
* [completed] Make UI mobile-responsive (collapsible mobile navbar, horizontally scrollable tables & filter bars) and apply custom brand theme (`AK.svg`).
* [completed] Wire up the API calls using `fetch` to pull data from Flask.


* **Flask Backend (Inventory Service):**
* [completed] **CRUD Endpoints:** Write the Flask routes for `GET /api/medicines`, `POST /api/medicines`, `GET /api/vendors`, `POST /api/vendors`, and `POST /api/users`.
* [completed] **The Ledger Logic:** Write the `GET /api/transactions` and `POST /api/transactions` endpoints with overdraft protection (`HTTP 409`).
* [completed] **Stock Calculator:** Write the logic that calculates current stock on the fly (`SUM(Receive) - SUM(Dispense)`) to send to the React dashboard.



### Part 2: (Automation Engine + Database)

* **Database Foundation:**
* [completed] Set up Flask-SQLAlchemy and define the Python classes/models for `Medicine`, `Transaction`, `Salt`, `Vendor`, and `User`.
* [completed] Write database initialization (`init-db`) and dummy seeding (`dummy-db`) commands, plus unit tests (`tests/test_api.py`).


* **The Alert & Email Pipeline (Background Service):**
* [completed] **Task Scheduling:** Implement `APScheduler` inside Flask to run a background loop (every 6 hours) without freezing the web server.
* [completed] **Vendor Matching Algorithm:** Write the Python logic that identifies which medicines are below their `min_threshold`, normalizes their `salt_ingredients`, and queries the database for vendors who supply that exact formulation (`GET /api/alerts`).
* [completed] **Email Dispatch:** Integrate `Flask-Mail` to format low-stock alerts and matching vendor details into an HTML email (`stock_alert.html`) and send it to the NGO administrator.
* [completed] **JWT Guard on `/api` Routes:** Require `Authorization: Bearer <token>` (HS256 JWT with `sub`, `exp`, `role`, `JWT_ISSUER`, `JWT_AUDIENCE`) across `/api/*` endpoints.



### Part 3: Remaining Integration & Finalization Tasks

* **1. NGO Login Screen & JWT Authentication Flow:**
* [completed] Fix NGO vs. external vendor distinction in `models.py`, `api/schema.py`, and `api/routes.py` (users are NGO staff/admins; vendors are external medicine suppliers).
* [completed] Add a public `POST /api/login` endpoint in Flask (`api/routes.py`) that verifies credentials against the `User` table (`check_password_hash`) and returns an HS256 JWT (`Authorization: Bearer <token>`), plus seed a default NGO admin account (`admin` / `admin123`) in `dummy.py`.
* [completed] Build an NGO Login screen (`Login.jsx`) in the React frontend matching the `#00171f` / `#5bf693` brand theme, store the session token, and add a Logout button in the navbar.

* **2. Wire React Frontend (`InventoryContext.jsx`) to Backend API:**
* [completed] Replace `INITIAL_MEDICINES` and `INITIAL_TRANSACTIONS` mock state in `InventoryContext.jsx` with live `fetch()` calls to `GET/POST /api/medicines`, `GET/POST /api/transactions`, `GET /api/alerts`, and `GET /api/vendors`.
* [completed] Configure `/api` routing/proxy in `vite.config.js`.

* **3. Reconcile Frontend ↔ Backend Data Contracts:**
* [completed] Map field names between backend snake_case (`salt_ingredients`, `min_threshold`, `current_stock`, `medicine_id`, `transaction_type`, `party`) and frontend camelCase (`salts`, `minThreshold`, `currentStock`, `medicineId`, `type`, `sourceOrDest`).
* [completed] Align stock status values and threshold boundaries (`"ample"`, `"low_stock"`, `"depleted"` vs. `'AMPLE'`, `'LOW_STOCK'`, `'OUT_OF_STOCK'`).
* [completed] Replace `window.confirm()` overdraft prompt in `Transactions.jsx` with strict overdraft blocking / inline error handling matching the backend's `HTTP 409` response.
* [completed] Handle the `unit` field in `Inventory.jsx` and backend `Medicine` model (`default="Tablets"`).

* **4. Medicine-Filtered Supplier Dropdown & Alert Suppliers:**
* [completed] In `Transactions.jsx`: When logging a `RECEIVE` (Intake) transaction, replace the free-text supplier input with a dynamic **Supplier dropdown** filtered to show only vendors from the database (`GET /api/vendors`) that supply the selected medicine.
* [completed] In `Alerts.jsx`: Display the matching suppliers (returned in `medicine.vendors` from `GET /api/alerts`) directly on each low-stock / depleted medicine alert card.

* **5. Local Environment Setup & Documentation Sync:**
* [completed] Create `ak-medicines-api/.env` (`DATABASE_URL`, `JWT_SECRET`, SMTP config), run `init-db` & `dummy-db`, and verify the backend test suite.
* [completed] Update `libraries.md`, `explanation.md`, and `README.md` with the final integrated architecture and dependencies.



### Part 4: Additional Features (CSV Audit/Upload & ML Stock-Out Forecasting)

* **1. CSV Donor Audit Export & Bulk CSV Upload (Kanishk — Frontend):**
* **One-Click CSV Audit Export:**
  * In `Transactions.jsx`: Add an **"Export Ledger CSV"** button that downloads the immutable transaction history (`ak_medicines_audit_ledger.csv`) for NGO donor compliance.
  * In `Inventory.jsx`: Add an **"Export Stock CSV"** button that downloads the current medicine catalog and live calculated stock (`ak_medicines_inventory.csv`).
* **Bulk CSV Upload:**
  * In `Inventory.jsx`: Add a **"Bulk Upload CSV"** option (plus a sample CSV template download) that parses rows (`name,category,salt_ingredients,unit,min_threshold,initial_stock,party`) and registers medicines along with their initial `RECEIVE` ledger entries via `POST /api/medicines`.

* **2. ML Stock-Out Prediction & 30-Day Reorder Forecasting (Aryan — Backend, then UI):**
* **Forecasting Model (`ak-medicines-api/inventory.py` or `forecast.py`):**
  * Use historical `DISPENSE` transactions from the ledger to fit a Linear Regression / Weighted Daily Burn-Rate consumption model per medicine.
  * Compute and return three fields inside `medicine_details()` (included in `GET /api/medicines` and `GET /api/alerts`):
    * `daily_burn_rate`: Predicted units dispensed per day (`0` if no dispensation history).
    * `predicted_days_left`: `floor(current_stock / daily_burn_rate)` (`null` if burn rate is `0`, `0` if depleted).
    * `recommended_restock`: `max(0, ceil(30 * daily_burn_rate + min_threshold - current_stock))` to cover 30 days of predicted demand.
* **Frontend Forecast Display (`Alerts.jsx` & `Inventory.jsx`):**
  * Display **"Est. Run-Out (~N days)"** and **"Suggested 30-Day Order"** badges on the Alerts and Inventory pages once the backend fields are available.

