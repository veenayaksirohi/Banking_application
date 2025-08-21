import prisma from "../configs/prisma.js";

// GET /accounts/:accountNumber/balance
export const getAccountBalance = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;
  try {
    const account = await prisma.account.findFirst({
      where: { accountNumber, userId },
      select: { balance: true }
    });
    if (!account) {
      return res.status(404).json({ status: 404, message: "Account not found" });
    }
    return res.status(200).json({ status: 200, balance: account.balance });
  } catch (error) {
    console.error("Error fetching account balance:", error);
    return res.status(500).json({ status: 500, message: "Internal server error", error: error.message });
  }
};

// Generates a unique, 10-digit, numeric account number as a string
const generateAccountNumber = () => {
  // First digit non-zero
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const rest = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, "0");
  return firstDigit + rest;
};

export const createAccounts = async (req, res) => {
  const userId = req.user.userId;
  const { accountType, balance = 0.0, status = "ACTIVE" } = req.body;

  try {
    // Validate accountType enum
    const validAccountTypes = ["SAVINGS", "CURRENT"];
    if (!validAccountTypes.includes(accountType)) {
      return res.status(400).json({
        message: "Invalid account type. Must be SAVINGS or CURRENT",
      });
    }

    // Validate status enum
    const validStatuses = ["ACTIVE", "INACTIVE"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be ACTIVE or INACTIVE",
      });
    }

    let accountNumber;
    let isUnique = false;

    while (!isUnique) {
      accountNumber = generateAccountNumber();
      const existing = await prisma.account.findUnique({
        where: { accountNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const created = await prisma.account.create({
      data: {
        accountNumber,
        userId,
        accountType,
        balance,
        status,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      account: created,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /accounts/:accountNumber
export const getAccount = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;

  try {
    const accDetails = await prisma.account.findFirst({
      where: {
        accountNumber,
        userId, // Ensure user can only access their own accounts
      },
    });

    if (accDetails) {
      return res.status(200).json(accDetails);
    } else {
      return res.status(404).json({ message: "Account not found" });
    }
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// PATCH /accounts/:accountNumber
export const updateAccount = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;
  const { accountType, status } = req.body;

  try {
    // First check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        accountNumber,
        userId,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Prepare update data - only include fields that are provided
    const updateData = {};

    if (accountType !== undefined) {
      // Validate accountType enum
      const validAccountTypes = ["SAVINGS", "CURRENT"];
      if (!validAccountTypes.includes(accountType)) {
        return res.status(400).json({
          message: "Invalid account type. Must be SAVINGS or CURRENT",
        });
      }
      updateData.accountType = accountType;
    }

    if (status !== undefined) {
      // Validate status enum
      const validStatuses = ["ACTIVE", "INACTIVE"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status. Must be ACTIVE or INACTIVE",
        });
      }
      updateData.status = status;
    }

    const updated = await prisma.account.update({
      where: {
        accountNumber,
      },
      data: updateData,
    });

    return res.status(200).json({
      message: "Account updated successfully",
      account: updated,
    });
  } catch (error) {
    console.error("Error updating account:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
// DELETE /accounts/:accountNumber
export const deleteAccount = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;

  try {
    const existingAccount = await prisma.account.findFirst({
      where: {
        accountNumber,
        userId,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    await prisma.account.delete({
      where: {
        accountNumber,
      },
    });

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /accounts/:accountNumber/close
export const closeAccount = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;

  try {
    // First check if account exists and belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        accountNumber,
        userId,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if account is already closed
    if (existingAccount.status === "INACTIVE") {
      return res.status(400).json({ message: "Account is already closed" });
    }

    // Close the account by setting status to INACTIVE
    const closedAccount = await prisma.account.update({
      where: {
        accountNumber,
      },
      data: {
        status: "INACTIVE",
      },
    });

    return res.status(200).json({
      message: "Account closed successfully",
      account: closedAccount,
    });
  } catch (error) {
    console.error("Error closing account:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ message: "Account not found" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};
