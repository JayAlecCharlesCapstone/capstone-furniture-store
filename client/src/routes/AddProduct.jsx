import React, { useState } from 'react'

function AddProduct({ token }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/api/v1/products', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    price,
                    description
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add new product');
            }

            alert('Product added successfully');
        } catch (error) {
            console.error('Error adding product:', error.message)
        }
    }


    return (
        <div>
            <h2>Add New Product</h2>
            <form onSubmit={handleSubmit}>
                <label>Name:</label>
                <input type='text' value={name} onChange={(e) => setName(e.target.value)} required></input>

                <label>Price:</label>
                <input type='number' value={price} onChange={(e) => setPrice(e.target.value)} required></input>

                <label>Description:</label>
                <input type='text' value={description} onChange={(e) => setDescription(e.target.value)} required></input>

                <button type='submit'>Add Product</button>
            </form>
        </div>
    )
}

export default AddProduct