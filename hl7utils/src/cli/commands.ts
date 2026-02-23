import { createReadStream, createWriteStream } from "node:fs";
import { PassThrough } from "node:stream";
import { pipeline } from "node:stream/promises";
import chalk from "chalk";
import {
  Base64,
  getDecryptStream,
  getEncryptStream,
} from "../lib/encryption.ts";
import { getS3Stream, uploadS3Stream } from "../lib/s3.ts";

async function getInputStream(path: string) {
  if (path.startsWith("s3://")) {
    return getS3Stream(path);
  }
  return createReadStream(path);
}

// Helper to handle output: either stream to S3 or write to file/stdout
// Since uploadS3Stream consumes the stream, we can't return a Writable for S3 in the same way.
// So we handle the pipeline execution differently depending on output.

async function processPipeline(
  // biome-ignore lint/suspicious/noExplicitAny: stream
  inputStream: any,
  // biome-ignore lint/suspicious/noExplicitAny: stream
  transforms: any[],
  outputPath?: string,
) {
  let currentStream = inputStream;
  for (const transform of transforms) {
    currentStream = currentStream.pipe(transform);
  }

  if (outputPath?.startsWith("s3://")) {
    console.log(chalk.blue(`Uploading to S3: ${outputPath}`));
    await uploadS3Stream(outputPath, currentStream);
  } else {
    const outputStream = outputPath
      ? createWriteStream(outputPath)
      : process.stdout;
    if (outputPath) console.log(chalk.blue(`Writing to file: ${outputPath}`));

    await pipeline(currentStream, outputStream);
  }
}

export async function encryptCommand(options: {
  inputPath: string;
  outputPath?: string;
}) {
  const keyAlias = process.env.KMS_KEY_ALIAS;
  if (!keyAlias) {
    console.error(
      chalk.red("Error: KMS_KEY_ALIAS environment variable is required."),
    );
    process.exit(1);
  }

  console.log(chalk.green(`Encrypting ${options.inputPath}...`));

  try {
    const inputStream = await getInputStream(options.inputPath);
    const encryptStream = getEncryptStream(keyAlias);
    encryptStream.setEncoding("base64");

    // AWS SDK Upload expects Buffers/Uint8Arrays, not strings.
    // Piping through a PassThrough stream converts the string chunks back to Buffer chunks (containing the base64 string).
    const bufferStream = new PassThrough();

    await processPipeline(
      inputStream,
      [encryptStream, bufferStream],
      options.outputPath,
    );

    console.log(chalk.green("Encryption complete."));
  } catch (error: unknown) {
    console.error(chalk.red("Encryption failed:"), (error as Error).message);
    process.exit(1);
  }
}

export async function decryptCommand(options: {
  inputPath: string;
  outputPath?: string;
}) {
  console.log(chalk.green(`Decrypting ${options.inputPath}...`));

  try {
    const inputStream = await getInputStream(options.inputPath);
    const base64DecodeStream = new Base64.Decode();
    const decryptStream = getDecryptStream();

    await processPipeline(
      inputStream,
      [base64DecodeStream, decryptStream],
      options.outputPath,
    );

    console.log(chalk.green("Decryption complete."));
  } catch (error: unknown) {
    console.error(chalk.red("Decryption failed:"), (error as Error).message);
    process.exit(1);
  }
}
