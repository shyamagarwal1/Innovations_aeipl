import { createReadStream, existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import { Readable } from "stream";

function getUploadsDir(): string {
  const dir = process.env.LOCAL_UPLOADS_DIR || path.resolve(process.cwd(), "local_uploads");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export class LocalFileStorage {
  async uploadBuffer(buffer: Buffer, contentType: string): Promise<string> {
    const objectId = randomUUID();
    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, objectId);
    await writeFile(filePath, buffer);

    const metaPath = `${filePath}.meta`;
    await writeFile(metaPath, JSON.stringify({ contentType }));

    return `/objects/uploads/${objectId}`;
  }

  getFilePath(objectPath: string): string | null {
    if (!objectPath.startsWith("/objects/uploads/")) return null;
    const objectId = objectPath.replace("/objects/uploads/", "");
    if (!objectId || objectId.includes("/") || objectId.includes("..")) return null;

    const uploadsDir = getUploadsDir();
    const filePath = path.join(uploadsDir, objectId);
    return existsSync(filePath) ? filePath : null;
  }

  getContentType(objectPath: string): string {
    if (!objectPath.startsWith("/objects/uploads/")) return "application/octet-stream";
    const objectId = objectPath.replace("/objects/uploads/", "");
    const uploadsDir = getUploadsDir();
    const metaPath = path.join(uploadsDir, `${objectId}.meta`);
    if (existsSync(metaPath)) {
      try {
        const meta = JSON.parse(require("fs").readFileSync(metaPath, "utf8"));
        return meta.contentType || "application/octet-stream";
      } catch {
        return "application/octet-stream";
      }
    }
    return "application/octet-stream";
  }

  createReadStream(filePath: string): Readable {
    return createReadStream(filePath);
  }
}
