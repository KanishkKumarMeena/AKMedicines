**Project Title:** AK Medicines: Transaction-Driven Inventory & Alert System for Medical NGOs

**Members:**
- Aryan Ramani
- Kanishk Kumar Meena

**Architecture & Tech Stack**

* **Frontend:** React (Handles the dashboard UI, data upload components, and transaction forms).
* **Backend:** Flask (Python REST API managing business logic, transaction processing, and automated email dispatches).
* **Database:** PostgreSQL or SQLite (via SQLAlchemy) to store the ledger and inventory states.

**Core System Workflows**

**1. Initial Data Ingestion (The Baseline)**
NGO staff onboard onto the system by uploading their current inventory. This can be handled via a bulk CSV upload or manual data entry forms in React. The database captures granular details:

* **Medicine Details:** Brand name, quantity, and expiration dates.
* **Salts / Active Ingredients:** Tracking salts is a critical architectural decision. If a specific brand runs out, the system can identify alternative brands in stock with the exact same salts, or suggest vendors that sell generic equivalents.

**2. Ledger-Based Transaction Tracking**
Rather than directly overwriting a "quantity" cell in a database, AK Medicines uses a transaction logging approach.

* Staff log discrete events: *Dispensing* (e.g., "Issued 50 units of Amoxicillin to Mobile Clinic A") or *Receiving* (e.g., "Intake of 200 units from Donor X").
* The Flask backend dynamically calculates the current on-hand stock by summing these transactions. This provides the NGO with an immutable audit trail, preventing untracked inventory shrinkage or mismanagement.

**3. Automated Audits & Alerts**
The Flask backend routinely checks the dynamically calculated stock against predefined safety thresholds.

* **Expiring Stock:** Flags medicines approaching their expiry date so the NGO can prioritize dispensing them.
* **Depleted Stock:** Triggers an email alert via the Flask backend. Using the *salt* data, the alert suggests vetted suppliers or generic alternatives to restock.

