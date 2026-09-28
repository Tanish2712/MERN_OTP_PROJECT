const fs = require("fs");
const path = require("path");

const Product = require("../models/Product");


// ==========================================
// CREATE PRODUCT
// ==========================================

const createProduct = async (req, res) => {

    try {

        const {
            name,
            description,
            price,
            stock,
            category
        } = req.body;


        // Validation
        if (
            !name ||
            !description ||
            price === undefined ||
            stock === undefined ||
            !category
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, description, price, stock and category are required"
            });

        }


        // Image required
        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: "Product image is required"
            });

        }


        // Image path
        const imagePath =
            `/uploads/products/${req.file.filename}`;


        // Create product
        const product =
            await Product.create({

                name: name.trim(),

                description:
                    description.trim(),

                price: Number(price),

                stock: Number(stock),

                category:
                    category.trim(),

                image: imagePath,

                createdBy:
                    req.user._id

            });


        return res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            data: {
                product
            }

        });

    } catch (error) {

        console.error(
            "Create product error:",
            error
        );


        // Delete uploaded image
        // if database creation fails
        if (req.file) {

            const filePath =
                path.join(
                    __dirname,
                    "../uploads/products",
                    req.file.filename
                );

            if (
                fs.existsSync(filePath)
            ) {

                fs.unlinkSync(filePath);

            }

        }


        return res.status(500).json({

            success: false,

            message:
                "Failed to create product"

        });

    }

};


// ==========================================
// GET ALL PRODUCTS
// ==========================================

const getProducts = async (
    req,
    res
) => {

    try {

        const products =
            await Product.find()
                .populate(
                    "createdBy",
                    "name email"
                )
                .sort({
                    createdAt: -1
                });


        return res.status(200).json({

            success: true,

            message:
                "Products fetched successfully",

            count: products.length,

            data: {
                products
            }

        });

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch products"

        });

    }

};


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

const getProductById = async (
    req,
    res
) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            ).populate(
                "createdBy",
                "name email"
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        return res.status(200).json({

            success: true,

            data: {
                product
            }

        });

    } catch (error) {

        console.error(
            "Get product error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch product"

        });

    }

};


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProduct = async (
    req,
    res
) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            // Remove newly uploaded image
            if (req.file) {

                const newFilePath =
                    path.join(
                        __dirname,
                        "../uploads/products",
                        req.file.filename
                    );

                if (
                    fs.existsSync(
                        newFilePath
                    )
                ) {

                    fs.unlinkSync(
                        newFilePath
                    );

                }

            }


            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        // Update text fields
        if (req.body.name !== undefined) {

            product.name =
                req.body.name.trim();

        }

        if (
            req.body.description !== undefined
        ) {

            product.description =
                req.body.description.trim();

        }

        if (req.body.price !== undefined) {

            product.price =
                Number(req.body.price);

        }

        if (req.body.stock !== undefined) {

            product.stock =
                Number(req.body.stock);

        }

        if (
            req.body.category !== undefined
        ) {

            product.category =
                req.body.category.trim();

        }


        // Replace image
        if (req.file) {

            const oldImage =
                product.image;


            product.image =
                `/uploads/products/${req.file.filename}`;


            // Delete old image
            if (oldImage) {

                const oldFilePath =
                    path.join(
                        __dirname,
                        "..",
                        oldImage
                    );

                if (
                    fs.existsSync(
                        oldFilePath
                    )
                ) {

                    fs.unlinkSync(
                        oldFilePath
                    );

                }

            }

        }


        await product.save();


        return res.status(200).json({

            success: true,

            message:
                "Product updated successfully",

            data: {
                product
            }

        });

    } catch (error) {

        console.error(
            "Update product error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update product"

        });

    }

};


// ==========================================
// DELETE PRODUCT
// ==========================================

const deleteProduct = async (
    req,
    res
) => {

    try {

        const product =
            await Product.findById(
                req.params.id
            );


        if (!product) {

            return res.status(404).json({

                success: false,

                message:
                    "Product not found"

            });

        }


        // Delete image
        if (product.image) {

            const imagePath =
                path.join(
                    __dirname,
                    "..",
                    product.image
                );


            if (
                fs.existsSync(imagePath)
            ) {

                fs.unlinkSync(
                    imagePath
                );

            }

        }


        // Delete database record
        await Product.findByIdAndDelete(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message:
                "Product deleted successfully"

        });

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete product"

        });

    }

};


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};