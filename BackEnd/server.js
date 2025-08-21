import express from 'express';
import router from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    console.log('Request Body:', req.body);
  }
  next();
});

app.use(express.json()); // Enable JSON parsing globally

// Basic route for GET requests to "/"
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(router);

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ status: 500, message: "Internal server error", error: err.message });
});

// Start the server and log a message when ready
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
