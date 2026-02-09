import boto3
from urllib.parse import urlparse

def read_file(file_path: str, aws_region: str = 'us-west-2') -> str:
    """
    Reads the content of a file from S3.

    Args:
        file_path (str): The S3 path to the file (e.g., s3://bucket/key).
        aws_region (str): The AWS region for S3 client. Defaults to 'us-west-2'.

    Returns:
        str: The content of the file.
    """
    parsed_url = urlparse(file_path)
    bucket_name = parsed_url.netloc
    key = parsed_url.path.lstrip('/')

    s3 = boto3.client('s3', region_name=aws_region)
    response = s3.get_object(Bucket=bucket_name, Key=key)
    return response['Body'].read().decode('utf-8')
