import React, { useState, useEffect } from 'react';

function CustomerForm({ initialData, onSubmit }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        phone_number: initialData.phone_number || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number must be 10-15 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    
    if (validate()) {
      try {
        await onSubmit(formData);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.error) {
          setSubmitError(err.response.data.error);
        } else {
          setSubmitError('An error occurred while saving the customer');
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {submitError && (
        <div className="alert alert-danger">
          {submitError}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="first_name">First Name:</label>
        <input
          type="text"
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={errors.first_name ? 'error' : ''}
        />
        {errors.first_name && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.first_name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="last_name">Last Name:</label>
        <input
          type="text"
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={errors.last_name ? 'error' : ''}
        />
        {errors.last_name && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.last_name}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="phone_number">Phone Number:</label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          className={errors.phone_number ? 'error' : ''}
        />
        {errors.phone_number && <div className="alert alert-danger" style={{ marginTop: '5px' }}>{errors.phone_number}</div>}
      </div>
      
      <button type="submit" className="btn btn-success">
        Save Customer
      </button>
    </form>
  );
}

export default CustomerForm;