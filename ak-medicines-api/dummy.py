from sqlalchemy import select

from config import db
from models import Medicine, Salt, Transaction, Vendor


def add_dummy_data():
    if db.session.scalar(select(Medicine.id).limit(1)) is not None or db.session.scalar(select(Vendor.id).limit(1)) is not None:
        return False
    
    paracetamol = Salt(name="paracetamol")
    antibiotic = Salt(name="amoxicillin + clavulanic acid")
    
    db.session.add(Vendor(name="Demo Generic Supplier", email="supplier@example.com", salts=[paracetamol, antibiotic]))
    for name, category, salt, quantity in [
        ("Paracetamol 500 mg", "Analgesic", paracetamol.name, 100),
        ("Amoxicillin + Clavulanic Acid", "Antibiotic", antibiotic.name, 10),
        ("Cetirizine 10 mg", "Antihistamine", "cetirizine", 0),
    ]:
        medicine = Medicine(name=name, category=category, salt_ingredients=salt, min_threshold=25)
        db.session.add(medicine)
        db.session.flush()
        if quantity:
            db.session.add(Transaction(medicine_id=medicine.id, transaction_type="RECEIVE", quantity=quantity, party="Demo donation"))
            
    db.session.commit()
    return True
