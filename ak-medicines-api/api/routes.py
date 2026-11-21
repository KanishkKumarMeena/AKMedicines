from flask import Blueprint, abort, jsonify, request
from sqlalchemy import select
from werkzeug.security import check_password_hash, generate_password_hash

from config import db
from api.auth import authenticate, create_token, require_roles
from inventory import current_stock, inventory, low_stock_alerts, medicine_details, vendor_details
from models import Medicine, Salt, Transaction, User, Vendor, normalize_salt
from api.schema import LoginSchema, MedicineSchema, TransactionSchema, UserSchema, VendorSchema


api = Blueprint("api", __name__, url_prefix="/api")


@api.before_request
def authenticate_request():
    if request.endpoint == "api.login":
        return
    authenticate()


def read_data(schema):
    data = request.get_json()
    if not isinstance(data, dict):
        abort(400, description="Provide a JSON object.")
    return schema.load(data)


@api.post("/login")
def login():
    """Authenticate an NGO user and return a JWT"""
    data = read_data(LoginSchema())
    user = db.session.scalar(select(User).where(User.username == data["username"]))
    if user is None or not check_password_hash(user.password_hash, data["password"]):
        abort(401, description="Invalid username or password.")
    return jsonify(token=create_token(user), user=UserSchema().dump(user)), 200


@api.get("/medicines")
def get_medicines():
    return jsonify(inventory())


@api.post("/medicines")
def add_medicine():
    """API to add medicine stock"""
    data = read_data(MedicineSchema())

    initial_stock = data.pop("initial_stock")
    party = data.pop("party")

    data["salt_ingredients"] = normalize_salt(data["salt_ingredients"])
    medicine = Medicine(**data)

    db.session.add(medicine)
    db.session.flush()

    if initial_stock:
        db.session.add(Transaction(medicine_id=medicine.id, transaction_type="RECEIVE", quantity=initial_stock, party=party))
    db.session.commit()

    return jsonify(medicine_details(medicine, initial_stock)), 201


@api.get("/transactions")
def get_transactions():
    """API for medicines transactions ordered by latest"""
    query = select(Transaction).order_by(Transaction.timestamp.desc(), Transaction.id.desc())

    medicine_id = request.args.get("medicine_id")
    if medicine_id is not None:
        try:
            medicine_id = int(medicine_id)
        except ValueError:
            abort(400, description="medicine_id must be an integer.")
        query = query.where(Transaction.medicine_id == medicine_id)

    return jsonify(TransactionSchema(many=True).dump(db.session.scalars(query).all()))


@api.post("/transactions")
def add_transaction():
    """API to add transactions into Database"""
    data = read_data(TransactionSchema())
    medicine = db.session.scalar(select(Medicine).where(Medicine.id == data["medicine_id"]).with_for_update())

    if medicine is None:
        abort(404, description="Medicine not found.")
    stock = current_stock(medicine.id)

    if data["transaction_type"] == "DISPENSE" and data["quantity"] > stock:
        abort(409, description="Dispense quantity exceeds current stock.")

    transaction = Transaction(**data)
    db.session.add(transaction)
    db.session.commit()
    result = TransactionSchema().dump(transaction)
    result["current_stock"] = current_stock(medicine.id)
    return jsonify(result), 201


@api.get("/vendors")
def get_vendors():
    return jsonify([vendor_details(vendor) for vendor in db.session.scalars(select(Vendor).order_by(Vendor.id)).all()])


@api.post("/vendors")
def add_vendor():
    """API to register an external medicine supplier"""
    data = read_data(VendorSchema())
    ingredients = sorted({normalize_salt(value) for value in data.pop("salt_ingredients")})
    vendor = Vendor(**data)

    for name in ingredients:
        salt = db.session.scalar(select(Salt).where(Salt.name == name))
        if salt is None:
            salt = Salt(name=name)
            db.session.add(salt)
        vendor.salts.append(salt)

    db.session.add(vendor)
    db.session.commit()
    return jsonify(vendor_details(vendor)), 201


@api.get("/users")
@require_roles("admin")
def get_users():
    return jsonify(UserSchema(many=True).dump(db.session.scalars(select(User).order_by(User.id)).all()))


@api.post("/users")
@require_roles("admin")
def add_user():
    """Admin-only API to create an NGO user account"""
    data = read_data(UserSchema())

    if db.session.scalar(select(User).where(User.username == data["username"])):
        abort(409, description="Username already exists.")
    if db.session.scalar(select(User).where(User.email == data["email"])):
        abort(409, description="Email already exists.")

    password = data.pop("password")
    user = User(password_hash=generate_password_hash(password), **data)
    db.session.add(user)
    db.session.commit()
    return jsonify(UserSchema().dump(user)), 201


@api.delete("/users/<int:user_id>")
@require_roles("admin")
def delete_user(user_id):
    """Admin-only API to remove a staff account"""
    user = db.session.get(User, user_id)
    if user is None:
        abort(404, description="User not found.")
    if user.role == "admin":
        abort(400, description="Cannot remove an admin account.")
    db.session.delete(user)
    db.session.commit()
    return jsonify(deleted=user_id), 200


@api.get("/alerts")
def get_alerts():
    return jsonify(low_stock_alerts())
