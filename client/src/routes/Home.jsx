import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home({ token, setNewReservedItem }) {
    const [products, setProducts] = useState(null);

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await fetch("http://localhost:3000/api/v1/products");
                const result = await response.json();
                setProducts(result.data.products);
            } catch (error) {
                console.error(error);
            }
        }
        getProducts();
    }, []);

    async function reserveProduct(id) {
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
            console.error(error);
        }
    }

    return (
        <div id ="allProducts">
        <>
            {products && products.map(products => (
                <div key={products.product_id} id={products.product_id}>
                    <p>{products.name}</p>
                    <p>${products.price}</p>
                    <p>{products.stock_quantity}</p>
                    <Link to={`/ProductDetails/${products.product_id}`}>
                        <button>View Item</button>
                    </Link>
                    {token && (
                        <button onClick={() => reserveProduct(products.product_id)}>Reserve Item</button>
                    )}
                </div>
            ))}
        </>
        </div>
    );
}
