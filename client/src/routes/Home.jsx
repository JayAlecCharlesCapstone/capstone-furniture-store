import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home({ token, setNewReservedItem }) {
    const [items, setItems] = useState(null);

    useEffect(() => {
        async function getItems() {
            try {
                const response = await fetch("http://localhost:3000/api/v1/products");
                const result = await response.json();
                console.log(result);
                setItems(result.items);
            } catch (error) {
                console.error(error);
            }
        }
        getItems();
    }, []);

    async function reserveItem(id) {
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
        <>
            {items && items.map(item => (
                <div key={item.id}>
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <Link to={`/items/${item.id}`}>
                        <button>View Item</button>
                    </Link>
                    {token && (
                        <button onClick={() => reserveItem(item.id)}>Reserve Item</button>
                    )}
                </div>
            ))}
        </>
    );
}
