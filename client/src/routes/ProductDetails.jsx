
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails({ token, addToCart }) {
  const [products, setProducts] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    async function getProductsDetails() {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`);
        const result = await response.json();
        setProducts(result.data.product);
      } catch (error) {
        console.error(error);
      }
    }
    getProductsDetails();
  }, [productId]);


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
      console.error(error);
    }
  }

  return (
    <div>
      {products ? (
        <>
          <h2>{products.name}</h2>
          <img className="homeFurniture" src={products.image_url} alt={products.name} style={{ width: '200px', height: 'auto' }} /> {/*Displaying the products*/}
          <p>Description: {products.description}</p>
          <p>Price: ${products.price}</p>
          {token && (
            <button onClick={() => addToCart(products.product_id)}>Add to cart</button>
          )}
        </>
      ) : (
        <p>Gathering your details...</p>
      )}
    </div>
  )
}
