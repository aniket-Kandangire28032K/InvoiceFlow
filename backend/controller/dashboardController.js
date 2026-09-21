import Invoice from "../model/Invoice.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const invoices = await Invoice.find({ userId });

    let totalBilled = 0;
    let totalPaid = 0;
    let outstanding = 0;

    for (const invoice of invoices) {
      totalBilled += invoice.grandTotal;

      if (invoice.status === "Paid") {
        totalPaid += invoice.grandTotal;
      } else {
        outstanding += invoice.grandTotal;
      }
    }

    const recentInvoices = await Invoice.find({ userId })
      .populate("clientId", "name companyName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      statistics: {
        totalInvoices: invoices.length,
        totalBilled,
        totalPaid,
        outstanding,
      },
      recentInvoices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard",
      error: error.message,
    });
  }
};