import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "aeipl@admin2024";

router.get("/admin/submissions", async (req, res) => {
  const { password } = req.query;

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const submissions = await db
      .select()
      .from(contactSubmissionsTable)
      .orderBy(desc(contactSubmissionsTable.createdAt));

    res.json({ submissions, total: submissions.length });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch submissions");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
