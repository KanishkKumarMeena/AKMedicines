### Part 1: (Frontend + Core Inventory API)

* **React Frontend (UI/UX):**
* Build the Main Dashboard (viewing current stock and alerts).
* Build the Data Entry Forms (Log a Dispense/Receive transaction, Add new medicine).
* Wire up the API calls using `fetch` or React Query to pull data from Flask.


* **Flask Backend (Inventory Service):**
* **CRUD Endpoints:** Write the Flask routes for `GET /api/medicines` and `POST /api/medicines`.
* **The Ledger Logic:** Write the `POST /api/transactions` endpoint.
* **Stock Calculator:** Write the logic that calculates current stock on the fly (`SUM(Receive) - SUM(Dispense)`) to send to your React dashboard.



### Part 2: (Automation Engine + Database)

* **Database Foundation:**
* Set up Flask-SQLAlchemy and define the Python classes/models for `Medicine`, `Transaction`, and `Vendor`.
* Generate the SQLite/PostgreSQL database file and load it with initial seed/dummy data.


* **The Alert & Email Pipeline (Background Service):**
* **Task Scheduling:** Implement `APScheduler` inside Flask to run a background loop (e.g., every 6 hours) without freezing the web server.
* **Vendor Matching Algorithm:** Write the Python logic that identifies which medicines are below their `min_threshold`, looks up their `salt_ingredients`, and queries the database for vendors who sell that exact salt.
* **Email Dispatch:** Integrate `Flask-Mail` or a free tier of SendGrid to format this data into an HTML email and automatically send it to the NGO administrator.