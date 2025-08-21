import prisma from "../configs/prisma.js";

// Get user by ID
export const getUser = async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid userId parameter",
      user: null,
    });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: parsedUserId,
      },
    });
    if (user) {
      const { password: _, ...userResponse } = user;
      return res.status(200).json({
        status: 200,
        message: "User found successfully",
        user: userResponse,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "No user found",
        user: null,
      });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update user details
export const updateUser = async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid userId parameter",
      user: null,
    });
  }
  const update = { ...req.body };

  try {
    // Check for email or phone number conflict
    if (update.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: update.email,
          NOT: { userId: parsedUserId },
        },
      });
      if (emailExists) {
        return res.status(400).json({ status: 400, message: "Email already exists!" });
      }
    }

    if (update.phoneNumber) {
      const phoneExists = await prisma.user.findFirst({
        where: {
          phoneNumber: update.phoneNumber,
          NOT: { userId: parsedUserId },
        },
      });
      if (phoneExists) {
        return res.status(400).json({ status: 400, message: "Phone number already exists!" });
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { userId: parsedUserId },
      data: update,
    });

    const { password: _, ...userResponse } = user;

    return res.status(200).json({
      status: 200,
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid userId parameter",
    });
  }
  try {
    // Check if user exists before deleting
    const existingUser = await prisma.user.findUnique({
      where: { userId: parsedUserId },
    });
    if (!existingUser) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
      });
    }

    // Delete user
    const deletedUser = await prisma.user.delete({
      where: {
        userId: parsedUserId,
      },
    });

    return res.status(200).json({
      status: 200,
      message: "User deleted successfully",
      deletedUserId: deletedUser.userId,
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle foreign key constraint errors
    if (error.code === "P2003") {
      return res.status(400).json({
        status: 400,
        message:
          "Cannot delete user: User has associated accounts or transactions",
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const listUserAccounts = async (req, res) => {
  const { userId } = req.params;
  const parsedUserId = parseInt(userId);
  if (isNaN(parsedUserId)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid userId parameter",
      accounts: []
    });
  }
  try {
    const accounts = await prisma.account.findMany({
      where: {
        userId: parsedUserId,
      },
      select: {
        accountNumber: true,
        accountType: true,
        balance: true,
        status: true,
        dateCreated: true,
      },
      orderBy: {
        dateCreated: "desc",
      },
    });

    if (accounts.length === 0) {
      return res.status(200).json({
        status: 200,
        message: "No accounts found for this user",
        accounts: []
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User accounts retrieved successfully",
      accounts,
    });
  } catch (error) {
    console.error("Error fetching user accounts:", error);
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
