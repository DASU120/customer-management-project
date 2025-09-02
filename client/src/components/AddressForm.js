import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddressForm({ customerId, address, onAddressAdded, onCancel }) {
  const [formData, setFormData] = useState({
    address_details: '',
    city: '',
    state: '',
    pin_code: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (address) {
      setFormData({
        address_details: address.address_details || '',
        city: address.city || '',
        state: address.state || '',
        pin_code: address.pin_code || ''
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.address_details.trim()) {
      newErrors.address_details = 'Address details are required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.pin_code.trim()) {
      newErrors.pin_code = 'Pin code is required';
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'Pin code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (validate()) {
      try {
        if (address) {
          // Update existing address
          await axios.put(`http://localhost:5000/api/addresses/${address.id}`, formData);
        } else {
          // Create new address
          await axios.post(`http://localhost:5000/api/customers/${customerId}/addresses`, formData);
        }
        onAddressAdded();
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setSubmitError(err.response.data.error);
        } else {
          setSubmitError('An error occurred while saving the address');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      {submitError && (
        <div className="alert alert-danger">
          {submitError}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="address_details">Address Details:</label>
        <textarea
          id="address_details"
          name="address_details"
          value={formData.address_details}
          onChange={handleChange}
          className={errors.address_details ? 'error' : ''}
          rows="3"
        />
        {errors.address_details && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.address_details}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="city">City:</label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className={errors.city ? 'error' : ''}
        />
        {errors.city && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.city}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="state">State:</label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className={errors.state ? 'error' : ''}
        />
        {errors.state && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.state}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="pin_code">Pin Code:</label>
        <input
          type="text"
          id="pin_code"
          name="pin_code"
          value={formData.pin_code}
          onChange={handleChange}
          className={errors.pin_code ? 'error' : ''}
        />
        {errors.pin_code && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.pin_code}</div>}
      </div>
      
      <button type="submit" className="btn btn-success">
        {address ? 'Update Address' : 'Add Address'}
      </button>
      <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ marginLeft: '10px' }}>
        Cancel
      </button>
    </form>
  );
}

export default AddressForm;