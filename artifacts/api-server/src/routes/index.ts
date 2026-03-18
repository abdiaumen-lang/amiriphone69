import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import productsRouter from "./products.js";
import categoriesRouter from "./categories.js";
import ordersRouter from "./orders.js";
import wilayasRouter from "./wilayas.js";
import reviewsRouter from "./reviews.js";
import adminRouter from "./admin.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/orders", ordersRouter);
router.use("/wilayas", wilayasRouter);
router.use("/reviews", reviewsRouter);
router.use("/admin", adminRouter);
router.use("/settings", settingsRouter);

export default router;
