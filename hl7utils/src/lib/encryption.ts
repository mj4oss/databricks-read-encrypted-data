import { type Duplex, Transform } from "node:stream";
import {
  CommitmentPolicy,
  KmsKeyringNode,
  buildClient,
} from "@aws-crypto/client-node";

const { encryptStream, decryptStream: awsDecryptStream } = buildClient({
  commitmentPolicy: CommitmentPolicy.REQUIRE_ENCRYPT_REQUIRE_DECRYPT,
  maxEncryptedDataKeys: 5,
});

class Base64Decode extends Transform {
  private extra = "";

  // biome-ignore lint/suspicious/noExplicitAny: Stream chunks can be any type
  _transform(chunk: any, encoding: BufferEncoding, callback: any) {
    let data = chunk.toString();
    if (this.extra) {
      data = this.extra + data;
      this.extra = "";
    }

    const len = data.length;

    const extraLen = len % 4;
    if (extraLen !== 0) {
      this.extra = data.slice(len - extraLen);
      data = data.slice(0, len - extraLen);
    }

    if (data.length > 0) {
      this.push(Buffer.from(data, "base64"));
    }
    callback();
  }

  // biome-ignore lint/suspicious/noExplicitAny: Callback signature uses any
  _flush(callback: any) {
    if (this.extra) {
      this.push(Buffer.from(this.extra, "base64"));
    }
    callback();
  }
}

export function getEncryptStream(keyAlias: string): Duplex {
  const keyring = new KmsKeyringNode({ generatorKeyId: keyAlias });
  return encryptStream(keyring);
}

export function getDecryptStream(): Duplex {
  const keyring = new KmsKeyringNode({ discovery: true });
  return awsDecryptStream(keyring);
}

export const Base64 = {
  Decode: Base64Decode,
};
