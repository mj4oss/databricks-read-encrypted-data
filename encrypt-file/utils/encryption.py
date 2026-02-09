import base64
import boto3

def encrypt_text(key_alias: str, plain_text: str, region_name: str = 'us-west-2') -> str:
    """
    Encrypts text using AWS KMS key alias.

    Args:
        key_alias (str): The AWS KMS key alias or key ID.
        plain_text (str): The text to encrypt.
        region_name (str): The AWS region name. Defaults to 'us-west-2'.

    Returns:
        str: Base64 encoded encrypted text.
    """
    client = boto3.client('kms', region_name=region_name)
    response = client.encrypt(
        KeyId=key_alias,
        Plaintext=plain_text.encode('utf-8')
    )
    ciphertext_blob = response['CiphertextBlob']
    return base64.b64encode(ciphertext_blob).decode('utf-8')

def decrypt_text(encrypted_text_base64: str, region_name: str = 'us-west-2') -> str:
    """
    Decrypts text using AWS KMS.

    Args:
        encrypted_text_base64 (str): The base64 encoded encrypted text.
        region_name (str): The AWS region name. Defaults to 'us-west-2'.

    Returns:
        str: Decrypted plaintext.
    """
    client = boto3.client('kms', region_name=region_name)
    ciphertext_blob = base64.b64decode(encrypted_text_base64)
    response = client.decrypt(
        CiphertextBlob=ciphertext_blob
    )
    return response['Plaintext'].decode('utf-8')
