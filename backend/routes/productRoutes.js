const express = require("express");

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const authMiddleware =
    require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");

const router = express.Router();


// Create product
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createProduct
);


// Get all products
router.get(
    "/",
    authMiddleware,
    getProducts
);


// Get single product
router.get(
    "/:id",
    authMiddleware,
    getProductById
);


// Update product
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateProduct
);


// Delete product
router.delete(
    "/:id",
    authMiddleware,
    deleteProduct
);


module.exports = router;