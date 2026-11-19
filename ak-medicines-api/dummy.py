from sqlalchemy import select
from werkzeug.security import generate_password_hash

from config import db
from models import Medicine, Salt, Transaction, User, Vendor


def add_dummy_data():
    if db.session.scalar(select(Medicine.id).limit(1)) is not None or db.session.scalar(select(Vendor.id).limit(1)) is not None:
        return False

    if db.session.scalar(select(User.id).where(User.username == "admin")) is None:
        db.session.add(
            User(
                name="NGO Admin",
                username="admin",
                email="admin@akmedicines.org",
                password_hash=generate_password_hash("admin123"),
                role="admin",
            )
        )

    paracetamol = Salt(name="paracetamol")
    antibiotic = Salt(name="amoxicillin + clavulanic acid")
    cetirizine = Salt(name="cetirizine")

    db.session.add(
        Vendor(
            name="Demo Generic Supplier",
            email="supplier@example.com",
            phone="9876543210",
            salts=[paracetamol, antibiotic],
        )
    )
    db.session.add(
        Vendor(
            name="MedAid Pharma Distributors",
            email="orders@medaidpharma.org",
            phone="9123456780",
            salts=[paracetamol, cetirizine],
        )
    )

    for name, category, salt, quantity in [
        ("Paracetamol 500 mg", "Analgesic", paracetamol.name, 100),
        ("Amoxicillin + Clavulanic Acid", "Antibiotic", antibiotic.name, 10),
        ("Cetirizine 10 mg", "Antihistamine", cetirizine.name, 0),
    ]:
        medicine = Medicine(name=name, category=category, salt_ingredients=salt, min_threshold=25)
        db.session.add(medicine)
        db.session.flush()
        if quantity:
            db.session.add(Transaction(medicine_id=medicine.id, transaction_type="RECEIVE", quantity=quantity, party="Demo Generic Supplier"))

    db.session.commit()
    return True
