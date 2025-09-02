const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

// Initialize database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    address_details TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pin_code TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
  )`);
});

// API Routes

// GET all customers with search, sorting, and pagination
app.get('/api/customers', (req, res) => {
  const { search = '', sort = 'id', order = 'ASC', page = 1, limit = 10 } = req.query;
  
  // Validate sort field
  const validSortFields = ['id', 'first_name', 'last_name', 'phone_number'];
  const sortField = validSortFields.includes(sort) ? sort : 'id';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  // Build search condition
  const searchCondition = search 
    ? `WHERE first_name LIKE '%${search}%' OR last_name LIKE '%${search}%' OR phone_number LIKE '%${search}%'`
    : '';
  
  // Get total count for pagination
  const countSql = `SELECT COUNT(*) as count FROM customers ${searchCondition}`;
  db.get(countSql, [], (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    const totalCount = result.count;
    
    // Get customers with pagination
    const sql = `SELECT * FROM customers ${searchCondition} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      res.json({
        message: "success",
        data: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount: totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      });
    });
  });
});

// GET a single customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const sql = "SELECT * FROM customers WHERE id = ?";
  
  db.get(sql, [customerId], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({
      message: "success",
      data: row
    });
  });
});

// POST create a new customer
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone_number } = req.body;
  
  // Basic validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const sql = "INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)";
  db.run(sql, [first_name, last_name, phone_number], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
      return res.status(400).json({ error: err.message });
    }
    
    res.json({
      message: "success",
      data: {
        id: this.lastID,
        first_name,
        last_name,
        phone_number
      }
    });
  });
});

// PUT update a customer
app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { first_name, last_name, phone_number } = req.body;
  
  // Basic validation
  if (!first_name || !last_name || !phone_number) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const sql = "UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?";
  db.run(sql, [first_name, last_name, phone_number, customerId], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({
      message: "success",
      data: {
        id: customerId,
        first_name,
        last_name,
        phone_number
      }
    });
  });
});

// DELETE a customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const sql = "DELETE FROM customers WHERE id = ?";
  
  db.run(sql, [customerId], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    res.json({
      message: "success",
      data: { id: customerId }
    });
  });
});

// GET all addresses for a customer
app.get('/api/customers/:id/addresses', (req, res) => {
  const customerId = req.params.id;
  const sql = "SELECT * FROM addresses WHERE customer_id = ?";
  
  db.all(sql, [customerId], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    res.json({
      message: "success",
      data: rows
    });
  });
});

// POST add a new address for a customer
app.post('/api/customers/:id/addresses', (req, res) => {
  const customerId = req.params.id;
  const { address_details, city, state, pin_code } = req.body;
  
  // Basic validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const sql = "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)";
  db.run(sql, [customerId, address_details, city, state, pin_code], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    res.json({
      message: "success",
      data: {
        id: this.lastID,
        customer_id: customerId,
        address_details,
        city,
        state,
        pin_code
      }
    });
  });
});

// PUT update an address
app.put('/api/addresses/:addressId', (req, res) => {
  const addressId = req.params.addressId;
  const { address_details, city, state, pin_code } = req.body;
  
  // Basic validation
  if (!address_details || !city || !state || !pin_code) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const sql = "UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?";
  db.run(sql, [address_details, city, state, pin_code, addressId], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    res.json({
      message: "success",
      data: {
        id: addressId,
        address_details,
        city,
        state,
        pin_code
      }
    });
  });
});

// DELETE an address
app.delete('/api/addresses/:addressId', (req, res) => {
  const addressId = req.params.addressId;
  const sql = "DELETE FROM addresses WHERE id = ?";
  
  db.run(sql, [addressId], function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: "Address not found" });
    }
    
    res.json({
      message: "success",
      data: { id: addressId }
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});