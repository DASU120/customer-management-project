import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AddressList from '../components/AddressList';
import AddressForm from '../components/AddressForm';

function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const fetchCustomer = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${id}`);
      setCustomer(response.data.data);
    } catch (err) {
      setError('Failed to fetch customer');
      console.error('Error fetching customer:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/customers/${id}/addresses`);
      setAddresses(response.data.data);
    } catch (err) {
      setError('Failed to fetch addresses');
      console.error('Error fetching addresses:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchCustomer();
      await fetchAddresses();
      setLoading(false);
    };
    
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(`http://localhost:5000/api/customers/${id}`);
        navigate('/customers');
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleAddressAdded = () => {
    setShowAddressForm(false);
    fetchAddresses();
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container alert alert-danger">{error}</div>;
  if (!customer) return <div className="container">Customer not found</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Customer Details</h2>
        <div>
          <Link to={`/customers/${id}/edit`} className="btn btn-secondary">
            Edit Customer
          </Link>
          <button onClick={handleDelete} className="btn btn-danger" style={{ marginLeft: '10px' }}>
            Delete Customer
          </button>
        </div>
      </div>

      <div className="customer-card">
        <h3>{customer.first_name} {customer.last_name}</h3>
        <p><strong>Phone:</strong> {customer.phone_number}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Addresses</h3>
        <button 
          onClick={() => setShowAddressForm(!showAddressForm)} 
          className="btn btn-primary"
        >
          {showAddressForm ? 'Cancel' : 'Add Address'}
        </button>
      </div>

      {showAddressForm && (
        <AddressForm 
          customerId={id} 
          onAddressAdded={handleAddressAdded} 
          onCancel={() => setShowAddressForm(false)}
        />
      )}

      <AddressList 
        addresses={addresses} 
        onAddressUpdated={fetchAddresses}
        onAddressDeleted={fetchAddresses}
      />
    </div>
  );
}

export default CustomerDetailPage;