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
  mentorFollowers: mongoose.Schema.Types.ObjectId[];
  mentorFollowings: mongoose.Schema.Types.ObjectId[];
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
    mentorFollowers: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    mentorFollowings: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
  },
  { timestamps: true }
);

export interface Mentor extends Document {
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
  mentorFollowers: mongoose.Schema.Types.ObjectId[];
  mentorFollowings: mongoose.Schema.Types.ObjectId[];
}

const MentorSchema: Schema<Mentor> = new Schema(
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
    mentorFollowers: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    mentorFollowings: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
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
  blogsE: mongoose.Schema.Types.ObjectId[];
  blogsM: mongoose.Schema.Types.ObjectId[];
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
    blogsE: [{ type: Schema.Types.ObjectId, ref: "BlogE" }],
    teamMembers: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    blogsM: [{ type: Schema.Types.ObjectId, ref: "BlogM" }],
  },
  { timestamps: true }
);

export interface BlogE extends Document {
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

const BlogESchema: Schema<BlogE> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Entrepreneur" },
    notionId: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    likes: [
      {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "likes.userType" },
        userType: { type: String, enum: ["Entrepreneur", "Mentor"], required: true },
      },
    ],
    
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    links: [{ type: String }],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export interface BlogM extends Document {
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

const BlogMSchema: Schema<BlogM> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Mentor" },
    notionId: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    likes: [
      {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "likes.userType" },
        userType: { type: String, enum: ["Entrepreneur", "Mentor"], required: true },
      },
    ],
    
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
    likes: [
      {
        user: { type: Schema.Types.ObjectId, required: true, refPath: "likes.userType" },
        userType: { type: String, enum: ["Entrepreneur", "Mentor"], required: true },
      },
    ],
    
  },
  { timestamps: true }
);

export interface News extends Document {
  platform: string;
  title: string;
  type: string;
  content: string;
  url: string;
  timestamp: Date;
}

const NewsSchema: Schema<News> = new Schema(
  {
    platform: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    url: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true }
);

export const NewsModel: Model<News> =
  mongoose.models.News || mongoose.model<News>("News", NewsSchema);

export const EntrepreneurModel: Model<Entrepreneur> =
  mongoose.models.Entrepreneur || mongoose.model<Entrepreneur>("Entrepreneur", EntrepreneurSchema);

export const MentorModel: Model<Mentor> =
  mongoose.models.Mentor || mongoose.model<Mentor>("Mentor", MentorSchema);

export const NotionModel: Model<Notion> =
  mongoose.models.Notion || mongoose.model<Notion>("Notion", NotionSchema);

export const BlogEModel: Model<BlogE> =
  mongoose.models.BlogE || mongoose.model<BlogE>("BlogE", BlogESchema);

export const BlogMModel: Model<BlogM> =
  mongoose.models.BlogM || mongoose.model<BlogM>("BlogM", BlogMSchema);

export const CommentModel: Model<Comment> =
  mongoose.models.Comment || mongoose.model<Comment>("Comment", CommentSchema);
