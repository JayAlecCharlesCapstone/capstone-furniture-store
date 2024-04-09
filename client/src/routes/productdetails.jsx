import React, {useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'

export default function ProductDetails(){
  const{productId} = useParams();
  const [product, setProduct] = useState(null)


  useEffect(()=>{
    const fetchProduct = async() =>{
      try{
        const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`);
        if (!response.ok){
          throw new Error('failed to fetch prodcut')
        }
        const result = await response.json();

        setProduct(result.product);
      }catch(error){
        console.error(error);
      }
    };

    fetchProduct()
  }, [productId])

  return(
    <>
    <div id = 'productDetails'>
      <h2>Product Details</h2>
      {product&& (
        <ul className='singleProductDetails'>
          <li>Name: {product.name}</li>
          <li>Description: {product.description}</li>
          <li>Price: {product.price}</li>
          <li>Quantity: {product.quantity}</li>
          <li><img src = {product.coverimage} alt = {product.name}></img> </li>
        </ul>
      )}
    </div>
    </>
  )
}
