import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const RequestUploadUrlBody = z.object({
  name: z.string(),
  size: z.number(),
  contentType: z.string(),
});

router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }
  try {
    const { name, size, contentType } = parsed.data;
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
    res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
});

router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const filePath = (req.params as any).filePath as string;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) { res.status(404).json({ error: "Object not found" }); return; }
    const response = await objectStorageService.downloadObject(file);
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
    const objectPath = `/objects/${(req.params as any).objectPath}`;
    const file = await objectStorageService.getObjectEntityFile(objectPath);
    const response = await objectStorageService.downloadObject(file);
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
