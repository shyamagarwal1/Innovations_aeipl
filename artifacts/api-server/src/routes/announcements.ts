import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { announcementsTable } from "@workspace/db/schema";
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

const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

router.get("/admin/announcements", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const announcements = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json({ announcements });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch announcements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/announcements", async (req, res) => {
  try {
    const announcements = await db.select().from(announcementsTable)
      .where(eq(announcementsTable.isActive, true))
      .orderBy(desc(announcementsTable.createdAt));
    res.json({ announcements });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch public announcements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/announcements", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const parsed = announcementSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [row] = await db.insert(announcementsTable).values(parsed.data).returning();
    res.status(201).json({ announcement: row });
  } catch (err) {
    req.log.error({ err }, "Failed to create announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/announcements/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = parseInt(req.params.id);
  try {
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/announcements/:id/toggle", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = parseInt(req.params.id);
  try {
    const [existing] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, id));
    if (!existing) { res.status(404).json({ error: "Not found" }); return; }
    const [row] = await db.update(announcementsTable)
      .set({ isActive: !existing.isActive })
      .where(eq(announcementsTable.id, id))
      .returning();
    res.json({ announcement: row });
  } catch (err) {
    req.log.error({ err }, "Failed to toggle announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
