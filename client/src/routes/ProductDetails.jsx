import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails({ token, addToCart }) {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();

  useEffect(() => {
    async function getProductDetails() {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`);
        const result = await response.json();
        setProduct(result.data.product);
      } catch (error) {
        console.error(error);
      }
    }
    getProductDetails();
  }, [productId]);

  return (
    <div className="product-details-container">
      {product ? (
        <>
          <h2 className="product-details-heading">{product.name}</h2>
          <img className="product-details-image" src={product.image_url} alt={product.name} /> 
          <p className="product-details-description">Description: {product.description}</p>
          <p className="product-details-price">Price: ${product.price}</p>
          {token && (
            <button className="add-to-cart-button" onClick={() => addToCart(product.product_id)}>Add to cart</button>
          )}
        </>
      ) : (
        <p>Gathering your details...</p>
      )}
    </div>
  )
}
