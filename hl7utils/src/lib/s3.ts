import type { Readable } from "node:stream";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const s3Client = new S3Client({});

interface S3Uri {
  bucket: string;
  key: string;
}

export function parseS3Uri(uri: string): S3Uri {
  if (!uri.startsWith("s3://")) {
    throw new Error(`Invalid S3 URI: ${uri}. Must start with s3://`);
  }
  const parts = uri.slice(5).split("/");
  const bucket = parts[0];
  const key = parts.slice(1).join("/");

  if (!bucket || !key) {
    throw new Error(`Invalid S3 URI format: ${uri}. Expected s3://bucket/key`);
  }

  return { bucket, key };
}

export async function getS3Stream(uri: string): Promise<Readable> {
  const { bucket, key } = parseS3Uri(uri);
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error(`Empty body for object: ${uri}`);
  }

  // AWS SDK V3 returns a generic stream type, cast to Node stream
  return response.Body as unknown as Readable;
}

export async function uploadS3Stream(
  uri: string,
  stream: Readable,
): Promise<void> {
  const { bucket, key } = parseS3Uri(uri);
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: stream,
    },
  });

  await upload.done();
}
