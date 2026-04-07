import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Upload a File to either Vercel Blob (production) or local uploads/ dir (dev fallback).
 *
 * - In production set BLOB_READ_WRITE_TOKEN in Vercel env vars to enable Blob storage.
 * - In dev, if the token is missing we write to ./uploads which works on a normal filesystem.
 *
 * Returns a URL or relative path that can be stored in the database.
 */
export async function uploadFile(file: File, key: string): Promise<string> {
  // Sanitize key to avoid path traversal or weird chars
  const safeKey = key.replace(/[^\w./\-]/g, "_");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(safeKey, file, {
      access: "public",
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // Local filesystem fallback (dev / non-Vercel hosts)
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const fullPath = path.join(uploadsRoot, safeKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));
  return `/${path.posix.join("uploads", safeKey)}`;
}
