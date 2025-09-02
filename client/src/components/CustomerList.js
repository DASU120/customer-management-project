import React from 'react';
import { Link } from 'react-router-dom';

function CustomerList({ customers, sortConfig, onSort }) {
  const getRequestSort = (key) => {
    return () => onSort(key);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  if (customers.length === 0) {
    return <div>No customers found</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th onClick={getRequestSort('id')} style={{ cursor: 'pointer' }}>
            ID {getSortIcon('id')}
          </th>
          <th onClick={getRequestSort('first_name')} style={{ cursor: 'pointer' }}>
            First Name {getSortIcon('first_name')}
          </th>
          <th onClick={getRequestSort('last_name')} style={{ cursor: 'pointer' }}>
            Last Name {getSortIcon('last_name')}
          </th>
          <th onClick={getRequestSort('phone_number')} style={{ cursor: 'pointer' }}>
            Phone Number {getSortIcon('phone_number')}
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {customers.map(customer => (
          <tr key={customer.id}>
            <td>{customer.id}</td>
            <td>{customer.first_name}</td>
            <td>{customer.last_name}</td>
            <td>{customer.phone_number}</td>
            <td>
              <Link to={`/customers/${customer.id}`} className="btn btn-primary btn-sm">
                View
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CustomerList;