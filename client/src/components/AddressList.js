import React, { useState } from 'react';
import axios from 'axios';
import AddressForm from './AddressForm';

function AddressList({ addresses, onAddressUpdated, onAddressDeleted }) {
  const [editingAddressId, setEditingAddressId] = useState(null);

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await axios.delete(`http://localhost:5000/api/addresses/${addressId}`);
        onAddressDeleted();
      } catch (err) {
        console.error('Error deleting address:', err);
      }
    }
  };

  const handleEdit = (addressId) => {
    setEditingAddressId(addressId);
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
  };

  const handleAddressUpdated = () => {
    setEditingAddressId(null);
    onAddressUpdated();
  };

  if (addresses.length === 0) {
    return <div>No addresses found</div>;
  }

  return (
    <div>
      {addresses.map(address => (
        <div key={address.id} className="address-card">
          {editingAddressId === address.id ? (
            <AddressForm
              address={address}
              onAddressAdded={handleAddressUpdated}
              onCancel={handleCancelEdit}
            />
          ) : (
            <>
              <p><strong>Address:</strong> {address.address_details}</p>
              <p><strong>City:</strong> {address.city}</p>
              <p><strong>State:</strong> {address.state}</p>
              <p><strong>Pin Code:</strong> {address.pin_code}</p>
              <div>
                <button 
                  onClick={() => handleEdit(address.id)} 
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(address.id)} 
                  className="btn btn-danger btn-sm"
                  style={{ marginLeft: '10px' }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default AddressList;