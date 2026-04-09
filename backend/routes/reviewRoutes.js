import express from "express";
import Review from "../models/Review.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({ reviews, avgRating: Number(avgRating), total: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a review (must be logged in)
router.post("/:productId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const existing = await Review.findOne({
      productId: req.params.productId,
      userId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({
      productId: req.params.productId,
      userId: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE a review (own review only)
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;