import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { coursesTable } from "@workspace/db/schema";
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

const courseSchema = z.object({
  title: z.string().min(1),
  domain: z.string().min(1),
  duration: z.string().min(1),
  fee: z.string().min(1),
  description: z.string().min(1),
  highlights: z.string().default(""),
  imageUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

router.get("/admin/courses", async (req, res) => {
  if (!checkAuth(req, res)) return;
  try {
    const courses = await db.select().from(coursesTable).orderBy(desc(coursesTable.createdAt));
    res.json({ courses });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch courses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/courses", async (req, res) => {
  try {
    const courses = await db.select().from(coursesTable)
      .where(eq(coursesTable.isActive, true))
      .orderBy(desc(coursesTable.createdAt));
    res.json({ courses });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch public courses");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/courses", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [row] = await db.insert(coursesTable).values(parsed.data).returning();
    res.status(201).json({ course: row });
  } catch (err) {
    req.log.error({ err }, "Failed to create course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/courses/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = parseInt(req.params.id);
  const parsed = courseSchema.partial().safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const [row] = await db.update(coursesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(coursesTable.id, id))
      .returning();
    if (!row) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ course: row });
  } catch (err) {
    req.log.error({ err }, "Failed to update course");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/courses/:id", async (req, res) => {
  if (!checkAuth(req, res)) return;
  const id = parseInt(req.params.id);
  try {
    await db.delete(coursesTable).where(eq(coursesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Failed to delete course");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
