**Project Title:** AK Medicines: Transaction-Driven Inventory & Alert System for Medical NGOs

**Members:**
- Aryan Ramani
- Kanishk Kumar Meena

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
  * **`RECEIVE` (Stock In):** Inward shipments from donors, suppliers, or procurements.
  * **`DISPENSE` (Stock Out):** Outward issues to field clinics, camps, or patient wards.
* **Dynamic Stock Calculation:** On-hand stock is calculated dynamically:
  $$\text{Current Stock} = \sum \text{RECEIVE} - \sum \text{DISPENSE}$$
* **Overdraft Guard:** The system performs immediate client/server validation, warning operators if a dispense quantity exceeds the currently calculated on-hand stock.
* **Essential Audit Trail:** Every event permanently logs the timestamp, medicine ID, transaction type, quantity, and party (donor/supplier or clinic destination).

**3. Stock Health Audits & Smart Alerts**
The system continuously evaluates calculated stock against defined safety thresholds, categorizing items into three operational states:

* **Ample:** Stock is strictly above the safety threshold; supply is healthy.
* **Low Stock:** Stock has fallen below the safety threshold; alerts are generated for proactive restocking.
* **Depleted:** Stock has reached zero; flagged immediately for urgent supply procurement.
* **Active Salt Vendor Matching:** When medicines reach *Low Stock* or *Depleted* status, the backend matches their active chemical salts with registered wholesale generic suppliers, generating recommendations and email notifications for NGO administrators.
