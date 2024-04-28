import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const Home = ({ token, setNewReservedItem }) => {
    const [products, setProducts] = useState(null);
    const { productId } = useParams();

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await fetch("http://localhost:3000/api/v1/products");
                const result = await response.json();
                setProducts(result.data.products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        }
        getProducts();
    }, []);

    async function addToCart(productId) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });
            const result = await response.json();
            alert('Product added to cart!');
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    }

    return (
        <div id="allProducts">
            {products ? (
                products.map(product => (
                    <div key={product.product_id} id={product.product_id}>
                        <p>{product.name}</p>
                        <img class="homeFurniture" src={product.image_url} alt={product.name} />
                        <p>${product.price}</p>
                        <p>{product.stock_quantity}</p>
                        <Link to={`/ProductDetails/${product.product_id}`}>
                            <button>View Item</button>
                        </Link>
                        {token && (
                            <button onClick={() => addToCart(product.product_id)}>Add to cart</button>
                        )}
                    </div>
                ))
            ) : (
                <p>Loading products...</p>
            )}
        </div>
    );
};

export default Home;
