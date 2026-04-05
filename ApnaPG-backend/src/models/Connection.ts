import mongoose, { Schema, Document } from 'mongoose';

export interface IConnection extends Document {
  tenant_id: mongoose.Types.ObjectId;
  property_id: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'active_tenancy' | 'ended';
  tenancy_start_date?: Date;
  tenancy_end_date?: Date;
  created_at: Date;
}

const ConnectionSchema: Schema = new Schema({
  tenant_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  property_id: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'active_tenancy', 'ended'], 
    default: 'pending',
    required: true,
    index: true
  },
  tenancy_start_date: { type: Date },
  tenancy_end_date: { type: Date },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IConnection>('Connection', ConnectionSchema);
