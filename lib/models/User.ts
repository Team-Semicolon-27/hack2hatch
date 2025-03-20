import mongoose, { Schema, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  isVerified: boolean;
  verificationCode: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String, required: true },
  resetPasswordToken: { type: String },
 resetPasswordExpires: { type: Date },
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
