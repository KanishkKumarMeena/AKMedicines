from marshmallow import Schema, fields, validate, ValidationError

from models import normalize_salt


def nonblank(value):
    if not value.strip():
        raise ValidationError("Must not be blank.")


def valid_salt(value):
    if not normalize_salt(value):
        raise ValidationError("Provide at least one salt ingredient.")


def valid_phone(value):
    if len("".join(character for character in value if character.isdigit())) < 4:
        raise ValidationError("Provide a phone number with at least four digits.")


class MedicineSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=[nonblank, validate.Length(max=150)])
    category = fields.String(required=True, validate=[nonblank, validate.Length(max=100)])
    salt_ingredients = fields.String(required=True, validate=[valid_salt, validate.Length(max=250)])
    min_threshold = fields.Integer(load_default=25, strict=True, validate=validate.Range(min=0))
    initial_stock = fields.Integer(load_default=0, strict=True, load_only=True, validate=validate.Range(min=0))
    party = fields.String(load_default="Initial stock", load_only=True, validate=[nonblank, validate.Length(max=150)])


class TransactionSchema(Schema):
    id = fields.Integer(dump_only=True)
    medicine_id = fields.Integer(required=True, strict=True, validate=validate.Range(min=1))
    transaction_type = fields.String(required=True, validate=validate.OneOf(["RECEIVE", "DISPENSE"]))
    quantity = fields.Integer(required=True, strict=True, validate=validate.Range(min=1))
    party = fields.String(required=True, validate=[nonblank, validate.Length(max=150)])
    timestamp = fields.DateTime(dump_only=True)


class VendorSchema(Schema):
    id = fields.Integer(dump_only=True)
    vendor_id = fields.String(dump_only=True)
    name = fields.String(required=True, validate=[nonblank, validate.Length(max=150)])
    email = fields.Email(required=True, validate=validate.Length(max=254))
    phone = fields.String(required=True, validate=[valid_phone, validate.Length(max=30)])
    salt_ingredients = fields.List(fields.String(validate=[valid_salt, validate.Length(max=250)]), required=True, validate=validate.Length(min=1), load_only=True)


class UserSchema(Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True, validate=[nonblank, validate.Length(max=150)])
    username = fields.String(required=True, validate=[nonblank, validate.Length(max=50)])
    email = fields.Email(required=True, validate=validate.Length(max=254))
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8, max=128))
    vendor_id = fields.String(required=True, validate=validate.Length(max=13))
    role = fields.String(dump_only=True)
