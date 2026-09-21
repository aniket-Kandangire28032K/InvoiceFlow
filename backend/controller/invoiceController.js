import Invoice from "../model/Invoice.js";
import Client from "../model/Client.js";

// Generate invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const latestInvoice = await Invoice.findOne({
    invoiceNumber: {
      $regex: `^INV-${year}-`,
    },
  }).sort({ invoiceNumber: -1 });

  let nextNumber = 1;

  if (latestInvoice) {
    const lastNumber = parseInt(
      latestInvoice.invoiceNumber.split("-")[2],
      10
    );

    nextNumber = lastNumber + 1;
  }

  return `INV-${year}-${String(nextNumber).padStart(3, "0")}`;
};

// Calculate invoice totals
const calculateTotals = (items, taxPercentage = 0, discount = 0) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);

    return {
      description: item.description,
      quantity,
      rate,
      amount: quantity * rate,
    };
  });

  const subtotal = calculatedItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const taxAmount =
    subtotal * (Number(taxPercentage) / 100);

  const grandTotal =
    subtotal + taxAmount - Number(discount);

  return {
    calculatedItems,
    subtotal,
    taxAmount,
    grandTotal,
  };
};

// POST /api/invoices
export const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      issueDate,
      dueDate,
      items,
      taxPercentage = 0,
      discount = 0,
      status = "Draft",
    } = req.body;

    if (!clientId || !dueDate || !items?.length) {
      return res.status(400).json({
        message:
          "Client, due date and at least one item are required",
      });
    }

    const client = await Client.findOne({
      _id: clientId,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const {
      calculatedItems,
      subtotal,
      taxAmount,
      grandTotal,
    } = calculateTotals(
      items,
      taxPercentage,
      discount
    );

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      userId: req.user._id,
      clientId,
      invoiceNumber,
      issueDate: issueDate || new Date(),
      dueDate,
      items: calculatedItems,
      subtotal,
      taxPercentage,
      taxAmount,
      discount,
      grandTotal,
      status,
    });

    res.status(201).json({
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

// GET /api/invoices
export const getInvoices = async (req, res) => {
  try {
    const {
      search,
      clientId,
      status,
      startDate,
      endDate,
    } = req.query;

    const filter = {
      userId: req.user._id,
    };

    if (clientId) {
      filter.clientId = clientId;
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.invoiceNumber = {
        $regex: search,
        $options: "i",
      };
    }

    if (startDate || endDate) {
      filter.issueDate = {};

      if (startDate) {
        filter.issueDate.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.issueDate.$lte = new Date(endDate);
      }
    }

    const invoices = await Invoice.find(filter)
      .populate("clientId", "name companyName email")
      .sort({ createdAt: -1 });

    // Update overdue status
    const now = new Date();

    for (const invoice of invoices) {
      if (
        invoice.status !== "Paid" &&
        new Date(invoice.dueDate) < now &&
        invoice.status !== "Overdue"
      ) {
        invoice.status = "Overdue";
        await invoice.save();
      }
    }

    res.status(200).json({
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

// Get One Invoice 
// GET /api/invoices/:id
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate(
      "clientId",
      "name companyName email phone billingAddress gstNumber"
    );

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (
      invoice.status !== "Paid" &&
      new Date(invoice.dueDate) < new Date()
    ) {
      invoice.status = "Overdue";
      await invoice.save();
    }

    res.status(200).json({
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error.message,
    });
  }
};

// Update Invoice 
// PUT /api/invoices/:id
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    const {
      clientId,
      issueDate,
      dueDate,
      items,
      taxPercentage,
      discount,
      status,
    } = req.body;

    if (clientId) {
      const client = await Client.findOne({
        _id: clientId,
        userId: req.user._id,
      });

      if (!client) {
        return res.status(404).json({
          message: "Client not found",
        });
      }

      invoice.clientId = clientId;
    }

    if (items) {
      const totals = calculateTotals(
        items,
        taxPercentage ?? invoice.taxPercentage,
        discount ?? invoice.discount
      );

      invoice.items = totals.calculatedItems;
      invoice.subtotal = totals.subtotal;
      invoice.taxAmount = totals.taxAmount;
      invoice.grandTotal = totals.grandTotal;
    }

    if (taxPercentage !== undefined) {
      invoice.taxPercentage = Number(taxPercentage);
    }

    if (discount !== undefined) {
      invoice.discount = Number(discount);
    }

    if (issueDate) {
      invoice.issueDate = issueDate;
    }

    if (dueDate) {
      invoice.dueDate = dueDate;
    }

    if (status) {
      invoice.status = status;
    }

    await invoice.save();

    res.status(200).json({
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update invoice",
      error: error.message,
    });
  }
}; 

// DELETE /api/invoices/:id
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    await invoice.deleteOne();

    res.status(200).json({
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
};