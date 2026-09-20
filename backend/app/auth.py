import base64
import hashlib
import hmac
import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

DB_PATH = Path(os.getenv("THERMO_DB_PATH", Path(__file__).resolve().parents[2] / "thermo_shelter.db"))
AUTH_SECRET = os.getenv("AUTH_SECRET", "dev-only-change-this-secret")
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

_bearer = HTTPBearer(auto_error=False)


def _db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with _db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at INTEGER NOT NULL
            )
            """
        )
        try:
            conn.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'")
        except sqlite3.OperationalError:
            pass

        # Seed pre-configured Admin & User accounts
        default_accounts = [
            ("Station Admin", "admin@thermoshelter.com", "admin123", "admin"),
            ("Field Researcher", "user@thermoshelter.com", "user123", "user"),
        ]
        for name, email, pwd, role in default_accounts:
            existing = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
            if not existing:
                conn.execute(
                    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                    (name, email, _hash_password(pwd), role, int(time.time())),
                )
        conn.commit()


def _hash_password(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=2**14,
        r=8,
        p=1,
    )
    return f"{salt.hex()}${digest.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=2**14,
            r=8,
            p=1,
        )
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _b64(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def create_token(user_id: int, email: str) -> str:
    header = _b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64(
        json.dumps(
            {
                "sub": str(user_id),
                "email": email,
                "exp": int(time.time()) + TOKEN_TTL_SECONDS,
            },
            separators=(",", ":"),
        ).encode()
    )
    message = f"{header}.{payload}".encode()
    signature = _b64(hmac.new(AUTH_SECRET.encode(), message, hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def verify_token(token: str) -> dict:
    try:
        header, payload, signature = token.split(".")
        message = f"{header}.{payload}".encode()
        expected = _b64(hmac.new(AUTH_SECRET.encode(), message, hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            raise ValueError("Invalid signature")
        data = json.loads(_unb64(payload))
        if int(data["exp"]) < int(time.time()):
            raise ValueError("Token expired")
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        ) from exc


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    payload = verify_token(credentials.credentials)
    user_id = int(payload["sub"])

    with _db() as conn:
        row = conn.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists.",
        )

    return dict(row)


def register_user(name: str, email: str, password: str):
    normalized_email = email.strip().lower()

    with _db() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()

        if existing:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists.",
            )

        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (
                name.strip(),
                normalized_email,
                _hash_password(password),
                int(time.time()),
            ),
        )
        conn.commit()
        user_id = int(cursor.lastrowid)

    return {
        "id": user_id,
        "name": name.strip(),
        "email": normalized_email,
    }


def authenticate_user(email: str, password: str):
    normalized_email = email.strip().lower()

    with _db() as conn:
        row = conn.execute(
            "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
            (normalized_email,),
        ).fetchone()

    if not row or not _verify_password(password, row["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    return {
        "id": int(row["id"]),
        "name": row["name"],
        "email": row["email"],
        "created_at": int(row["created_at"]),
    }


def quick_login(role: str):
    target_role = "admin" if role.lower() == "admin" else "user"
    email = "admin@thermoshelter.com" if target_role == "admin" else "user@thermoshelter.com"

    init_db()

    with _db() as conn:
        row = conn.execute(
            "SELECT id, name, email, role, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preset account for {target_role} could not be found.",
        )

    user = dict(row)
    token = create_token(user["id"], user["email"])
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }
