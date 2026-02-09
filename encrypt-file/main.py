import os
import click
from dotenv import load_dotenv
from utils.file_reader import read_file
from utils.encryption import encrypt_text, decrypt_text

# Load environment variables
load_dotenv()

@click.group()
def cli():
    """
    AWS KMS Encryption/Decryption Utility.
    """
    pass

@cli.command()
@click.argument('input_file')
def encrypt(input_file):
    """
    Encrypts a file from S3 using AWS KMS.

    INPUT_FILE: The S3 path to the file to encrypt (e.g., s3://bucket/key).
    """
    key_alias = os.getenv('AWS_KEY_ALIAS')
    region_name = os.getenv('AWS_REGION_NAME', 'us-west-2')

    if not key_alias:
        click.echo("Error: AWS_KEY_ALIAS environment variable not set.", err=True)
        return

    try:
        # click.echo(f"Reading file from {input_file}...")
        file_content = read_file(input_file, aws_region=region_name)

        # click.echo("Encrypting file content...")
        encrypted_content = encrypt_text(key_alias, file_content, region_name=region_name)

        # click.echo("Encrypted Content:")
        click.echo(encrypted_content)

    except Exception as e:
        click.echo(f"An error occurred: {e}", err=True)

@cli.command()
@click.argument('input_file')
def decrypt(input_file):
    """
    Decrypts a file from S3 using AWS KMS.

    INPUT_FILE: The S3 path to the file to decrypt (e.g., s3://bucket/key).
    """
    region_name = os.getenv('AWS_REGION_NAME', 'us-west-2')

    try:
        # click.echo(f"Reading file from {input_file}...")
        file_content = read_file(input_file, aws_region=region_name)

        # click.echo("Decrypting file content...")
        decrypted_content = decrypt_text(file_content, region_name=region_name)

        # click.echo("Decrypted Content:")
        click.echo(decrypted_content)

    except Exception as e:
        click.echo(f"An error occurred: {e}", err=True)

if __name__ == "__main__":
    cli()
