# hl7utils Walkthrough

The `hl7utils` project provides a CLI and library for encrypting and decrypting files using AWS KMS and the AWS Encryption SDK. It is designed to handle large files via streaming and supports S3 integration natively.

## Prerequisites
- Node.js 25 (managed via `nvm` and `.nvmrc`)
- AWS Credentials configured in your environment

## Installation
```bash
cd hl7utils
npm install
```

## Usage

The CLI is available via `npm start`.

### Check Help
```bash
npm start -- --help
```

### Encryption
Encrypts a file (local or S3), base64 encodes it, and writes to output (local or S3).
**Requirement**: `KMS_KEY_ALIAS` environment variable.

```bash
export KMS_KEY_ALIAS=alias/my-key
npm start -- encrypt --input-path s3://my-bucket/data.txt --output-path s3://my-bucket/data.enc
```

### Decryption
Reads an encrypted (and base64 encoded) file, decrypts it, and writes to output.

```bash
npm start -- decrypt --input-path s3://my-bucket/data.enc --output-path ./data.txt
```

## Development

- **Linting**: `npm run lint` (Biome)
- **Formatting**: `npm run format` (Biome)
- **Type Check**: `npm run check-types` (TypeScript)
- **Test**: `npm test` (Vitest)

## Key Features
- **Streaming**: Fully streaming architecture for low memory usage with large files.
- **S3 Support**: Reads and writes directly to/from S3 using `s3://` URIs.
- **Security**: Uses AWS Encryption SDK for envelope encryption and key rotation support.
- **Interoperability**: The encrypted format (AWS Encryption SDK Message Format) is compatible with other AWS Encryption SDK clients (e.g., Python, which is useful for PySpark UDFs). Base64 encoding is applied on top of the binary ciphertext.
