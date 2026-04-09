import Product from "../models/Product.js";

// @desc    Get all products that are actually in stock
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    // FIX: Instead of looking for inStock: true, 
    // we look for products where countInStock is greater than 0
    const products = await Product.find({ countInStock: { $gt: 0 } });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    // We spread the body and ensure countInStock has a value
    const product = new Product({
      ...req.body,
      countInStock: req.body.countInStock || 10 // Default to 10 if not provided
    });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};