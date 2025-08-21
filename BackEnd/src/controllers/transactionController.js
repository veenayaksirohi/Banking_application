import prisma from "../configs/prisma.js";

// GET /accounts/:accountNumber/transactions
export const getTransactions = async (req, res) => {
  const { accountNumber } = req.params;
  const userId = req.user.userId;

  try {
    // First verify the account belongs to the user
    const account = await prisma.account.findFirst({
      where: {
        accountNumber,
        userId,
      },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        accountNumber,
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    if (transactions.length === 0) {
      return res.status(200).json({
        message: "No transactions found for this account",
        transactions: [],
      });
    }

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /accounts/:accountNumber/transactions/deposit
export const deposit = async (req, res) => {
  const { accountNumber } = req.params;
  const { amount, description } = req.body;
  const userId = req.user.userId;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { accountNumber, userId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const newBalance = parseFloat(account.balance) + parseFloat(amount);

    // Create transaction and update balance in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          accountNumber,
          type: "DEPOSIT",
          amount: parseFloat(amount),
          balanceAfter: newBalance,
          description,
        },
      });

      await tx.account.update({
        where: { accountNumber },
        data: { balance: newBalance },
      });

      return transaction;
    });

    return res.status(201).json({
      message: "Deposit successful",
      transaction: result,
    });
  } catch (error) {
    console.error("Error processing deposit:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /accounts/:accountNumber/transactions/withdraw
export const withdraw = async (req, res) => {
  const { accountNumber } = req.params;
  const { amount, description } = req.body;
  const userId = req.user.userId;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { accountNumber, userId },
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (parseFloat(account.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const newBalance = parseFloat(account.balance) - parseFloat(amount);

    // Create transaction and update balance
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          accountNumber,
          type: "WITHDRAWAL",
          amount: parseFloat(amount),
          balanceAfter: newBalance,
          description,
        },
      });

      await tx.account.update({
        where: { accountNumber },
        data: { balance: newBalance },
      });

      return transaction;
    });

    return res.status(201).json({
      message: "Withdrawal successful",
      transaction: result,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /accounts/:accountNumber/transactions/transfer
export const transfer = async (req, res) => {
  const { accountNumber } = req.params;
  const { toAccountNumber, amount, description } = req.body;
  const userId = req.user.userId;

  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    if (!toAccountNumber) {
      return res
        .status(400)
        .json({ message: "Destination account number is required" });
    }

    if (String(accountNumber) === String(toAccountNumber)) {
      return res
        .status(400)
        .json({ message: "Cannot transfer to the same account" });
    }

    // Verify source account belongs to user
    const fromAccount = await prisma.account.findFirst({
      where: { accountNumber, userId },
    });

    if (!fromAccount) {
      return res.status(404).json({ message: "Source account not found" });
    }

    // Verify destination account exists (ensure it's a string)
    const toAccount = await prisma.account.findUnique({
      where: { accountNumber: String(toAccountNumber) },
    });

    if (!toAccount) {
      return res.status(404).json({ message: "Destination account not found" });
    }

    if (parseFloat(fromAccount.balance) < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const fromNewBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
    const toNewBalance = parseFloat(toAccount.balance) + parseFloat(amount);

    // Create both transactions and update both balances
    const result = await prisma.$transaction(async (tx) => {
      // Debit from source account
      const debitTransaction = await tx.transaction.create({
        data: {
          accountNumber,
          relatedAccountNumber: String(toAccountNumber),
          type: "TRANSFER",
          amount: -parseFloat(amount),
          balanceAfter: fromNewBalance,
          description: description || `Transfer to ${toAccountNumber}`,
        },
      });

      // Credit to destination account
      await tx.transaction.create({
        data: {
          accountNumber: String(toAccountNumber),
          relatedAccountNumber: accountNumber,
          type: "TRANSFER",
          amount: parseFloat(amount),
          balanceAfter: toNewBalance,
          description: description || `Transfer from ${accountNumber}`,
        },
      });

      // Update both account balances
      await tx.account.update({
        where: { accountNumber },
        data: { balance: fromNewBalance },
      });

      await tx.account.update({
        where: { accountNumber: String(toAccountNumber) },
        data: { balance: toNewBalance },
      });

      return debitTransaction;
    });

    return res.status(201).json({
      message: "Transfer successful",
      transaction: result,
    });
  } catch (error) {
    console.error("Error processing transfer:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
