import React, { useState } from 'react';

function AddProduct({ token }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock_quantity, setStock_quantity] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/v1/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    price,
                    description,
                    stock_quantity
                })
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to add new product: ${errorMessage}`);
            }

            alert('Product added successfully');
            setName('');
            setPrice('');
            setDescription('');
            setStock_quantity('');
        } catch (error) {
            console.error('Error adding product:', error.message);
            alert('Failed to add product. Please try again.');
        }
    };


    return (
        <div>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <label>Price:</label>
                <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                />

                <label>Description:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <label>Quantity:</label>
                <input
                    type="number"
                    value={stock_quantity}
                    onChange={(e) => setStock_quantity(e.target.value)}
                    required
                />

                <button type="submit">Add Product</button>
            </form>
        </div>
    );
}

export default AddProduct;
