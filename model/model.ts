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
  interestedTopics:string[];
  resetPasswordExpires?: Date;
  blogs: mongoose.Schema.Types.ObjectId[];
  notionsOwnerOf: mongoose.Schema.Types.ObjectId[];
  notionsPartOf: mongoose.Schema.Types.ObjectId[];
  followers: mongoose.Schema.Types.ObjectId[];
  followings: mongoose.Schema.Types.ObjectId[];
  mentorFollowers: mongoose.Schema.Types.ObjectId[];
  mentorFollowings: mongoose.Schema.Types.ObjectId[];
  notifications: mongoose.Schema.Types.ObjectId[];
  notificationCount: number;
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
    interestedTopics:[{type:String,required:true}],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    blogs: [ { type: Schema.Types.ObjectId, ref: 'BlogE' } ],
    notionsOwnerOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    notionsPartOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    mentorFollowers: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    mentorFollowings: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    notificationCount: { type: Number, default: 0 },
    notifications: [ { type: Schema.Types.ObjectId, ref: "Notification" }],
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
  blogs: mongoose.Schema.Types.ObjectId[];
  notionsOwnerOf: mongoose.Schema.Types.ObjectId[];
  notionsPartOf: mongoose.Schema.Types.ObjectId[];
  followers: mongoose.Schema.Types.ObjectId[];
  followings: mongoose.Schema.Types.ObjectId[];
  mentorFollowers: mongoose.Schema.Types.ObjectId[];
  mentorFollowings: mongoose.Schema.Types.ObjectId[];
  notifications: mongoose.Schema.Types.ObjectId[];
  notificationCount: number;
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
    blogs: [ { type: Schema.Types.ObjectId, ref: 'BlogM' } ],
    notionsOwnerOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    notionsPartOf: [{ type: Schema.Types.ObjectId, ref: "Notion" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    followings: [{ type: Schema.Types.ObjectId, ref: "Entrepreneur" }],
    mentorFollowers: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    mentorFollowings: [{ type: Schema.Types.ObjectId, ref: "Mentor" }],
    notificationCount: { type: Number, default: 0 },
    notifications: [ { type: Schema.Types.ObjectId, ref: "Notification" }],
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
  aiDescription: string;
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
    aiDescription: { type: String },
  },
  { timestamps: true }
);

NotionSchema.index({ title: 'text', description: 'text', aiDescription: 'text' });
export interface BlogE extends Document {
  author: mongoose.Schema.Types.ObjectId;
  notionId: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  attachments: string[];
  likes: mongoose.Schema.Types.ObjectId[];
  comments: mongoose.Schema.Types.ObjectId[];
  mentorComments: mongoose.Schema.Types.ObjectId[];
  links: string[];
  tags: string[];
  blogAI: string;
}

const BlogESchema: Schema<BlogE> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Entrepreneur" },
    notionId: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    likes: [ { type: Schema.Types.ObjectId, }, ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    mentorComments: [{ type: Schema.Types.ObjectId, ref: "MentorComment" }],
    links: [{ type: String }],
    tags: [{ type: String }],
    blogAI: { type: String },
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
  mentorComments: mongoose.Types.ObjectId[];
  links: string[];
  tags: string[];
  blogAI: string;
}

const BlogMSchema: Schema<BlogM> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Mentor" },
    notionId: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    attachments: [{ type: String }],
    likes: [ { type: Schema.Types.ObjectId } ],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    mentorComments: [{ type: Schema.Types.ObjectId, ref: "MentorComment" }],
    links: [{ type: String }],
    tags: [{ type: String }],
    blogAI: { type: String },
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
    likes: [],
  },
  { timestamps: true }
);


export interface MentorComment extends Document {
  author: mongoose.Schema.Types.ObjectId;
  content: string;
  likes: mongoose.Schema.Types.ObjectId[];
}

const MentorCommentSchema: Schema<Comment> = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "Mentor", required: true },
    content: { type: String, required: true },
    likes: [],
  },
  { timestamps: true }
);


interface Notification extends Document {
  message: string;
  link: string;
}

const NotificationSchema: Schema<Notification> = new Schema(
  {
    message: { type: String, required: true },
    link: { type: String, required: true },
  },
  { timestamps: true }
)


export interface News extends Document {
  platform: string;
  title: string;
  type: string;
  content: string;
  url: string;
  timestamp: Date;
  likes: number;
  comments: number;
  author: string;
  subreddit?:string;
  isVectored: boolean;
}
const NewsSchema: Schema<News> = new Schema(
  {
    platform: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    content: { type: String, required: true },
    url: { type: String, required: true },
    timestamp: { type: Date, required: true },
    likes: { type: Number, required: true, default: 0 },
    comments: { type: Number, required: true, default: 0 },
    author: { type: String, required: true },
    subreddit:{type:String,required:false},
    isVectored: { type: Boolean, required: true, default: false}},
  { timestamps: true }
);


export interface aiBlogger extends Document {
  textToPassToAi: {
    id: mongoose.Schema.Types.ObjectId;
    text: string;
  }[];
}

const aiBloggerSchema: Schema<aiBlogger> = new Schema(
  {
    textToPassToAi: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Notion", required: true },
        text: { type: String, required: true }
      }
    ]
  }
);
export const aiBloggerModel: Model<aiBlogger> =
  mongoose.models.aiBlogger || mongoose.model<aiBlogger>("aiBlogger", aiBloggerSchema);

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

export const MentorCommentModel: Model<MentorComment> =
  mongoose.models.MentorComment || mongoose.model<MentorComment>("MentorComment", MentorCommentSchema);

export const NotificationModel: Model<Notification> =
  mongoose.models.Notification || mongoose.model<Notification>("Notification", NotificationSchema);