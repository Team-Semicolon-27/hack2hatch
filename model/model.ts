import mongoose, { Model, Schema, Document } from "mongoose";

export interface Entrepreneur extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  profileImage: string;
  isVerified: boolean;
  verificationCode: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  notionsOwnerOf: mongoose.Schema.Types.ObjectId[];
  notionsPartOf: mongoose.Schema.Types.ObjectId[];
  followers: mongoose.Schema.Types.ObjectId[];
  followings: mongoose.Schema.Types.ObjectId[];
  mFollowers: mongoose.Schema.Types.ObjectId[];
  mFollowings: mongoose.Schema.Types.ObjectId[];
}

const EntrepreneurSchema: Schema<Entrepreneur> = new Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    notionsOwnerOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    notionsPartOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    mFollowers: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    mFollowings: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
  },
  { timestamps: true }
);

export interface Mentor extends Entrepreneur {}

const MentorSchema: Schema<Mentor> = new Schema(
  {
    ...EntrepreneurSchema.obj,
  },
  { timestamps: true }
);

export interface Notion extends Document {
  owner: mongoose.Schema.Types.ObjectId;
  title: string;
  logo: string;
  description: string;
  members: mongoose.Schema.Types.ObjectId[];
  mentors: mongoose.Schema.Types.ObjectId[];
  blogs: mongoose.Schema.Types.ObjectId[];
  teamMembers: mongoose.Schema.Types.ObjectId[];
}

const NotionSchema: Schema<Notion> = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "Entrepreneur", required: true },
    title: { type: String, required: true },
    logo: { type: String, required: true },
    description: { type: String, required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    mentors: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    blogs: [{ type: Schema.Types.ObjectId, ref: "Blog" }],
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }, { type: Schema.Types.ObjectId, ref: "Mentor" }],
  },
  { timestamps: true }
);

export interface Blog extends Document {
  author: mongoose.Schema.Types.ObjectId;
  notionId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  attachments: string[];
  likes: mongoose.Schema.Types.ObjectId[];
  comments: mongoose.Schema.Types.ObjectId[];
  links: string[];
  tags: string[];
}

const BlogSchema: Schema<Blog> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Entrepreneur", required: true },
    notionId: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }, { type: Schema.Types.ObjectId, ref: "Mentor" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    links: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export interface Comment extends Document {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
  likes: mongoose.Schema.Types.ObjectId[];
}

const CommentSchema: Schema<Comment> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Entrepreneur", required: true },
    content: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }, { type: Schema.Types.ObjectId, ref: "Mentor" }],
  },
  { timestamps: true }
);

export const EntrepreneurModel: Model<Entrepreneur> =
  mongoose.models.Entrepreneur || mongoose.model<Entrepreneur>("Entrepreneur", EntrepreneurSchema);

export const MentorModel: Model<Mentor> =
  mongoose.models.Mentor || mongoose.model<Mentor>("Mentor", MentorSchema);

export const NotionModel: Model<Notion> =
  mongoose.models.Notion || mongoose.model<Notion>("Notion", NotionSchema);

export const BlogModel: Model<Blog> =
  mongoose.models.Blog || mongoose.model<Blog>("Blog", BlogSchema);

export const CommentModel: Model<Comment> =
  mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);
