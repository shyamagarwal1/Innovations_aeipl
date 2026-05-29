import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { LocalFileStorage } from "../lib/localFileStorage";

const router: IRouter = Router();
const useLocalStorage = process.env.USE_LOCAL_STORAGE === "true";
const objectStorageService = useLocalStorage ? null : new ObjectStorageService();
const localFileStorage = useLocalStorage ? new LocalFileStorage() : null;

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
});

router.post("/storage/upload", async (req: Request, res: Response) => {
  const contentType = ((req.headers["content-type"] ?? "application/octet-stream").split(";")[0]).trim();
  try {
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      req.on("end", resolve);
      req.on("error", reject);
    });
    const buffer = Buffer.concat(chunks);
    req.log.info({ contentType, sizeBytes: buffer.length }, "Upload received");

    let objectPath: string;
    if (localFileStorage) {
      objectPath = await localFileStorage.uploadBuffer(buffer, contentType);
    } else {
      objectPath = await objectStorageService!.uploadBuffer(buffer, contentType);
    }

    req.log.info({ objectPath }, "Upload saved successfully");
    res.json({ objectPath, url: `/api/storage${objectPath}` });
  } catch (error) {
    req.log.error({ err: error }, "Error uploading object");
    res.status(500).json({ error: "Failed to upload file" });
  }
});

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  if (localFileStorage) {
    res.status(400).json({ error: "Presigned URLs not supported in local storage mode" });
    return;
  }
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }
  try {
    const { name, size, contentType } = parsed.data;
    const uploadURL = await objectStorageService!.getObjectEntityUploadURL();
    const objectPath = objectStorageService!.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  if (localFileStorage) {
    res.status(404).json({ error: "Public object search not supported in local storage mode" });
    return;
  }
  try {
    const raw = (req.params as any).filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : (raw as string);
    const file = await objectStorageService!.searchPublicObject(filePath);
    if (!file) { res.status(404).json({ error: "Object not found" }); return; }
    const response = await objectStorageService!.downloadObject(file);
    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");
    Readable.fromWeb(response.body as any).pipe(res);
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

router.get("/storage/objects/*objectPath", async (req: Request, res: Response) => {
  try {
    const rawParam = (req.params as any).objectPath;
    const paramStr = Array.isArray(rawParam) ? rawParam.join("/") : (rawParam as string);
    const objectPath = `/objects/${paramStr}`;

    if (localFileStorage) {
      const filePath = localFileStorage.getFilePath(objectPath);
      if (!filePath) { res.status(404).json({ error: "Object not found" }); return; }
      const contentType = localFileStorage.getContentType(objectPath);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      localFileStorage.createReadStream(filePath).pipe(res);
      return;
    }

    const file = await objectStorageService!.getObjectEntityFile(objectPath);
    const response = await objectStorageService!.downloadObject(file);
    res.setHeader("Content-Type", response.headers.get("Content-Type") ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=86400");
    Readable.fromWeb(response.body as any).pipe(res);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) { res.status(404).json({ error: "Object not found" }); return; }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
