import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";


const Home = ({ token, setNewReservedItem, addToCart }) => {
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


    return (
        <div id="home-container"> 
             <h2 className='home-header'>All Products</h2>
        <div id="allProducts" className="product-container">
            {products ? (
                products.map(product => (
                    <div key={product.product_id} className="product-item">
                        <p className="product-name">{product.name}</p>
                        <img className="product-image" src={product.image_url} alt={product.name} />
                        <p className="product-price">${product.price}</p>
                        <p className="product-stock">Stock: {product.stock_quantity}</p>
                        <Link to={`/ProductDetails/${product.product_id}`}>
                            <button className="view-item-btn">View Item</button>
                        </Link>
                        {token && (
                            <button className="add-to-cart-btn" onClick={() => addToCart(product.product_id)}>Add to cart</button>
                        )}
                    </div>
                ))
            ) : (
                <p>Loading products...</p>
            )}
        </div>
        </div>
    );
};

export default Home;
