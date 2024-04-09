import {useEffect, useState} from "react";
import { useParams } from "react-router-dom";

export default function ProductDetails({ token, setNewReservedItem }) {
  const [item, setItem] = useState(null);
  const {itemId} = useParams();

  useEffect(() => {
    async function getItemDetails() {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/products/${itemId}`);
            const result = await response.json();
            console.log(result);
            setItem(result);
        } catch (error) {
            console.error(error);
        }
    }
    getItemDetails();
}, [itemId]);


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
    <div>
        {item ? (
            <>
                <h2>{item.name}</h2>
                <p>Description: {item.description}</p>
                <p>Price: ${item.price}</p>
                {token && (
                    <button onClick={() => reserveItem(item.id)}>Add Item</button>
                )}
            </>
        ) : (
          <p>Gathering your details...</p>
      )}
    </div>
  )
}
