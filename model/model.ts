import mongoose, {Model, Schema} from "mongoose";

export interface Entrepreneur extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  profile: string;
  notionsOwnerOf: mongoose.Schema.Types.ObjectId[];
  notionsPartOf: mongoose.Schema.Types.ObjectId[];
  followers: mongoose.Schema.Types.ObjectId[];
  followings: mongoose.Schema.Types.ObjectId[];
  mFollowers: mongoose.Schema.Types.ObjectId[];
  mFollowings: mongoose.Schema.Types.ObjectId[];
}

const EntrepreneurSchema: Schema<Entrepreneur> = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profile: { type: String, required: true },
  notionsOwnerOf: [ { type: Schema.Types.ObjectId, ref: 'Notion' } ],
  notionsPartOf: [ { type: Schema.Types.ObjectId, ref: 'Notion' } ],
  followers: [ { type: Schema.Types.ObjectId, ref: 'Entrepreneur' } ],
  followings: [ { type: Schema.Types.ObjectId, ref: 'Entrepreneur' } ],
  mFollowers: [ { type: Schema.Types.ObjectId, ref: 'Mentor' } ],
  mFollowings: [ { type: Schema.Types.ObjectId, ref: 'Mentor' } ],
})


export inter
export const UserModel: Model<Entrepreneur> =
    mongoose.models.Entrepreneur || mongoose.model<Entrepreneur>("Entrepreneur", EntrepreneurSchema);