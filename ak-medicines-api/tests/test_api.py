import unittest
from datetime import datetime, timedelta, timezone

import jwt

from app import create_app
from background.alerts import send_stock_alerts
from config import db, mail
from dummy import add_dummy_data


class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite://", "MAIL_SUPPRESS_SEND": True, "MAIL_DEFAULT_SENDER": "alerts@example.com", "ADMIN_EMAIL": "admin@example.com", "JWT_SECRET": "test-secret-with-at-least-32-bytes"})
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()
        self.client = self.app.test_client()
        self.client.environ_base["HTTP_AUTHORIZATION"] = self.authorization()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def add_medicine(self, **changes):
        data = dict(name="Demo", category="Analgesic", salt_ingredients="Paracetamol", initial_stock=30)
        data.update(changes)

        return self.client.post("/api/medicines", json=data)

    def authorization(self, role="admin"):
        token = jwt.encode({"sub": "test-user", "role": role, "exp": datetime.now(timezone.utc) + timedelta(minutes=5), "iss": self.app.config["JWT_ISSUER"], "aud": self.app.config["JWT_AUDIENCE"]}, self.app.config["JWT_SECRET"], algorithm="HS256")
        return f"Bearer {token}"

    def test_ledger_and_overdraft(self):
        response = self.add_medicine()
        self.assertEqual(response.status_code, 201)

        medicine = response.get_json()
        self.assertEqual(medicine["current_stock"], 30)

        data = dict(medicine_id=medicine["id"], transaction_type="DISPENSE", quantity=31, party="Clinic")
        self.assertEqual(self.client.post("/api/transactions", json=data).status_code, 409)

        data["quantity"] = 6
        response = self.client.post("/api/transactions", json=data)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["current_stock"], 24)
        self.assertEqual(self.client.get("/api/medicines").get_json()[0]["status"], "low_stock")
        self.assertEqual(len(self.client.get("/api/transactions").get_json()), 2)

    def test_validation(self):
        for changes in [dict(name=" "), dict(initial_stock=-1), dict(min_threshold=1.5), dict(salt_ingredients=" + ")]:
            self.assertEqual(self.add_medicine(**changes).status_code, 400)

        self.assertEqual(self.client.post("/api/medicines", json=[]).status_code, 400)
        self.assertEqual(self.client.post("/api/transactions", json=dict(medicine_id=999, transaction_type="RECEIVE", quantity=1, party="Donor")).status_code, 404)
        self.assertEqual(self.client.get("/api/medicines").get_json(), [])

    def test_authentication_required(self):
        response = self.client.get("/api/medicines", headers={"Authorization": ""})
        self.assertEqual(response.status_code, 401)

    def test_vendor_matching_and_email(self):
        self.add_medicine(salt_ingredients=" Clavulanic Acid + Amoxicillin ", initial_stock=0)
        response = self.client.post("/api/vendors", json=dict(name="Supplier", email="supplier@example.com", phone="1234567890", salt_ingredients=["amoxicillin+clavulanic acid"]))
        self.assertEqual(response.status_code, 201)

        self.client.post("/api/vendors", json=dict(name="Other", email="other@example.com", phone="9876543210", salt_ingredients=["amoxicillin"]))
        alerts = self.client.get("/api/alerts").get_json()

        self.assertEqual([vendor["name"] for vendor in alerts[0]["vendors"]], ["Supplier"])
        with mail.record_messages() as messages:
            self.assertEqual(send_stock_alerts(), 1)
            
        self.assertEqual(len(messages), 1)
        self.assertIn("Supplier", messages[0].html)

    def test_admin_creates_user_and_login(self):
        data = dict(name="Asha Patel", username="asha.patel", email="asha@example.com", password="long-enough-password")

        response = self.client.post("/api/users", json=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["username"], "asha.patel")
        self.assertEqual(response.get_json()["role"], "staff")
        self.assertNotIn("password", response.get_json())
        self.assertEqual(self.client.post("/api/users", json=data).status_code, 409)

        login_resp = self.client.post("/api/login", json=dict(username="asha.patel", password="long-enough-password"), headers={"Authorization": ""})
        self.assertEqual(login_resp.status_code, 200)
        self.assertIn("token", login_resp.get_json())

        bad_login = self.client.post("/api/login", json=dict(username="asha.patel", password="wrong"), headers={"Authorization": ""})
        self.assertEqual(bad_login.status_code, 401)

        data["username"] = "another.user"
        data["email"] = "another@example.com"
        self.assertEqual(self.client.post("/api/users", json=data, headers={"Authorization": self.authorization("staff")}).status_code, 403)

        user_id = response.get_json()["id"]
        self.assertEqual(self.client.delete(f"/api/users/{user_id}", headers={"Authorization": self.authorization("staff")}).status_code, 403)
        self.assertEqual(self.client.delete(f"/api/users/{user_id}").status_code, 200)
        self.assertEqual(self.client.delete(f"/api/users/{user_id}").status_code, 404)

    def test_threshold_and_dummy_data(self):
        self.assertTrue(add_dummy_data())
        self.assertFalse(add_dummy_data())
        self.assertEqual(len(self.client.get("/api/medicines").get_json()), 3)
        self.assertEqual(len(self.client.get("/api/alerts").get_json()), 2)

        medicine = self.add_medicine(initial_stock=25).get_json()
        self.assertEqual(medicine["status"], "ample")


if __name__ == "__main__":
    unittest.main()
