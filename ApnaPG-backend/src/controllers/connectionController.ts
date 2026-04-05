import { Request, Response } from 'express';
import Connection from '../models/Connection.js';
import Property from '../models/Property.js';
import { ConnectionCreateSchema, ConnectionStatusUpdateSchema } from '../schemas/connectionSchema.js';

export const createConnection = async (req: Request, res: Response) => {
  try {
    const validatedData = ConnectionCreateSchema.parse(req.body);
    const tenant_id = req.user?._id;

    // 1. Check for duplicate pending/active connections
    const existing = await Connection.findOne({
      tenant_id,
      property_id: validatedData.property_id,
      status: { $in: ['pending', 'accepted', 'active_tenancy'] }
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: `You already have an active request/connection (status: ${existing.status}) for this property.` 
      });
    }

    // 2. Verify property exists
    const property = await Property.findById(validatedData.property_id);
    if (!property) {
      return res.status(404).json({ error: 'Not Found', message: 'Property not found' });
    }

    // 3. Create connection
    const connection = new Connection({
      tenant_id,
      property_id: validatedData.property_id,
      status: 'pending'
    });

    await connection.save();
    return res.status(201).json(connection);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const listMyConnections = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const role = req.user?.role;

    let connections;

    if (role === 'tenant') {
      connections = await Connection.find({ tenant_id: userId })
        .populate('property_id')
        .populate({
          path: 'property_id',
          populate: { path: 'owner_id', select: 'full_name email phone_number' }
        })
        .sort({ created_at: -1 });
    } else {
      // Owner: Find connections for properties they own
      const myProperties = await Property.find({ owner_id: userId }).select('_id');
      const propertyIds = myProperties.map(p => p._id);

      connections = await Connection.find({ property_id: { $in: propertyIds } })
        .populate('tenant_id', 'full_name email phone_number profile_image_url')
        .populate('property_id')
        .sort({ created_at: -1 });
    }

    // Mask phone numbers if not accepted/active/ended (like in original backend)
    const enriched = connections.map((conn: any) => {
      const revealContact = ['accepted', 'active_tenancy', 'ended'].includes(conn.status);
      const plain = conn.toObject();

      if (!revealContact) {
        if (plain.tenant_id) delete plain.tenant_id.phone_number;
        if (plain.property_id?.owner_id) delete plain.property_id.owner_id.phone_number;
      }

      return plain;
    });

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const updateConnectionStatus = async (req: Request, res: Response) => {
  try {
    const { status } = ConnectionStatusUpdateSchema.parse(req.body);
    const userId = req.user?._id;

    const connection = await Connection.findById(req.params.id).populate('property_id');
    if (!connection) {
      return res.status(404).json({ error: 'Not Found' });
    }

    const prop = connection.property_id as any;
    const isOwner = prop.owner_id.toString() === userId?.toString();
    const isTenant = connection.tenant_id.toString() === userId?.toString();

    // 1. Authorization: Only owners can accept/reject
    if (['accepted', 'rejected'].includes(status) && !isOwner) {
      return res.status(403).json({ error: 'Forbidden', message: 'Only properties owners can accept or reject requests.' });
    }

    // 2. Authorization: Only owners can set to active_tenancy
    if (status === 'active_tenancy' && !isOwner) {
       return res.status(403).json({ error: 'Forbidden', message: 'Only owners can activate tenancies.' });
    }

    // 3. Authorization: Either party can end an active tenancy
    if (status === 'ended' && !isOwner && !isTenant) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Update status and dates
    connection.status = status;
    if (status === 'accepted' && !connection.tenancy_start_date) {
      connection.tenancy_start_date = new Date();
    }
    if (status === 'ended' && !connection.tenancy_end_date) {
      connection.tenancy_end_date = new Date();
    }

    await connection.save();
    return res.json(connection);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
