import jwt from "jsonwebtoken";
import prisma from "../configs/prisma.js";

// Register user
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (phoneNumber.length !== 10) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email or phone number already exists" });
    }

    // Store plain text password (NOT recommended for production)
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        password,
      },
    });
    const { password: _, ...userResponse } = newUser;
    return res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: "Email or phone number already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// User login
export const login = async (req, res) => {
  const { email, phoneNumber, password } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ message: "Email or phone number required." });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required." });
  }
  try {
    let user;
    if (email) {
      user = await prisma.user.findFirst({ where: { email } });
    } else if (phoneNumber) {
      user = await prisma.user.findFirst({ where: { phoneNumber } });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found / not registered" });
    }

    if (user.password === password) {
      const secret = process.env.TOKEN_SECRET;

      if (!secret) {
        return res.status(500).json({ message: "JWT secret not configured" });
      }
      const options = { expiresIn: "1h" };
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
        secret,
        options
      );
      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          dateJoined: user.dateJoined,
        },
      });
    } else {
      return res.status(401).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
