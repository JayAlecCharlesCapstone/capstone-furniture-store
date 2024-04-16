import { useEffect, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";

export default function Home({ token, setNewReservedItem }) {
    const [products, setProducts] = useState(null);

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await fetch("http://localhost:3000/api/v1/products");
                const result = await response.json();
                console.log(result);
                setProducts(result.data.products);
            } catch (error) {
                console.error(error);
            }
        }
        getProducts();
    }, []);

    async function reserveProduct(id) {
        try {
            const response = await fetch("http://localhost:3000/api/v1/products"+id, {
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
            console.log(result);
            setNewReservedItem(result);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div id ="allProducts">
        <>
            {items && items.map(item => (
                <div key={item.id}>
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <Link to={`/items/${product.id}`}>
                        <button>View Item</button>
                    </Link>
                    {token && (
                        <button onClick={() => reserveProducts(prodcut.id)}>Reserve Item</button>
                    )}
                </div>
            ))}
        </>
        </div>
    );
}
