import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyImage {
  url: string;
  is_cover: boolean;
}

export interface IProperty extends Document {
  owner_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  locality: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  monthly_rent: number;
  occupancy_type: 'single' | 'double' | 'triple';
  is_verified_owner: boolean;
  house_rules?: Record<string, any>;
  images: IPropertyImage[];
  created_at: Date;
}

const PropertySchema: Schema = new Schema({
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, minlength: 1, maxlength: 255 },
  description: { type: String, default: '' },
  locality: { type: String, required: true, index: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  monthly_rent: { type: Number, required: true, min: 0 },
  occupancy_type: { 
    type: String, 
    enum: ['single', 'double', 'triple'], 
    required: true 
  },
  is_verified_owner: { type: Boolean, default: false },
  house_rules: { type: Schema.Types.Mixed },
  images: [{
    url: { type: String, required: true },
    is_cover: { type: Boolean, default: false }
  }],
  created_at: { type: Date, default: Date.now }
});

// Implementation of 2dsphere index for proximity searching
PropertySchema.index({ location: '2dsphere' });
PropertySchema.index({ monthly_rent: 1 });

// CASCADING DELETE: Automatically remove connections when a property is deleted
PropertySchema.pre(['deleteOne', 'findOneAndDelete'], { document: false, query: true }, async function() {
  const propertyId = this.getQuery()._id;
  if (!propertyId) return;

  try {
    const Connection = mongoose.model('Connection');
    console.log(`🧹 Middleware: Cascading delete for connections linked to property [${propertyId}]`);
    await Connection.deleteMany({ property_id: propertyId });
  } catch (err: any) {
    console.error('❌ Cascading delete failed:', err.message);
    throw err; // Re-throw to prevent deletion if cascade fails
  }
});

export default mongoose.model<IProperty>('Property', PropertySchema);
