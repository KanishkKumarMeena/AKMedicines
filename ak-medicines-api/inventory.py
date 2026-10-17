from sqlalchemy import case, func, select

from config import db
from models import Medicine, Transaction, Vendor
from api.schema import MedicineSchema


def stock_expression():
    return func.coalesce(func.sum(case(
        (Transaction.transaction_type == "RECEIVE", Transaction.quantity),
        else_=-Transaction.quantity,
    )), 0)


def current_stock(medicine_id):
    return db.session.scalar(select(stock_expression()).where(Transaction.medicine_id == medicine_id))


def medicine_details(medicine, stock):
    data = MedicineSchema().dump(medicine)
    data["current_stock"] = stock
    data["status"] = "depleted" if stock == 0 else "low_stock" if stock < medicine.min_threshold else "ample"
    return data


def inventory():
    "returns inventory"
    rows = db.session.execute(
        select(Medicine, stock_expression()).outerjoin(Transaction)
        .group_by(Medicine.id).order_by(Medicine.id)
    ).all()
    return [medicine_details(medicine, stock) for medicine, stock in rows]


def vendor_details(vendor):
    """formats ventor details from object to a json/python dict"""
    return {"id": vendor.id, "name": vendor.name, "email": vendor.email,
            "phone": vendor.phone, "salt_ingredients": [salt.name for salt in vendor.salts]}


def low_stock_alerts():
    vendors = db.session.scalars(select(Vendor).order_by(Vendor.id)).all()
    
    alerts = []
    for medicine in inventory():
        if medicine["status"] == "ample":
            continue
        medicine["vendors"] = [vendor_details(vendor) for vendor in vendors
                               if medicine["salt_ingredients"] in [salt.name for salt in vendor.salts]]
        alerts.append(medicine)

    return alerts
