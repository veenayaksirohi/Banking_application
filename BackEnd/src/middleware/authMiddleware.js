import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const { userId } = req.params; // Fixed: Extract userId from params properly
  const token = authHeader?.split(' ')[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => { // Fixed: TOKEN_SECRET
    if (err) {
      // Token might be invalid or expired
      return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
    
    req.user = decoded; // Attach decoded payload to request
    
    // Check if the authenticated user matches the requested userId
    // if (decoded.userId != parseInt(userId)) { // Fixed: syntax and type conversion
    //   return res.status(403).json({ // Changed to 403 (Forbidden)
    //     message: 'Access denied: Cannot access other user data'
    //   });
    // }
    
    next();
  });
}
