import React, { useState } from 'react';


function AddProduct({ token }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock_quantity, setStock_quantity] = useState('');
    const [image_url, setImage_url] = useState('');

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
                    stock_quantity,
                    image_url
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
            setImage_url('');
        } catch (error) {
            console.error('Error adding product:', error.message);
            alert('Failed to add product. Please try again.');
        }
    };

    return (
        <div className="add-product-container">
            <h2 className="add-product-header">Add New Product</h2>
            <form onSubmit={handleSubmit} className="add-product-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Price:</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        value={stock_quantity}
                        onChange={(e) => setStock_quantity(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="image">Image URL:</label>
                    <input
                        type="text"
                        id="image"
                        value={image_url}
                        onChange={(e) => setImage_url(e.target.value)}
                        required
                    />
                </div>

                <button className="add-product-button" type="submit">Add Product</button>
            </form>
        </div>
    );
}

export default AddProduct;
