import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CustomerList from '../components/CustomerList';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://customer-management-app-qqqn.onrender.com/api/customers`, {
        params: {
          search: searchTerm,
          page: currentPage,
          sort: sortConfig.key,
          order: sortConfig.direction
        }
      });
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, sortConfig]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCustomers();
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container alert alert-danger">{error}</div>;

  return (
    <div className="container">
      <div className="search-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Customer List</h2>
        <Link to="/customers/new" className="btn btn-primary">
          Add New Customer
        </Link>
      </div>
      
      <CustomerList 
        customers={customers} 
        sortConfig={sortConfig}
        onSort={handleSort}
      />
      
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={currentPage === i + 1 ? 'active' : ''}
            >
              {i + 1}
            </button>
          ))}
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerListPage;