import { Request, Response } from 'express';
import Review from '../models/Review.js';
import Connection from '../models/Connection.js';
import Property from '../models/Property.js';
import { ReviewCreateSchema } from '../schemas/reviewSchema.js';
import mongoose from 'mongoose';

export const createReview = async (req: Request, res: Response) => {
  try {
    const validatedData = ReviewCreateSchema.parse(req.body);
    const authorId = req.user?._id;

    // 1. Fetch connection & Gating Rules
    const connection = await Connection.findById(validatedData.connection_id).populate('property_id');
    if (!connection) {
      return res.status(404).json({ error: 'Not Found', message: 'Connection not found' });
    }

    if (!['active_tenancy', 'ended'].includes(connection.status)) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Reviews can only be submitted for active or ended tenancies.' 
      });
    }

    // 2. Identify parties
    const prop = connection.property_id as any;
    const tenantId = connection.tenant_id;
    const ownerId = prop.owner_id;

    const isTenant = tenantId.toString() === authorId?.toString();
    const isOwner = ownerId.toString() === authorId?.toString();

    if (!isTenant && !isOwner) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not part of this connection.' });
    }

    // 3. Verify target
    if (validatedData.target_user_id === authorId?.toString()) {
      return res.status(400).json({ error: 'Bad Request', message: 'You cannot review yourself.' });
    }

    // 4. Prevent duplicates
    const existing = await Review.findOne({
      connection_id: validatedData.connection_id,
      author_id: authorId
    });

    if (existing) {
      return res.status(400).json({ error: 'Bad Request', message: 'You have already reviewed this connection.' });
    }

    // 5. Create Review
    const review = new Review({
      ...validatedData,
      author_id: authorId
    });

    await review.save();
    return res.status(201).json(review);
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};

export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const targetUserId = new mongoose.Types.ObjectId(req.params.id as string);

    // Aggregate rating
    const stats = await Review.aggregate([
      { $match: { target_user_id: targetUserId } },
      { 
        $group: { 
          _id: '$target_user_id', 
          average_rating: { $avg: '$rating' },
          total_reviews: { $sum: 1 }
        } 
      }
    ]);

    const reviews = await Review.find({ target_user_id: targetUserId })
      .populate('author_id', 'full_name profile_image_url')
      .sort({ created_at: -1 });

    return res.json({
      user_id: targetUserId,
      average_rating: stats[0]?.average_rating || 0,
      total_reviews: stats[0]?.total_reviews || 0,
      reviews
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};
