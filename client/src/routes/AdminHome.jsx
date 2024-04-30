import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


export default function AdminHome({ token, setNewReservedItem }) {
    const [products, setProducts] = useState(null);

    const getProducts = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/v1/products");
            const result = await response.json();
            setProducts(result.data.products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);
    
    const reserveProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/products/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    available: false
                })
            });
            const result = await response.json();
            setNewReservedItem(result);
        } catch (error) {
            console.error("Error reserving product:", error);
        }
    };

    const removeProduct = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            await getProducts();
        } catch (error) {
            console.error("Error removing product:", error);
        }
    };

    return (
        <div className="admin-home-container">
            <h2 className="adminHomeHeader">All Products</h2>
            <div className="product-list">
                {products ? (
                    products.map(product => (
                        <div key={product.product_id} className="product-item">
                            <p className="product-name">{product.name}</p>
                            <img className="product-image" src={product.image_url} alt={product.name} />
                            <p className="product-price">${product.price}</p>
                            <p className="product-stock">Stock: {product.stock_quantity}</p>
                            <div className="product-actions">
                                <button className="remove-btn" onClick={() => removeProduct(product.product_id)}>Remove</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Loading products...</p>
                )}
            </div>
        </div>
    );
}
