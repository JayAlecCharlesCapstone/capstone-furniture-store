import React, { useState } from "react";

const ShippingAddressForm = ({ onSubmit }) => {
  const initialAddress = {
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  };

  const [address, setAddress] = useState(initialAddress);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prevAddress) => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address);
    setAddress(initialAddress); 
  };

  return (
    <form id="shipping_form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Address Line:
          <input
            type="text"
            name="street_address"
            value={address.street_address}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          State:
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="country"
            value={address.country}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Postal Code:
          <input
            type="text"
            name="postal_code"
            value={address.postal_code}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit">Submit Order</button>
    </form>
  );
};

export default ShippingAddressForm;
