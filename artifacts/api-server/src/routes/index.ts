import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import adminRouter from "./admin";
import coursesRouter from "./courses";
import announcementsRouter from "./announcements";
import galleryRouter from "./gallery";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(adminRouter);
router.use(coursesRouter);
router.use(announcementsRouter);
router.use(galleryRouter);
router.use(storageRouter);

export default router;
