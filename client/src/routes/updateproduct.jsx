import { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";

export default function UpdateProduct({ token }) {
    const [product, setProduct] = useState(null);
    const [formData, setFormData] = useState({});
    const { productId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                const data = await response.json();
                setProduct(data);
                setFormData({
                    name: data.name,
                    description: data.description,
                    price: data.price
                });
            } catch (error) {
                console.error(error);
            }
        }
        fetchProduct();
    }, [productId, token]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                navigate(`/products/${productId}`);
            } else {
                console.error("Failed to update product, please try again!");
            }
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div>
            <h2>Update Product</h2>
            {product ? (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Description:</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Price:</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit">Update Product</button>
                </form>
            ) : (
                <p> Updating your product...</p>
            )}
        </div>
    );
