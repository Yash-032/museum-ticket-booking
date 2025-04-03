import mongoose, { Document, Schema, model, Model, Types } from 'mongoose';
import { z } from 'zod';

// User Model
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  languagePreference: string;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  languagePreference: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User as Model<IUser> || model<IUser>('User', userSchema);

// Exhibition Model
export interface IExhibition extends Document {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: Date;
  endDate: Date;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
}

const exhibitionSchema = new Schema<IExhibition>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isFeatured: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Exhibition = mongoose.models.Exhibition as Model<IExhibition> || model<IExhibition>('Exhibition', exhibitionSchema);

// Ticket Type Model
export interface ITicketType extends Document {
  name: string;
  description: string;
  price: number;
  color: string;
  includes: string[];
  isPopular: boolean;
  createdAt: Date;
}

const ticketTypeSchema = new Schema<ITicketType>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  color: { type: String, default: 'blue' },
  includes: { type: [String], default: [] },
  isPopular: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const TicketType = mongoose.models.TicketType as Model<ITicketType> || model<ITicketType>('TicketType', ticketTypeSchema);

// Ticket Model
export interface ITicket extends Document {
  userId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  exhibitionId?: Types.ObjectId;
  quantity: number;
  visitDate: Date;
  totalPrice: number;
  isPaid: boolean;
  paymentIntentId?: string;
  qrCodeData?: string;
  isUsed: boolean;
  createdAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ticketTypeId: { type: Schema.Types.ObjectId, ref: 'TicketType', required: true },
  exhibitionId: { type: Schema.Types.ObjectId, ref: 'Exhibition' },
  quantity: { type: Number, required: true, default: 1 },
  visitDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paymentIntentId: { type: String },
  qrCodeData: { type: String },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Ticket = mongoose.models.Ticket as Model<ITicket> || model<ITicket>('Ticket', ticketSchema);

// Conversation Model
export interface IConversation extends Document {
  userId?: Types.ObjectId;
  sessionId: string;
  language: string;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  language: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now }
});

export const Conversation = mongoose.models.Conversation as Model<IConversation> || model<IConversation>('Conversation', conversationSchema);

// Message Model
export interface IMessage extends Document {
  conversationId: Types.ObjectId;
  isFromUser: boolean;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  isFromUser: { type: Boolean, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.models.Message as Model<IMessage> || model<IMessage>('Message', messageSchema);

// Analytics Model
export interface IAnalytics extends Document {
  date: Date;
  visitorCount: number;
  revenue: number;
  popularExhibitionId?: Types.ObjectId;
  averageVisitDuration?: number;
  createdAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>({
  date: { type: Date, required: true },
  visitorCount: { type: Number, required: true },
  revenue: { type: Number, required: true },
  popularExhibitionId: { type: Schema.Types.ObjectId, ref: 'Exhibition' },
  averageVisitDuration: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export const Analytics = mongoose.models.Analytics as Model<IAnalytics> || model<IAnalytics>('Analytics', analyticsSchema);

// Testimonial Model
export interface ITestimonial extends Document {
  name: string;
  role?: string;
  content: string;
  rating: number;
  avatarUrl?: string;
  isApproved: boolean;
  createdAt: Date;
}

const testimonialSchema = new Schema<ITestimonial>({
  name: { type: String, required: true },
  role: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  avatarUrl: { type: String },
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const Testimonial = mongoose.models.Testimonial as Model<ITestimonial> || model<ITestimonial>('Testimonial', testimonialSchema);

// Zod Schemas for Validation
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email(),
  fullName: z.string().optional(),
  isAdmin: z.boolean().optional().default(false),
  languagePreference: z.string().optional().default('en')
});

export const insertExhibitionSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  imageUrl: z.string().url().optional(),
  startDate: z.date(),
  endDate: z.date(),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(true)
});

export const insertTicketTypeSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10),
  price: z.number().positive(),
  color: z.string().optional().default('blue'),
  includes: z.array(z.string()).optional().default([]),
  isPopular: z.boolean().optional().default(false)
});

export const insertTicketSchema = z.object({
  userId: z.string(),
  ticketTypeId: z.string(),
  exhibitionId: z.string().optional(),
  quantity: z.number().int().positive().default(1),
  visitDate: z.date(),
  totalPrice: z.number().positive()
});

export const insertConversationSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string(),
  language: z.string().default('en')
});

export const insertMessageSchema = z.object({
  conversationId: z.string(),
  isFromUser: z.boolean(),
  content: z.string().min(1)
});

export const insertAnalyticsSchema = z.object({
  date: z.date(),
  visitorCount: z.number().int().nonnegative(),
  revenue: z.number().nonnegative(),
  popularExhibitionId: z.string().optional(),
  averageVisitDuration: z.number().optional()
});

export const insertTestimonialSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().optional(),
  content: z.string().min(10),
  rating: z.number().int().min(1).max(5),
  avatarUrl: z.string().url().optional(),
  isApproved: z.boolean().optional().default(false)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;
export type InsertTicketType = z.infer<typeof insertTicketTypeSchema>;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;