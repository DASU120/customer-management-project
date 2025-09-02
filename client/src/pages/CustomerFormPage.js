import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import CustomerForm from '../components/CustomerForm';

function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
          setInitialData(response.data.data);
        } catch (err) {
          console.error('Error fetching customer:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomer();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (customerData) => {
    try {
      if (id) {
        // Update existing customer
        await axios.put(`http://localhost:5000/api/customers/${id}`, customerData);
      } else {
        // Create new customer
        await axios.post('http://localhost:5000/api/customers', customerData);
      }
      navigate('/customers');
    } catch (err) {
      console.error('Error saving customer:', err);
      throw err;
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>{id ? 'Edit Customer' : 'Add New Customer'}</h2>
        <Link to="/customers" className="btn btn-secondary">
          Back to List
        </Link>
      </div>
      
      <CustomerForm 
        initialData={initialData} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

export default CustomerFormPage;