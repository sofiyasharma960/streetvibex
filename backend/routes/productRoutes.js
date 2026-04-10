import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only
router.post("/", protect, protectAdmin, createProduct);
router.put("/:id", protect, protectAdmin, updateProduct);
router.delete("/:id", protect, protectAdmin, deleteProduct);

export default router;