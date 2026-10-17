import unittest

from app import create_app
from background.alerts import send_stock_alerts
from config import db, mail
from dummy import add_dummy_data


class InventoryTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite://", "MAIL_SUPPRESS_SEND": True, "MAIL_DEFAULT_SENDER": "alerts@example.com", "ADMIN_EMAIL": "admin@example.com"})
        self.context = self.app.app_context()
        self.context.push()
        db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def add_medicine(self, **changes):
        data = dict(name="Demo", category="Analgesic", salt_ingredients="Paracetamol", initial_stock=30)
        data.update(changes)

        return self.client.post("/api/medicines", json=data)

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

    def test_vendor_matching_and_email(self):
        self.add_medicine(salt_ingredients=" Clavulanic Acid + Amoxicillin ", initial_stock=0)
        response = self.client.post("/api/vendors", json=dict(name="Supplier", email="supplier@example.com", salt_ingredients=["amoxicillin+clavulanic acid"]))
        self.assertEqual(response.status_code, 201)

        self.client.post("/api/vendors", json=dict(name="Other", email="other@example.com", salt_ingredients=["amoxicillin"]))
        alerts = self.client.get("/api/alerts").get_json()

        self.assertEqual([vendor["name"] for vendor in alerts[0]["vendors"]], ["Supplier"])
        with mail.record_messages() as messages:
            self.assertEqual(send_stock_alerts(), 1)
            
        self.assertEqual(len(messages), 1)
        self.assertIn("Supplier", messages[0].html)

    def test_threshold_and_dummy_data(self):
        self.assertTrue(add_dummy_data())
        self.assertFalse(add_dummy_data())
        self.assertEqual(len(self.client.get("/api/medicines").get_json()), 3)
        self.assertEqual(len(self.client.get("/api/alerts").get_json()), 2)

        medicine = self.add_medicine(initial_stock=25).get_json()
        self.assertEqual(medicine["status"], "ample")


if __name__ == "__main__":
    unittest.main()
