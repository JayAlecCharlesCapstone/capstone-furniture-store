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
        <div id="allProducts">
            {products ? (
                products.map(product => (
                    <div key={product.product_id} id={product.product_id}>
                        <p>{product.name}</p>
                        <p>${product.price}</p>
                        <p>Stock: {product.stock_quantity}</p>
                        <Link to={`/ProductDetails/${product.product_id}`}>
                            <button>View Item</button>
                        </Link>
                        {token && (
                            <button onClick={() => reserveProduct(product.product_id)}>Add Item to Cart</button>
                        )}
                        <button onClick={() => removeProduct(product.product_id)}>Remove Product</button>
                    </div>
                ))
            ) : (
                <p>Loading products...</p>
            )}
        </div>
    );
}
