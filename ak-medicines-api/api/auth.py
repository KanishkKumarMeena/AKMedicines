from datetime import datetime, timedelta, timezone
from functools import wraps
import jwt
from flask import abort, current_app, g, request


def create_token(user):
    secret = current_app.config["JWT_SECRET"]
    if not secret:
        abort(500, description="JWT authentication is not configured.")
    expires_at = datetime.now(timezone.utc) + timedelta(hours=current_app.config.get("JWT_EXP_HOURS", 24))
    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": int(expires_at.timestamp()),
        "iss": current_app.config["JWT_ISSUER"],
        "aud": current_app.config["JWT_AUDIENCE"],
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def authenticate():
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        abort(401, description="Authentication required.")

    secret = current_app.config["JWT_SECRET"]
    if not secret:
        abort(500, description="JWT authentication is not configured.")

    try:
        claims = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            issuer=current_app.config["JWT_ISSUER"],
            audience=current_app.config["JWT_AUDIENCE"],
            options={"require": ["sub", "exp"]},
        )
    except jwt.PyJWTError:
        abort(401, description="Invalid or expired authentication token.")

    g.current_user = claims["sub"]
    g.current_user_role = claims.get("role")


def require_roles(*roles):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if g.current_user_role not in roles:
                abort(403, description="Insufficient permissions.")
            return view(*args, **kwargs)

        return wrapped

    return decorator
