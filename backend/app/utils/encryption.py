from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad
import base64

class EncryptionService:
    """Service for AES-256 encryption/decryption"""

    def __init__(self, key):
        """
        Initialize encryption service with a key
        Key should be 32 bytes for AES-256
        """
        if isinstance(key, str):
            # Ensure key is exactly 32 bytes
            key = key.encode('utf-8')
            if len(key) < 32:
                key = key.ljust(32, b'\0')
            elif len(key) > 32:
                key = key[:32]
        self.key = key

    def encrypt(self, plaintext):
        """
        Encrypt plaintext using AES-256-CBC
        Returns base64 encoded string: iv + ciphertext
        """
        if isinstance(plaintext, (int, float)):
            plaintext = str(plaintext)

        if isinstance(plaintext, str):
            plaintext = plaintext.encode('utf-8')

        # Generate random IV
        iv = get_random_bytes(AES.block_size)

        # Create cipher
        cipher = AES.new(self.key, AES.MODE_CBC, iv)

        # Pad and encrypt
        padded_data = pad(plaintext, AES.block_size)
        ciphertext = cipher.encrypt(padded_data)

        # Combine IV and ciphertext, then encode to base64
        encrypted_data = iv + ciphertext
        return base64.b64encode(encrypted_data).decode('utf-8')

    def decrypt(self, encrypted_data):
        """
        Decrypt encrypted data
        Input should be base64 encoded string
        Returns decrypted plaintext as string
        """
        try:
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_data)

            # Extract IV and ciphertext
            iv = encrypted_bytes[:AES.block_size]
            ciphertext = encrypted_bytes[AES.block_size:]

            # Create cipher
            cipher = AES.new(self.key, AES.MODE_CBC, iv)

            # Decrypt and unpad
            padded_plaintext = cipher.decrypt(ciphertext)
            plaintext = unpad(padded_plaintext, AES.block_size)

            return plaintext.decode('utf-8')
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")
