import { useState } from 'react';

export default function Register() {
  const [fullname, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/customer/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullname: fullname,
          phone: phone,
          email: email,
          password: password
        })
      });
      if (!response.ok) {
        throw new Error('Failed to register');
      }
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      
    }
  }

  return (
    <>
      <form id='registrationForm' onSubmit={handleSubmit}>
        <label>Full Name:</label>
        <input type="text" value={fullname} onChange={(event) => setFullName(event.target.value)}  required />
        <br />
        <label>Phone Number:</label>
        <input type="text"value={phone} onChange={(event) => setPhone(event.target.value)} required/>
        <br />
        <label>Email:</label>
        <input type="email"value={email} onChange={(event) => setEmail(event.target.value)} required/>
        <br />
        <label>Password:</label>
        <input type="password" value={password}onChange={(event) => setPassword(event.target.value)} required/>
        <br />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}