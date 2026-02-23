import { resolve } from "node:path";
import { Command } from "commander";
import { config } from "dotenv";
import { decryptCommand, encryptCommand } from "./commands.ts"; // Note the .ts extension

// Load .env.local if present
config({ path: resolve(process.cwd(), ".env.local") });

// Also load .env as fallback
config();

const program = new Command();

program
  .name("hl7utils")
  .description("CLI to encrypt/decrypt files using AWS KMS and S3")
  .version("1.0.0");

program
  .command("encrypt")
  .description("Encrypt a file (S3 or local) and save to S3 or local/stdout")
  .requiredOption("--input-path <path>", "Input path (s3://... or local file)")
  .option(
    "--output-path <path>",
    "Output path (s3://... or local file). Defaults to stdout.",
  )
  .action(encryptCommand);

program
  .command("decrypt")
  .description("Decrypt a file (S3 or local) and save to S3 or local/stdout")
  .requiredOption("--input-path <path>", "Input path (s3://... or local file)")
  .option(
    "--output-path <path>",
    "Output path (s3://... or local file). Defaults to stdout.",
  )
  .action(decryptCommand);

program.parse();
