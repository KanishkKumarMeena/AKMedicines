from marshmallow import Schema, fields, validate, ValidationError

from models import normalize_salt


def nonblank(value):
    if not value.strip():
        raise ValidationError("Must not be blank.")


def valid_salt(value):
    if not normalize_salt(value):
        raise ValidationError("Provide at least one salt ingredient.")


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
    name = fields.String(required=True, validate=[nonblank, validate.Length(max=150)])
    email = fields.Email(required=True, validate=validate.Length(max=254))
    phone = fields.String(allow_none=True, validate=validate.Length(max=30))
    salt_ingredients = fields.List(fields.String(validate=[valid_salt, validate.Length(max=250)]), required=True, validate=validate.Length(min=1), load_only=True)
