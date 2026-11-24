## **AK Medicines**: Transaction-Driven Inventory & Alert System for Medical NGOs

- Aryan Ramani
- Kanishk Kumar Meena

- [GitHub Repo](https://github.com/KanishkKumarMeena/AKMedicines)
- [Live Demo](https://akmedicines.onrender.com/)


**Architecture & Tech Stack**

* **Frontend:** React + Tailwind CSS (Operational dashboard, inventory management, data entry forms, real-time audit ledger).
* **Backend:** Flask (Python REST API managing business logic, transaction processing, and automated email alerts).
* **Database:** SQLite / PostgreSQL (via SQLAlchemy) storing immutable transaction logs, medicine details, and vendor contacts.

---

**Core System Workflows & Logic**

**1. Medicine Registration & Baseline Ingestion**
NGO staff register medicines into the system using manual entry forms or bulk upload. The catalog captures granular, clinical details:

* **Brand Name & Category:** e.g., *Augmentin 625 Duo* categorized by therapeutic class (*Antibiotic*, *Analgesic*, *Respiratory*, *Electrolytes*).
* **Salts / Active Formulations:** Tracking the chemical salt (e.g., *Amoxicillin + Clavulanic Acid*) is a core architectural requirement. When a commercial brand runs out, the system uses this formulation to identify generic substitutes and matching vendors.
* **Safety Threshold (Default: 25):** The minimum safety threshold is optional during registration; if omitted, the system automatically defaults to **25 units**.
* **Ledger Purity on Intake:** Any initial stock entered during registration is directly logged as a baseline `RECEIVE` transaction rather than overwriting a static quantity column.

**2. Immutable Ledger-Based Tracking**
Rather than directly overwriting a mutable "quantity" column in a database, AK Medicines functions as an audit ledger.

* **Discrete Events:** Staff record two transaction types:
  * **`RECEIVE` (Stock In):** Inward shipments from registered external medicine suppliers (dynamically filtered in the dropdown to show only vendors supplying that medicine's active salt).
  * **`DISPENSE` (Stock Out):** Outward issues to field clinics, camps, or patient wards.
* **Dynamic Stock Calculation:** On-hand stock is calculated dynamically:
  $$\text{Current Stock} = \sum \text{RECEIVE} - \sum \text{DISPENSE}$$
* **Overdraft Guard:** The system performs immediate client and server (`HTTP 409`) validation, blocking any dispensation that exceeds the currently calculated on-hand stock.
* **Essential Audit Trail:** Every event permanently logs the timestamp, medicine ID, transaction type, quantity, and party (supplier or clinic destination).

**3. Stock Health Audits & Smart Alerts**
The system continuously evaluates calculated stock against defined safety thresholds, categorizing items into three operational states:

* **Ample:** Stock is at or above the safety threshold; supply is healthy.
* **Low Stock:** Stock has fallen below the safety threshold; alerts are generated for proactive restocking.
* **Depleted:** Stock has reached zero; flagged immediately for urgent supply procurement.
* **Active Salt Vendor Matching:** When medicines reach *Low Stock* or *Depleted* status, the backend matches their active chemical salts with registered wholesale generic suppliers, displaying matching suppliers directly on the Stock Alerts page and dispatching scheduled email notifications (`APScheduler` + `Flask-Mail`) to NGO administrators.

---

**Code Organization & Role of Each File**

```text
AKMedicines/
├── ak-medicines-ui/                # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── App.jsx                 # Root layout, client-side routing, responsive navbar, and auth session gate
│   │   ├── main.jsx                # React DOM entry point
│   │   ├── index.css               # Tailwind CSS directives and base styles
│   │   ├── assets/AK.svg           # Custom vector project logo
│   │   ├── context/
│   │   │   └── InventoryContext.jsx# Central state hub: Bearer JWT fetch client and snake_case-to-camelCase mappers
│   │   └── pages/
│   │       ├── Login.jsx           # NGO staff & admin login screen (/api/login)
│   │       ├── Dashboard.jsx       # KPI summary cards, low-stock warning banner, and recent audit ledger table
│   │       ├── Inventory.jsx       # Searchable medicine catalog, inline registration form, Bulk CSV upload, and Stock CSV export
│   │       ├── Transactions.jsx    # RECEIVE/DISPENSE logger with salt-filtered supplier dropdown, overdraft guard, and Ledger CSV export
│   │       ├── Alerts.jsx          # Low-stock & depleted medicine monitor displaying matched generic suppliers
│   │       └── Staff.jsx           # Admin-only RBAC view to list, create, and remove NGO staff accounts
│   ├── vite.config.js              # Vite configuration and local /api proxy to Flask (127.0.0.1:5000)
│   └── package.json                # Frontend dependencies and build scripts
│
├── ak-medicines-api/               # Python Flask REST API & Background Alert Engine
│   ├── app.py                      # Flask app factory, error handlers, CLI commands (init-db, dummy-db), and SPA static serving
│   ├── config.py                   # Environment variable loader (DATABASE_URL, JWT settings, Flask-Mail SMTP config)
│   ├── models.py                   # SQLAlchemy models (Medicine, Transaction, Salt, Vendor, User, medicine_vendors) & normalize_salt()
│   ├── inventory.py                # Dynamic SQL ledger stock calculator (SUM(RECEIVE) - SUM(DISPENSE)) and low-stock vendor matcher
│   ├── dummy.py                    # Database seeder populating demo NGO users, 6 generic suppliers, 10 medicines, and 20 ledger entries
│   ├── api/
│   │   ├── auth.py                 # PyJWT HS256 token creation, Bearer authentication hook, and @require_roles("admin") decorator
│   │   ├── routes.py               # REST endpoints (/api/login, /medicines, /transactions, /vendors, /alerts, /users)
│   │   └── schema.py               # Marshmallow validation & serialization schemas for all API payloads
│   ├── background/
│   │   ├── alerts.py               # Formats and sends low-stock HTML alert emails via Flask-Mail
│   │   └── scheduler.py            # APScheduler 6-hour recurring alert job and CLI commands (send-alerts, run-scheduler)
│   ├── templates/
│   │   └── stock_alert.html        # Jinja2 HTML email template listing low/depleted medicines and matching supplier contacts
│   ├── tests/
│   │   └── test_api.py             # Automated unittest suite covering ledger math, overdrafts, validation, auth, and email dispatch
│   ├── pyproject.toml              # Python project metadata and dependencies (managed with uv)
│   └── requirements.txt            # Production pip dependencies for Render / Gunicorn deployment
│
├── README.md                       # Project documentation, workflows, file organization, and AI use statement
└── ToDo.md                         # Project milestone and task checklist
```

---

**AI & External Resource Use Statement**
Please see: 
- [Frontend AI Declaration](./FrontendAIDeclaration.txt)
- [Backend AI Declaration](./BackendAIDeclaration.txt)