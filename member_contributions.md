# Member Contributions

## a) Percentage Contribution of Each Member

* Kanishk: 50%
* Aryan: 50%

(Both team members mutually agree on an equal 50% / 50% split across the frontend/integration/deployment domain and the backend/database/automation domain.)

---

## b) Each Member's Contribution (Module Level)

### Kanishk
* **Frontend SPA & Responsive UI:** Built the React + Tailwind CSS application (`Dashboard`, `Inventory`, `Log Transaction`, `Stock Alerts`, `Login`, `Staff`) with mobile hamburger navigation, horizontally scrollable tables, and custom branding (`AK.svg`).
* **Client–Server API Integration:** Built `InventoryContext.jsx` to sync React with Flask REST endpoints, map data schemas, block overdraft dispensations on the client, and dynamically filter intake suppliers by active chemical salt.
* **Authentication & Staff RBAC UI:** Implemented the Flask `POST /api/login` and `GET/DELETE /api/users` endpoints alongside the NGO Login screen and Admin-only Staff management module.
* **CSV Donor Audit & Bulk Upload Tools:** Implemented 1-click CSV exports for the immutable transaction ledger and medicine catalog, plus header-validated Bulk CSV medicine ingestion.
* **Cloud Deployment Pipeline:** Configured Flask to serve the compiled React `dist/` bundle on a single origin, startup DB auto-seeding, and Gunicorn deployment on Render (`https://akmedicines.onrender.com/`).

### Aryan
* **Database & ORM Foundation:** Designed the SQLAlchemy relational schema (`Medicine`, `Transaction`, `Salt`, `Vendor`, `User`, and `medicine_vendors` M2M association table) and CLI database initialization/seeding (`init-db`, `dummy-db`).
* **Immutable Ledger & Concurrency Engine:** Implemented dynamic SQL `SUM(CASE...)` stock calculation, row-level locking (`with_for_update()`), and `HTTP 409` overdraft prevention.
* **Salt Normalization & Vendor Matching:** Built `normalize_salt()` and the low-stock vendor matching logic (`GET/POST /api/vendors`, `GET /api/alerts`).
* **JWT Security & Automated Email Alert Pipeline:** Built PyJWT request guards, `@require_roles("admin")`, the 6-hour `APScheduler` background audit job, and `Flask-Mail` HTML email templating (`templates/stock_alert.html`).
* **Backend Testing:** Wrote the automated `unittest` suite (`tests/test_api.py`) covering ledger math, overdrafts, validation, auth, vendor matching, and email capture.

---

## c) GitHub Logs

```text
dbbd08d | KanishkKumarMeena | 2026-11-22 22:06:39 +0530 | Show supplier attribution on transactions and expand seed dataset
e738ef8 | KanishkKumarMeena | 2026-11-22 18:51:50 +0530 | Add immediate low-stock email alert on dispense and CSV header validation
3344468 | KanishkKumarMeena | 2026-11-22 13:33:59 +0530 | Fix setuptools package discovery and add requirements.txt for Render build
a425185 | KanishkKumarMeena | 2026-11-22 13:23:31 +0530 | Configure Flask SPA serving, auto-seeding, and gunicorn for Render deployment
da4e693 | KanishkKumarMeena | 2026-11-21 19:06:10 +0530 | Add option to remove staff accounts
2058d48 | KanishkKumarMeena | 2026-11-20 21:33:36 +0530 | Add CSV donor audit export and bulk CSV medicine upload
c33d462 | KanishkKumarMeena | 2026-11-20 16:58:00 +0530 | Add Part 4 plan for CSV export/upload and ML stock-out forecasting to ToDo
274cbc5 | KanishkKumarMeena | 2026-11-19 23:46:57 +0530 | Connect frontend with Flask backend API
c24411b | KanishkKumarMeena | 2026-11-19 23:46:57 +0530 | Add NGO login endpoint and login UI
7f76b72 | Aryan Ramani      | 2026-11-17 16:18:36 +0530 | Added authetication and User creation by vendor admins
7eae07c | Aryan Ramani      | 2026-10-17 15:15:14 +0530 | initial api commit
e923d3c | KanishkKumarMeena | 2026-10-12 09:41:53 +0530 | README update
0702081 | KanishkKumarMeena | 2026-10-12 09:34:39 +0530 | navbar and table updates for responsivness
3edd622 | KanishkKumarMeena | 2026-10-12 09:03:37 +0530 | context update
c733225 | KanishkKumarMeena | 2026-10-12 09:02:21 +0530 | basic pages
028aacc | KanishkKumarMeena | 2026-10-11 17:04:55 +0530 | Logo and color update
c35129c | KanishkKumarMeena | 2026-10-11 16:36:47 +0530 | App setup with dashboard
a2c4ca0 | KanishkKumarMeena | 2026-10-10 22:13:11 +0530 | React setup with basic frontend
```
