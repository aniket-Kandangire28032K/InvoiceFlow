import Client from "../model/Client.js"
import Invoice from '../model/Invoice.js'

// GET /api/clients
export const getClients = async (req, res) => {
  try {
    const { search } = req.query;

    const filter = {
      userId: req.user._id,
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      clients,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clients",
      error: error.message,
    });
  }
};

// GET /api/clients/:id
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    res.status(200).json({
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch client",
      error: error.message,
    });
  }
};

// POST /api/clients
export const createClient = async (req, res) => {
  try {
    const {
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Client name is required",
      });
    }

    const client = await Client.create({
      userId: req.user._id,
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber,
    });

    res.status(201).json({
      message: "Client created successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create client",
      error: error.message,
    });
  }
};

// PUT /api/clients/:id
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const {
      name,
      companyName,
      email,
      phone,
      billingAddress,
      gstNumber,
    } = req.body;

    client.name = name ?? client.name;
    client.companyName = companyName ?? client.companyName;
    client.email = email ?? client.email;
    client.phone = phone ?? client.phone;
    client.billingAddress =
      billingAddress ?? client.billingAddress;
    client.gstNumber = gstNumber ?? client.gstNumber;

    await client.save();

    res.status(200).json({
      message: "Client updated successfully",
      client,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update client",
      error: error.message,
    });
  }
};

// DELETE /api/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!client) {
      return res.status(404).json({
        message: "Client not found",
      });
    }

    const invoiceExists = await Invoice.exists({
      clientId: client._id,
      userId: req.user._id,
    });

    if (invoiceExists) {
      return res.status(409).json({
        message:
          "Cannot delete client because invoices already exist for this client",
      });
    }

    await client.deleteOne();

    res.status(200).json({
      message: "Client deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete client",
      error: error.message,
    });
  }
};