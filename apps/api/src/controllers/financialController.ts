// ============================================
// FINANCIAL CONTROLLER - FOLIOS & TRANSACTIONS
// ============================================

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest, asyncHandler } from '../utils/auth';

const prisma = new PrismaClient();

// ============================================
// FOLIO MANAGEMENT
// ============================================

export const createFolio = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    bookingId,
    status = 'OPEN'
  } = req.body;

  const folio = await prisma.folio.create({
    data: {
      bookingId,
      status,
      currentBalance: 0,
    },
    include: {
      booking: {
        select: {
          id: true,
          bookingReferenceId: true,
          roomId: true,
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Folio created successfully',
    data: { folio },
  });
});

export const getFolios = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId, status } = req.query;

  const where: any = {};
  if (bookingId) where.bookingId = bookingId as string;
  if (status) where.status = status as string;

  const folios = await prisma.folio.findMany({
    where,
    include: {
      booking: {
        select: {
          id: true,
          bookingReferenceId: true,
          roomId: true,
        }
      },
      transactions: {
        orderBy: { postedAt: 'desc' },
        take: 5,
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: { folios },
  });
});

export const getFolioById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      success: false,
      error: 'Folio ID is required'
    });
    return;
  }

  const folio = await prisma.folio.findUnique({
    where: { id },
    include: {
      booking: {
        select: {
          id: true,
          bookingReferenceId: true,
          checkinDate: true,
          checkoutDate: true,
        }
      },
      transactions: {
        orderBy: { postedAt: 'desc' },
      },
      invoices: {
        orderBy: { createdAt: 'desc' },
      }
    },
  });

  if (!folio) {
    res.status(404).json({
      success: false,
      error: 'Folio not found'
    });
    return;
  }

  res.json({
    success: true,
    data: { folio },
  });
});

// ============================================
// TRANSACTION MANAGEMENT
// ============================================

export const createTransaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    folioId,
    transactionType,
    amount,
    description,
    referenceNumber,
    paymentMethodId
  } = req.body;

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

  // Start transaction to update folio balance
  const result = await prisma.$transaction(async (tx) => {
    // Create transaction
    const transaction = await tx.transaction.create({
      data: {
        folioId,
        transactionType,
        amount: parseFloat(amount),
        description,
        referenceNumber,
        paymentMethodId,
        postedBy: userId,
      },
    });

    // Update folio balance
    const currentFolio = await tx.folio.findUnique({
      where: { id: folioId }
    });

    if (!currentFolio) {
      throw new Error('Folio not found');
    }

    const balanceChange = transactionType === 'CHARGE' ? amount : -amount;
    const newBalance = Number(currentFolio.currentBalance) + parseFloat(balanceChange);

    await tx.folio.update({
      where: { id: folioId },
      data: { 
        currentBalance: newBalance,
        updatedAt: new Date(),
      },
    });

    return transaction;
  });

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction: result },
  });
});

export const getTransactions = asyncHandler(async (req: Request, res: Response) => {
  const { folioId, transactionType, dateFrom, dateTo } = req.query;

  const where: any = {};
  if (folioId) where.folioId = folioId as string;
  if (transactionType) where.transactionType = transactionType as string;
  
  if (dateFrom || dateTo) {
    where.postedAt = {};
    if (dateFrom) where.postedAt.gte = new Date(dateFrom as string);
    if (dateTo) where.postedAt.lte = new Date(dateTo as string);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      folio: {
        select: {
          id: true,
          booking: {
            select: {
              bookingReferenceId: true,
              roomId: true,
            }
          }
        }
      },
      paymentMethod: {
        select: {
          id: true,
          name: true,
          code: true,
        }
      }
    },
    orderBy: { postedAt: 'desc' },
  });

  res.json({
    success: true,
    data: { transactions },
  });
});

// ============================================
// INVOICE MANAGEMENT (Using Transaction records)
// ============================================

export const createInvoice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    folioId,
    dueDate,
    notes
  } = req.body;

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

  // Get folio with transactions to calculate amounts
  const folio = await prisma.folio.findUnique({
    where: { id: folioId },
    include: {
      transactions: {
        where: {
          transactionType: 'CHARGE',
        }
      }
    }
  });

  if (!folio) {
    res.status(404).json({
      success: false,
      error: 'Folio not found'
    });
    return;
  }

  // Calculate totals
  const totalAmount = folio.transactions.reduce((sum: number, t: any) => 
    sum + Number(t.amount), 0
  );

  // Create an invoice transaction record
  const invoice = await prisma.transaction.create({
    data: {
      folioId,
      transactionType: 'CHARGE',
      description: `Invoice - ${notes || 'Generated'}`,
      amount: totalAmount,
      referenceNumber: `INV-${Date.now()}`,
      postedBy: userId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: { invoice },
  });
});

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { folioId, dateFrom, dateTo } = req.query;

  const where: any = {
    description: {
      startsWith: 'Invoice -',
    }
  };
  
  if (folioId) where.folioId = folioId as string;
  
  if (dateFrom || dateTo) {
    where.postedAt = {};
    if (dateFrom) where.postedAt.gte = new Date(dateFrom as string);
    if (dateTo) where.postedAt.lte = new Date(dateTo as string);
  }

  const invoices = await prisma.transaction.findMany({
    where,
    include: {
      folio: {
        select: {
          id: true,
          booking: {
            select: {
              bookingReferenceId: true,
              roomId: true,
            }
          }
        }
      }
    },
    orderBy: { postedAt: 'desc' },
  });

  res.json({
    success: true,
    data: { invoices },
  });
});

// ============================================
// PAYMENT PROCESSING
// ============================================

export const processPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    folioId,
    amount,
    paymentMethodId,
    referenceNumber,
    notes
  } = req.body;

  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
    return;
  }

  // Create payment transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment transaction
    const transaction = await tx.transaction.create({
      data: {
        folioId,
        transactionType: 'PAYMENT',
        amount: parseFloat(amount),
        description: `Payment ${notes ? '- ' + notes : ''}`,
        referenceNumber,
        paymentMethodId,
        postedBy: userId,
      },
    });

    // Update folio balance
    const currentFolio = await tx.folio.findUnique({
      where: { id: folioId }
    });

    if (!currentFolio) {
      throw new Error('Folio not found');
    }

    const newBalance = Number(currentFolio.currentBalance) - parseFloat(amount);

    await tx.folio.update({
      where: { id: folioId },
      data: { 
        currentBalance: newBalance,
        updatedAt: new Date(),
      },
    });

    return transaction;
  });

  res.status(201).json({
    success: true,
    message: 'Payment processed successfully',
    data: { transaction: result },
  });
});
