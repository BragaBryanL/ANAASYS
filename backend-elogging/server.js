// Import necessary modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
const port = 3001; // Port where the server will run

// PostgreSQL connection configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Student_log",
  password: "12345",
  port: 5432, // Default PostgreSQL port
});

// Middleware to parse JSON request body
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Faculty registration endpoint
app.post("  ", async (req, res) => {
  const { firstname, middle, lastname, email, password, age } = req.body;
  const fullName = `${firstname} ${middle} ${lastname}`.trim();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userQuery = `
      INSERT INTO tbl_users (name, email, password, role_id, status, created_at)
      VALUES ($1, $2, $3, 1, 1, NOW())
      RETURNING "id";
    `;
    const userValues = [fullName, email, hashedPassword];

    const userResult = await pool.query(userQuery, userValues);
    const userID = userResult.rows[0].id;

    const facultyQuery = `
      INSERT INTO tbl_faculty (user_id, firstname, lastname, availability, status, created_at, middle, age)
      VALUES ($1, $2, $3, 1, 1, NOW(), $4, $5)
      RETURNING "id";
    `;
    const facultyValues = [userID, firstname, lastname, middle, age];

    const facultyResult = await pool.query(facultyQuery, facultyValues);
    const insertedFacultyID = facultyResult.rows[0].id;

    res.status(201).json({
      message: `User registered with id: ${userID}, Faculty registered with id: ${insertedFacultyID}`,
    });
  } catch (error) {
    console.error("Error registering faculty:", error);
    res.status(500).json({ error: "Failed to register faculty" });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Query the user based on the email
    const userQuery = `SELECT * FROM tbl_users WHERE email = $1`;
    const userResult = await pool.query(userQuery, [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password (ensure to compare hashed passwords)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) { 
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Fetch all faculty info
    const facultyQuery = `SELECT * FROM tbl_faculty WHERE user_id = $1`;
    const facultyResult = await pool.query(facultyQuery, [user.id]);
    const faculty = facultyResult.rows[0]; // Assuming one faculty per user

    res.json({
      message: 'Login successful',
      user_id: user.id,
      name: user.name,
      email: user.email,
      facultyInfo: faculty, // Include all faculty information
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Fetch all users
app.get("/users", async (req, res) => {
  try {
    const userQuery = `
      SELECT 
        u.id AS "userID", 
        u.name, 
        u.email, 
        u.status,
        f.firstname AS "firstName", 
        f.lastname AS "lastName",
        f.middle AS "middle"
      FROM 
        tbl_users u
      LEFT JOIN 
        tbl_faculty f ON u.id = f.user_id;
    `;
    const userResult = await pool.query(userQuery);
    res.status(200).json(userResult.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Fetch all faculty members
app.get("/faculty", async (req, res) => {
  try {
    const facultyQuery = `  
      SELECT f.id, f.user_id, f.lastname, f.firstname, f.availability, f.status, f.created_at
      FROM tbl_faculty f;
    `;
    const facultyResult = await pool.query(facultyQuery);
    res.status(200).json(facultyResult.rows);
  } catch (error) {
    console.error("Error fetching faculty members:", error);
    res.status(500).json({ error: "Failed to fetch faculty members" });
  }
});

// Toggle faculty status (active/disabled)
app.put("/faculty/:userID/toggle-status", async (req, res) => {
  const userID = req.params.userID;

  try {
    const facultyQuery = `SELECT status FROM tbl_faculty WHERE user_id = $1`;
    const facultyResult = await pool.query(facultyQuery, [userID]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    const currentStatus = facultyResult.rows[0].status;
    const newStatus = currentStatus === 1 ? 0 : 1;

    const updateQuery = `UPDATE tbl_faculty SET status = $1 WHERE user_id = $2`;
    await pool.query(updateQuery, [newStatus, userID]);

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// Update faculty availability
app.put("/faculty/:id", async (req, res) => {
  const facultyID = req.params.id;
  const { availability } = req.body;

  try {
    const updateQuery = `
      UPDATE tbl_faculty 
      SET availability = $1 
      WHERE id = $2
    `;
    await pool.query(updateQuery, [availability, facultyID]);

    res.json({ message: "Faculty availability updated successfully" });
  } catch (error) {
    console.error("Error updating faculty availability:", error);
    res.status(500).json({ error: "Failed to update faculty availability" });
  }
});
// Fetch overall faculty availability status
app.get("/faculty/status", async (req, res) => {
  try {
    const facultyQuery = `
      SELECT availability, COUNT(*) AS count
      FROM tbl_faculty
      GROUP BY availability;
    `;
    const facultyResult = await pool.query(facultyQuery);

    // Transform the result into a status object
    const availabilityStatus = {
      available: 0,
      busy: 0,
      offline: 0,
    };

    facultyResult.rows.forEach(row => {
      if (row.availability == 0) {
        availabilityStatus.available = row.count; // Assuming 1 means available
      } else if (row.availability == 2) {
        availabilityStatus.busy = row.count; // Assuming 2 means busy
      } else if (row.availability == 1) {
        availabilityStatus.offline = row.count; // Assuming 0 means offline
      }
    });

    res.status(200).json(availabilityStatus);
  } catch (error) {
    console.error("Error fetching faculty availability status:", error);
    res.status(500).json({ error: "Failed to fetch faculty availability status" });
  }
});
app.put("/edit/faculty/:userID", async (req, res) => {
  const userID = req.params.userID; // Get the userID from the URL parameters
  const { firstname, middle, lastname, age, password } = req.body; // Get fields to update from the request body

  try {
    // Check if the faculty member exists
    const facultyQuery = `SELECT * FROM tbl_faculty WHERE user_id = $1`;
    const facultyResult = await pool.query(facultyQuery, [userID]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    // Prepare update query for faculty table
    const facultyUpdateQuery = `
      UPDATE tbl_faculty 
      SET firstname = $1, middle = $2, lastname = $3, age = $4 
      WHERE user_id = $5
    `;

    const facultyValues = [firstname, middle, lastname, age, userID];

    // Update tbl_faculty details
    await pool.query(facultyUpdateQuery, facultyValues);

    // Update password in tbl_users if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving
      const userUpdateQuery = `
        UPDATE tbl_users
        SET password = $1
        WHERE id = $2
      `;
      await pool.query(userUpdateQuery, [hashedPassword, userID]);
    }

    res.json({ message: "Faculty details updated successfully" });
  } catch (error) {
    console.error("Error updating faculty details:", error.message || error);
    res.status(500).json({ error: "Failed to update faculty details" });
  }
});

app.get("/faculty/profile/:userID", async (req, res) => {
  const userID = req.params.userID;

  try {
    const facultyQuery = `
      SELECT 
        u.id AS "userID",
        u.name, 
        u.email, 
        u.password,
        u.status, 
        f.firstname AS "firstName", 
        f.lastname AS "lastName", 
        f.middle AS "middle", 
        f.age, 
        f.availability, 
        f.created_at
      FROM 
        tbl_users u
      INNER JOIN 
        tbl_faculty f ON u.id = f.user_id
      WHERE 
        u.id = $1;
    `;
    
    const facultyResult = await pool.query(facultyQuery, [userID]);

    if (facultyResult.rows.length === 0) {
      return res.status(404).json({ message: "Faculty member not found" });
    }

    const facultyData = facultyResult.rows[0];

    // Hash the password (not typically recommended to send it back)
    const hashedPassword = await bcrypt.hash(facultyData.password, 10);

    // Send the faculty info, including the hashed password
    res.status(200).json({
      ...facultyData,
      hashedPassword: hashedPassword, // Send the hashed password
    });
  } catch (error) {
    console.error("Error fetching faculty profile:", error);
    res.status(500).json({ error: "Failed to fetch faculty profile" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
