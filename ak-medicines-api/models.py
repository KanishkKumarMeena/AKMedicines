from datetime import datetime, timezone

from config import db


medicine_vendors = db.Table(
    "medicine_vendors",
    db.Column("vendor_id", db.Integer, db.ForeignKey("vendors.id"), primary_key=True),
    db.Column("salt_id", db.Integer, db.ForeignKey("salts.id"), primary_key=True),
)


def normalize_salt(value):
    return " + ".join(sorted(" ".join(part.lower().split()) for part in value.split("+") if part.strip()))


class Medicine(db.Model):
    __tablename__ = "medicines"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    salt_ingredients = db.Column(db.String(250), nullable=False, index=True)
    min_threshold = db.Column(db.Integer, nullable=False, default=25)
    transactions = db.relationship("Transaction", back_populates="medicine")
    __table_args__ = (db.CheckConstraint("min_threshold >= 0"),)


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    medicine_id = db.Column(db.Integer, db.ForeignKey("medicines.id"), nullable=False, index=True)
    transaction_type = db.Column(db.String(10), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    party = db.Column(db.String(150), nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    medicine = db.relationship("Medicine", back_populates="transactions")
    __table_args__ = (
        db.CheckConstraint("quantity > 0"),
        db.CheckConstraint("transaction_type IN ('RECEIVE', 'DISPENSE')"),
    )


class Salt(db.Model):
    __tablename__ = "salts"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), nullable=False, unique=True)


class Vendor(db.Model):
    __tablename__ = "vendors"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(254), nullable=False)
    phone = db.Column(db.String(30))
    salts = db.relationship("Salt", secondary=medicine_vendors, lazy="selectin")
