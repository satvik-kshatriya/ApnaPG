import { Request, Response } from 'express';
import Property from '../models/Property.js';
import { PropertyCreateSchema, PropertyUpdateSchema } from '../schemas/propertySchema.js';
import mongoose from 'mongoose';

export const createProperty = async (req: Request, res: Response) => {
  try {
    const validatedData = PropertyCreateSchema.parse(req.body);
    
    // Map latitude/longitude to GeoJSON Point
    const propertyData = {
      ...validatedData,
      owner_id: req.user?._id,
      location: {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude]
      }
    };

    const property = new Property(propertyData);
    await property.save();

    return res.status(201).json(property);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      console.error('❌ [DEBUG] Create Validation Failed:', JSON.stringify(err.errors, null, 2));
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      console.error('❌ [MONGOOSE] Validation Failed:', err.message);
      return res.status(400).json({ error: 'Database Validation Error', details: err.message });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const listProperties = async (req: Request, res: Response) => {
  try {
    const { locality, min_rent, max_rent, occupancy_type, occupancy, lat, lng, limit = 20, skip = 0 } = req.query;

    console.log(`🔍 [DEBUG] Properties Search:`, { locality, min_rent, max_rent, occupancy_type, occupancy });

    const query: any = {};

    // 1. Text/Regex filtering
    if (locality) {
      query.locality = { $regex: locality, $options: 'i' };
    }

    // 2. Rent range
    if (min_rent || max_rent) {
      query.monthly_rent = {};
      if (min_rent) query.monthly_rent.$gte = Number(min_rent);
      if (max_rent) query.monthly_rent.$lte = Number(max_rent);
    }

    // 3. Occupancy (Support both keys for robustness)
    const activeOccupancy = (occupancy_type || occupancy) as string;
    if (activeOccupancy) {
      query.occupancy_type = activeOccupancy;
    }

    console.log(`🎯 [DEBUG] Mongo Query Object:`, JSON.stringify(query, null, 2));

    // 4. Proximity Search (GeoJSON $near)
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: 10000 // 10km radius default
        }
      };
    }

    const properties = await Property.find(query)
      .sort({ created_at: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('owner_id', 'full_name email profile_image_url');

    return res.json(properties);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const listOwnerProperties = async (req: Request, res: Response) => {
  try {
    const owner_id = req.user?._id;
    if (!owner_id) {
       return res.status(401).json({ error: "Unauthorized", message: "Owner ID not found in session" });
    }

    const properties = await Property.find({ owner_id })
      .sort({ created_at: -1 })
      .populate('owner_id', 'full_name email profile_image_url');

    console.log(`🏠 [DEBUG] Found ${properties.length} properties for Owner ID: [${owner_id}]`);
    return res.json(properties);
  } catch (err: any) {
    console.error('🔥 [500 ERROR] listOwnerProperties Crash:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const getProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner_id', 'full_name email profile_image_url');

    if (!property) {
      return res.status(404).json({ error: 'Not Found', message: 'Property not found' });
    }

    return res.json(property);
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const updateProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Not Found' });
    }

    // Ownership check
    if (property.owner_id.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized to edit this listing' });
    }

    const validatedData = PropertyUpdateSchema.parse(req.body);
    
    // 3. Handle location update if lat/lng are provided
    if (validatedData.latitude !== undefined || validatedData.longitude !== undefined) {
      const lat = validatedData.latitude ?? property.location.coordinates[1];
      const lng = validatedData.longitude ?? property.location.coordinates[0];
      (property as any).location = {
        type: 'Point',
        coordinates: [lng, lat]
      };
    }

    // 4. Update other fields explicitly
    if (validatedData.title !== undefined) property.title = validatedData.title;
    if (validatedData.description !== undefined) property.description = validatedData.description;
    if (validatedData.locality !== undefined) property.locality = validatedData.locality;
    if (validatedData.monthly_rent !== undefined) property.monthly_rent = validatedData.monthly_rent;
    if (validatedData.occupancy_type !== undefined) property.occupancy_type = validatedData.occupancy_type;
    if (validatedData.house_rules !== undefined) property.house_rules = validatedData.house_rules;
    if (validatedData.images !== undefined) property.images = validatedData.images;

    await property.save();

    return res.json(property);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      console.error('❌ [DEBUG] Update Validation Failed:', JSON.stringify(err.errors, null, 2));
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      console.error('❌ [MONGOOSE] Validation Failed:', err.message);
      return res.status(400).json({ error: 'Database Validation Error', details: err.message });
    }
    console.error('🔥 [500 ERROR] Property Update Crash:', err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Not Found' });
    }

    // Ownership check
    if (property.owner_id.toString() !== req.user?._id?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden', message: 'Not authorized to delete this listing' });
    }

    // Delete the property. 
    // The CASCADING DELETE middleware in Property.ts will automatically handle Connection cleanup.
    await Property.deleteOne({ _id: req.params.id });
    
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
