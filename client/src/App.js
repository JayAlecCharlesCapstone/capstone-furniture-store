import React, {useEffect, useState} from 'react'



function App() {
  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBackendData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  return (
    <div>
      {(typeof backendData.users === 'undefined') ? (
        <p>Loading....</p>
      ): (
        backendData.users.map((user,i) => (
          <p key={i}>{user}</p>
        ))
      )}
    </div>
  )
}

export default App