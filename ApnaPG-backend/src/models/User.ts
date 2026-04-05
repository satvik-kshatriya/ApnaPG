import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerk_id: string;
  role: 'tenant' | 'owner' | 'admin';
  full_name: string;
  email: string;
  phone_number?: string;
  profile_image_url?: string;
  occupation?: string;
  gender?: string;
  bio?: string;
  hometown?: string;
  verified: boolean;
  created_at: Date;
}

const UserSchema: Schema = new Schema({
  clerk_id: { type: String, required: true, unique: true, index: true },
  role: { 
    type: String, 
    enum: ['tenant', 'owner', 'admin'], 
    required: true,
    default: 'tenant'
  },
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone_number: { type: String },
  profile_image_url: { type: String },
  occupation: { type: String },
  gender: { type: String },
  bio: { type: String },
  hometown: { type: String },
  verified: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
