import jwt
from functools import wraps
from flask import abort, current_app, g, request


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
