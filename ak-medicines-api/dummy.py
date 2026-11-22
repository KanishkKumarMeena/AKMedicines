from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from werkzeug.security import generate_password_hash

from config import db
from models import Medicine, Salt, Transaction, User, Vendor


def add_dummy_data():
    if db.session.scalar(select(Medicine.id).limit(1)) is not None or db.session.scalar(select(Vendor.id).limit(1)) is not None:
        return False

    # 1. Seed NGO Admin & Staff Users
    seed_users = [
        ("NGO Admin", "admin", "admin@akmedicines.org", "admin123", "admin"),
        ("Asha Patel", "asha.patel", "asha@akmedicines.org", "staff123", "staff"),
        ("Rahul Verma", "rahul.verma", "rahul@akmedicines.org", "staff123", "staff"),
    ]
    for name, username, email, pwd, role in seed_users:
        if db.session.scalar(select(User.id).where(User.username == username)) is None:
            db.session.add(
                User(
                    name=name,
                    username=username,
                    email=email,
                    password_hash=generate_password_hash(pwd),
                    role=role,
                )
            )

    # 2. Seed Active Chemical Salts
    s_paracetamol = Salt(name="paracetamol")
    s_amoxiclav = Salt(name="amoxicillin + clavulanic acid")
    s_cetirizine = Salt(name="cetirizine")
    s_ors = Salt(name="oral rehydration salts")
    s_azithro = Salt(name="azithromycin")
    s_salbutamol = Salt(name="salbutamol")
    s_cipro = Salt(name="ciprofloxacin")
    s_metformin = Salt(name="metformin")
    s_omeprazole = Salt(name="omeprazole")
    s_ibuprofen = Salt(name="ibuprofen")

    # 3. Seed 6 External Medicine Suppliers (Vendors)
    vendors = [
        Vendor(
            name="Demo Generic Supplier",
            email="supplier@example.com",
            phone="9876543210",
            salts=[s_paracetamol, s_amoxiclav, s_azithro],
        ),
        Vendor(
            name="MedAid Pharma Distributors",
            email="orders@medaidpharma.org",
            phone="9123456780",
            salts=[s_paracetamol, s_cetirizine, s_ors],
        ),
        Vendor(
            name="Apex LifeCare Generics",
            email="supply@apexlifecare.in",
            phone="9811223344",
            salts=[s_amoxiclav, s_cipro, s_metformin],
        ),
        Vendor(
            name="Bharat Medical Supply Co.",
            email="contact@bharatmed.org",
            phone="9765432109",
            salts=[s_salbutamol, s_cetirizine, s_omeprazole],
        ),
        Vendor(
            name="Global Relief Pharma",
            email="dispatch@globalreliefpharma.org",
            phone="9988776655",
            salts=[s_ors, s_azithro, s_ibuprofen],
        ),
        Vendor(
            name="JanAushadhi Wholesale Hub",
            email="orders@janaushadhihub.in",
            phone="9112233445",
            salts=[s_metformin, s_omeprazole, s_cipro, s_ibuprofen],
        ),
    ]
    db.session.add_all(vendors)

    # 4. Seed 10 Medicines & 20 Realistic Ledger Transactions
    now = datetime.now(timezone.utc)
    catalog = [
        # (name, category, salt, unit, min_threshold, transactions: [(type, qty, party, logged_by, hours_ago)])
        (
            "Paracetamol 500 mg",
            "Analgesic / Antipyretic",
            s_paracetamol.name,
            "Tablets",
            50,
            [
                ("RECEIVE", 200, "Demo Generic Supplier", "admin", 96),
                ("DISPENSE", 60, "Rural Health Camp #1", "asha.patel", 48),
            ],
        ),
        (
            "Amoxicillin + Clavulanic Acid",
            "Antibiotic",
            s_amoxiclav.name,
            "Tablets",
            25,
            [
                ("RECEIVE", 60, "Apex LifeCare Generics", "admin", 90),
                ("DISPENSE", 50, "Mobile Flood Relief Clinic", "rahul.verma", 20),
            ],
        ),
        (
            "Cetirizine 10 mg",
            "Antihistamine",
            s_cetirizine.name,
            "Tablets",
            25,
            [
                ("RECEIVE", 40, "MedAid Pharma Distributors", "admin", 85),
                ("DISPENSE", 40, "Pediatric Allergy Outpost", "asha.patel", 12),
            ],
        ),
        (
            "ORS Sachet (WHO Formula)",
            "Electrolytes",
            s_ors.name,
            "Sachets",
            80,
            [
                ("RECEIVE", 300, "Global Relief Pharma", "admin", 80),
                ("DISPENSE", 110, "Community Dehydration Ward", "rahul.verma", 36),
            ],
        ),
        (
            "Azithromycin 500 mg",
            "Antibiotic",
            s_azithro.name,
            "Tablets",
            30,
            [
                ("RECEIVE", 90, "Demo Generic Supplier", "asha.patel", 75),
                ("DISPENSE", 72, "Primary Health Center East", "rahul.verma", 14),
            ],
        ),
        (
            "Ventolin Inhaler 100 mcg",
            "Respiratory",
            s_salbutamol.name,
            "Canisters",
            25,
            [
                ("RECEIVE", 50, "Bharat Medical Supply Co.", "admin", 70),
                ("DISPENSE", 35, "Asthma & Respiratory Camp", "asha.patel", 10),
            ],
        ),
        (
            "Ciprofloxacin 500 mg",
            "Antibiotic",
            s_cipro.name,
            "Tablets",
            40,
            [
                ("RECEIVE", 120, "JanAushadhi Wholesale Hub", "admin", 65),
                ("DISPENSE", 30, "Trauma & Wound Care Unit", "rahul.verma", 24),
            ],
        ),
        (
            "Metformin 500 mg",
            "Antidiabetic",
            s_metformin.name,
            "Tablets",
            60,
            [
                ("RECEIVE", 180, "Apex LifeCare Generics", "asha.patel", 60),
                ("DISPENSE", 85, "Elderly Chronic Care Van", "asha.patel", 18),
            ],
        ),
        (
            "Omeprazole 20 mg",
            "Other",
            s_omeprazole.name,
            "Capsules",
            30,
            [
                ("RECEIVE", 75, "Bharat Medical Supply Co.", "admin", 55),
                ("DISPENSE", 75, "General Outpatient Clinic", "rahul.verma", 6),
            ],
        ),
        (
            "Ibuprofen 400 mg",
            "Analgesic / Antipyretic",
            s_ibuprofen.name,
            "Tablets",
            40,
            [
                ("RECEIVE", 150, "JanAushadhi Wholesale Hub", "admin", 50),
                ("DISPENSE", 45, "Mobile Surgical Camp #2", "asha.patel", 8),
            ],
        ),
    ]

    for name, category, salt, unit, threshold, tx_list in catalog:
        medicine = Medicine(
            name=name,
            category=category,
            salt_ingredients=salt,
            unit=unit,
            min_threshold=threshold,
        )
        db.session.add(medicine)
        db.session.flush()

        for tx_type, qty, party, logged_by, hours_ago in tx_list:
            db.session.add(
                Transaction(
                    medicine_id=medicine.id,
                    transaction_type=tx_type,
                    quantity=qty,
                    party=party,
                    logged_by=logged_by,
                    timestamp=now - timedelta(hours=hours_ago),
                )
            )

    db.session.commit()
    return True
