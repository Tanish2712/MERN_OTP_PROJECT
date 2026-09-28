import { useEffect, useState } from "react";

import api from "../services/api";

function Products() {

    const [products, setProducts] =
        useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [formData, setFormData] =
        useState({
            name: "",
            description: "",
            price: "",
            stock: "",
            category: "",
            image: null
        });

    const [formError, setFormError] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const fetchProducts = async () => {

        try {

            const response =
                await api.get(
                    "/products"
                );

            setProducts(
                response.data.data.products
            );

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load products"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        const loadProducts = async () => {
            await fetchProducts();
        };

        loadProducts();

    }, []);


    const handleChange = (event) => {

        const { name, value, files } =
            event.target;

        setFormData({
            ...formData,
            [name]: name === "image"
                ? files[0]
                : value
        });

    };


    const handleCreate = async (event) => {

        event.preventDefault();
        setFormError("");
        setSaving(true);

        const payload = new FormData();

        payload.append("name", formData.name);
        payload.append("description", formData.description);
        payload.append("price", formData.price);
        payload.append("stock", formData.stock);
        payload.append("category", formData.category);
        payload.append("image", formData.image);

        try {

            const response = await api.post(
                "/products",
                payload
            );

            setProducts([
                response.data.data.product,
                ...products
            ]);

            setFormData({
                name: "",
                description: "",
                price: "",
                stock: "",
                category: "",
                image: null
            });

            event.target.reset();
            setShowForm(false);

        } catch (error) {

            setFormError(
                error.response?.data?.message ||
                "Failed to create product"
            );

        } finally {

            setSaving(false);

        }

    };


    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/products/${id}`
            );


            setProducts(
                products.filter(
                    (product) =>
                        product._id !== id
                )
            );

        } catch (error) {

            alert(
                error.response?.data?.message ||
                "Failed to delete product"
            );

        }

    };


    if (loading) {

        return (
            <div className="register-container">
                <h2>Loading products...</h2>
            </div>
        );

    }


    return (

        <div className="products-container">

            <div className="products-header">

                <div>
                    <h1>Products</h1>
                    <p>Add products with an image and manage your catalog.</p>
                </div>

                <button
                    className="add-product-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Close form" : "Add product"}
                </button>

            </div>


            {showForm && (

                <form
                    className="product-form"
                    onSubmit={handleCreate}
                >

                    <h2>New product</h2>

                    {formError && (
                        <div className="error-message">
                            {formError}
                        </div>
                    )}

                    <div className="product-form-grid">

                        <div className="form-group">
                            <label htmlFor="name">Product name</label>
                            <input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <input
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">Price</label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">Stock</label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="image">Product image</label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleChange}
                            required
                        />
                        <small>JPG, PNG or WEBP, maximum 5 MB.</small>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? "Uploading..." : "Save product"}
                    </button>

                </form>

            )}


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            <div className="products-grid">

                {products.length === 0 && !error && (
                    <p className="empty-products">
                        No products yet. Use “Add product” to upload your first one.
                    </p>
                )}

                {products.map(
                    (product) => (

                        <div
                            className="product-card"
                            key={product._id}
                        >

                            {product.image && (

                                <img
                                    src={
                                        `http://localhost:5000${product.image}`
                                    }
                                    alt={product.name}
                                />

                            )}


                            <h2>
                                {product.name}
                            </h2>


                            <p>
                                {product.description}
                            </p>


                            <p>
                                Category:{" "}
                                {product.category}
                            </p>


                            <p>
                                Price: ₹
                                {product.price}
                            </p>


                            <p>
                                Stock:{" "}
                                {product.stock}
                            </p>


                            <button
                                onClick={() =>
                                    handleDelete(
                                        product._id
                                    )
                                }
                            >
                                Delete
                            </button>

                        </div>

                    )
                )}

            </div>

        </div>

    );

}

export default Products;