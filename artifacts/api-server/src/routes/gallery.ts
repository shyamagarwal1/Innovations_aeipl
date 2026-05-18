import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { galleryTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function checkAuth(req: any, res: any): boolean {
  const password = req.query.password ?? req.headers["x-admin-password"];
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

const gallerySchema = z.object({
  title: z.string().min(1),
  category: z.enum(["projects", "events"]),
  imageUrl: z.string().min(1),
});

router.get("/admin/gallery", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const items = await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));
    res.json({ gallery: items });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch gallery");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/gallery", async (req, res) => {
  try {
    const items = await db.select().from(galleryTable).orderBy(desc(galleryTable.createdAt));
    res.json({ gallery: items });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch public gallery");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/gallery", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const parsed = gallerySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [row] = await db.insert(galleryTable).values(parsed.data).returning();
    res.status(201).json({ item: row });
  } catch (err) {
    req.log.error({ err }, "Failed to add gallery item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/gallery/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = parseInt(req.params.id);
  try {
    await db.delete(galleryTable).where(eq(galleryTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete gallery item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
