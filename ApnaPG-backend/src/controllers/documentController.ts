import { Request, Response } from 'express';
import Connection from '../models/Connection.js';
import { generateLeasePDF } from '../services/pdfService.js';

export const downloadLease = async (req: Request, res: Response) => {
  try {
    const connectionId = req.params.connection_id as string;

    // 1. Fetch connection with deep population
    const connection = await Connection.findById(connectionId)
      .populate('tenant_id')
      .populate({
        path: 'property_id',
        populate: { path: 'owner_id' }
      });

    if (!connection) {
      return res.status(404).json({ error: 'Not Found', message: 'Connection record not found' });
    }

    // 2. Identify parties
    const tenant = connection.tenant_id as any;
    const property = connection.property_id as any;
    const owner = property.owner_id as any;

    if (!tenant || !property || !owner) {
      return res.status(400).json({ error: 'Bad Request', message: 'Incomplete connection data for document generation' });
    }

    // 3. Security Gating
    const userId = req.user?._id?.toString();
    const isTenant = tenant._id.toString() === userId;
    const isOwner = owner._id.toString() === userId;
    const isAdmin = req.user?.role === 'admin';

    if (!isTenant && !isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to access this document.' });
    }

    // 4. Status Check
    if (!['accepted', 'active_tenancy', 'ended'].includes(connection.status)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: `Agreements can only be generated for accepted or active tenancies (Current status: ${connection.status}).` 
      });
    }

    // 5. Generate PDF
    const pdfBuffer = await generateLeasePDF(tenant, owner, property);

    // 6. Set Response Headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Lease_Agreement_${connectionId.substring(0, 8)}.pdf"`);
    
    // 7. Send the buffer
    return res.send(pdfBuffer);

  } catch (err: any) {
    console.error('PDF Download Error:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
