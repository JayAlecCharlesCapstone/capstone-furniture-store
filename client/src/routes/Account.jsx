import React, { useState, useEffect } from 'react';

export default function Account({ token }) {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState(null);
console.log(customer)
  async function fetchCustomer() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/customer", {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const result = await response.json();
      setCustomer(result.data.customers);
      console.log(result)
    } catch (error) {
      console.error(error);
    }
  }
  
  async function fetchCart() {
    try {
      const response = await fetch("http://localhost:3000/api/v1/cart", {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch cart information');
      }
      const result = await response.json();
      setCart(result);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (token) {
      fetchCustomer();
      fetchCart();
    }
  }, [token]);

  async function returnProduct(productId) {
    try {
      const response = await fetch(
        `localhost:3000/api/v1/cart/${productId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to return product');
      }
      fetchCart(); 
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className='customerInformation'>
        {customer && (
          <>
            <h1>Customer Login Information:</h1>
            <h3>Name:</h3> <p>{customer[0].name}</p>
            <h3>Last Name:</h3> <p>{customer.lastname}</p>
            <h3>Email:</h3> <p>{customer.email}</p>
          </>
        )}
      </div>

      <div className='cart'>
        <h2>Cart:</h2>
        {cart && cart.length > 0 ? (
          cart.map(product => (
            <div key={product.id}>
              <p>{product.details}</p>
              <button onClick={() => returnProduct(product.id)}>Return Product</button>
            </div>
          ))
        ) : (
          <div>
            <p>No products in cart</p>
          </div>
        )}
      </div>
    </>
  );
}
