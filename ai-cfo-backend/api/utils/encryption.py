import os
from cryptography.fernet import Fernet
import json

def get_fernet():
    key = os.getenv("ENCRYPTION_KEY", "")
    if not key:
        raise ValueError("ENCRYPTION_KEY is not set in environment.")
    return Fernet(key.encode('utf-8'))

def encrypt_dict(data_dict: dict) -> bytes:
    """Encrypts a dictionary to AES-256 Fernet bytes."""
    f = get_fernet()
    json_data = json.dumps(data_dict).encode('utf-8')
    return f.encrypt(json_data)

def decrypt_dict(encrypted_data: bytes) -> dict:
    """Decrypts AES-256 Fernet bytes back to a dictionary."""
    f = get_fernet()
    decrypted_json = f.decrypt(encrypted_data).decode('utf-8')
    return json.loads(decrypted_json)
