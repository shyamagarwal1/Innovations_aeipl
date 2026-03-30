import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { contactSubmissionsTable } from "@workspace/db/schema";
import { z } from "zod";

const router: IRouter = Router();

const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),
  college: z.string().min(2),
  projectType: z.string().min(1),
  serviceType: z.enum(["project_only", "project_internship", "internship_only"]),
  message: z.string().optional(),
});

router.post("/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;

  try {
    const [row] = await db
      .insert(contactSubmissionsTable)
      .values({
        name: data.name,
        phone: data.phone,
        email: data.email,
        college: data.college,
        projectType: data.projectType,
        serviceType: data.serviceType,
        message: data.message ?? null,
      })
      .returning({ id: contactSubmissionsTable.id });

    res.status(201).json({ success: true, message: "Enquiry received!", id: row.id });
  } catch (err) {
    req.log.error({ err }, "Failed to save contact submission");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
