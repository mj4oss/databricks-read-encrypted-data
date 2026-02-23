import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import { Base64 } from "./encryption.ts";

describe("Encryption Utils", () => {
  describe("Base64 Streams", () => {
    it("should decode base64 to binary", async () => {
      const original = "Hello World";
      const input = Buffer.from(original).toString("base64");
      const decoder = new Base64.Decode();

      const chunks: Buffer[] = [];
      decoder.on("data", (chunk) => chunks.push(chunk));

      return new Promise<void>((resolve, reject) => {
        decoder.on("end", () => {
          const result = Buffer.concat(chunks).toString();
          expect(result).toBe(original);
          resolve();
        });
        decoder.on("error", reject);
        decoder.write(input);
        decoder.end();
      });
    });
  });
});
