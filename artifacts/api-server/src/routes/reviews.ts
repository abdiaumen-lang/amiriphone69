import { Router } from "express";
import { db } from "@workspace/db";
import { reviewsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateReviewBody, ListReviewsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const query = ListReviewsQueryParams.parse(req.query);
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.productId, query.productId))
      .orderBy(reviewsTable.createdAt);

    res.json(reviews);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = CreateReviewBody.parse(req.body);
    const [review] = await db.insert(reviewsTable).values({
      ...body,
      verified: false,
    }).returning();
    res.status(201).json(review);
  } catch (err: any) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
});

export default router;
