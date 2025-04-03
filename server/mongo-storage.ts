import session from "express-session";
import MongoDBStore from "connect-mongodb-session";
import createMemoryStore from "memorystore";
import { IStorage } from "./storage";
import mongoose, { FilterQuery } from "mongoose";
import {
  users, exhibitions, ticketTypes, tickets, conversations, messages, analytics, testimonials,
  User, Exhibition, TicketType, Ticket, Conversation, Message, Analytics, Testimonial,
  InsertUser, InsertExhibition, InsertTicketType, InsertTicket, InsertConversation, InsertMessage, InsertAnalytics, InsertTestimonial
} from "@shared/schema";
import {
  User as UserModel, Exhibition as ExhibitionModel, TicketType as TicketTypeModel, 
  Ticket as TicketModel, Conversation as ConversationModel, Message as MessageModel, 
  Analytics as AnalyticsModel, Testimonial as TestimonialModel
} from "@shared/mongo-schema";
import QRCode from "qrcode";

// Create a MongoDB-specific interface that uses string IDs
export interface IMongoStorage {
  // User operations
  getUser(id: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  createUser(user: InsertUser): Promise<any>;
  getAllUsers(): Promise<any[]>;

  // Exhibition operations
  getExhibition(id: string): Promise<any>;
  getAllExhibitions(): Promise<any[]>;
  getFeaturedExhibitions(): Promise<any[]>;
  createExhibition(exhibition: InsertExhibition): Promise<any>;
  updateExhibition(id: string, exhibition: InsertExhibition): Promise<any>;
  deleteExhibition(id: string): Promise<boolean>;

  // Ticket type operations
  getTicketType(id: string): Promise<any>;
  getAllTicketTypes(): Promise<any[]>;
  createTicketType(ticketType: InsertTicketType): Promise<any>;
  updateTicketType(id: string, ticketType: InsertTicketType): Promise<any>;
  deleteTicketType(id: string): Promise<boolean>;

  // Ticket operations
  getTicket(id: string): Promise<any>;
  getAllTickets(): Promise<any[]>;
  getTicketsByUserId(userId: string): Promise<any[]>;
  createTicket(ticket: InsertTicket & { userId: string; ticketTypeId: string; exhibitionId?: string }): Promise<any>;
  markTicketAsPaid(id: string, paymentIntentId: string): Promise<any>;
  generateQRCode(id: string): Promise<any>;
  markTicketAsUsed(id: string): Promise<any>;

  // Conversation operations
  getConversation(id: string): Promise<any>;
  createConversation(conversation: InsertConversation & { userId?: string }): Promise<any>;

  // Message operations
  createMessage(message: InsertMessage & { conversationId: string }): Promise<any>;
  getMessagesByConversationId(conversationId: string): Promise<any[]>;

  // Analytics operations
  getAnalytics(): Promise<any[]>;
  createAnalyticsEntry(analytics: InsertAnalytics & { popularExhibitionId?: string }): Promise<any>;

  // Testimonial operations
  getApprovedTestimonials(): Promise<any[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<any>;
  approveTestimonial(id: string): Promise<any>;

  // Session store and database initialization
  sessionStore: session.Store;
  initializeDatabase?(): Promise<void>;
}

// Create MongoDB session store
const MongoSessionStore = MongoDBStore(session);
const MemoryStore = createMemoryStore(session);

export class MongoDBStorage implements IMongoStorage {
  sessionStore: session.Store;

  constructor() {
    try {
      // Try to use MongoDB session store
      const mongoStore = new MongoSessionStore({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/museum-ticket-booking',
        collection: 'sessions',
        connectionOptions: {
          serverSelectionTimeoutMS: 5000 // 5 seconds timeout
        }
      });
      
      // Handle connection errors
      mongoStore.on('error', (error) => {
        console.log('Session store error:', error);
        console.log('Falling back to memory store for sessions');
        this.sessionStore = new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
        });
      });
      
      this.sessionStore = mongoStore;
    } catch (error) {
      console.log('Failed to create MongoDB session store:', error);
      console.log('Using memory session store as fallback');
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }

  // Initialize database with sample data if needed
  async initializeDatabase(): Promise<void> {
    try {
      // Check if any users exist
      const userCount = await User.countDocuments();
      
      // Only create sample data if no data exists
      if (userCount === 0) {
        console.log('No users found, initializing database with sample data...');
        
        // Create admin user
        const adminPassword = '$2b$10$X7EzSUYg6g8BzfqrOkrOgeuKTL5Xh6DxOGt94GgMIYLrGvTjOXkEe.c82b9e16b48769855c11be10ca1bb6a0be89'; // 'admin123' with salt
        await User.create({
          username: 'admin',
          password: adminPassword,
          email: 'admin@museum.com',
          fullName: 'Admin User',
          isAdmin: true,
          languagePreference: 'en',
          createdAt: new Date()
        });

        // Create regular user
        const userPassword = '$2b$10$yXVZxHei5KJWY2BgJlkHVuVzl1TZpXOOZ3dpCyJPJJRBDEsL7IGpu.cc58f85bf4e44e4fb1c9d971e9ca28bb36'; // 'user123' with salt
        await User.create({
          username: 'visitor',
          password: userPassword,
          email: 'visitor@example.com',
          fullName: 'Museum Visitor',
          isAdmin: false,
          languagePreference: 'en',
          createdAt: new Date()
        });

        // Create exhibitions
        const exhibitions = [
          {
            title: 'Ancient Egypt',
            description: 'Explore the wonders of Ancient Egypt with our collection of artifacts and mummies.',
            imageUrl: 'https://example.com/images/egypt.jpg',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2024-12-31'),
            isFeatured: true,
            isNew: true,
            createdAt: new Date()
          },
          {
            title: 'Modern Masters',
            description: 'A stunning collection of works by the greatest masters of modern art.',
            imageUrl: 'https://example.com/images/modern.jpg',
            startDate: new Date('2023-03-15'),
            endDate: new Date('2024-09-30'),
            isFeatured: true,
            isNew: false,
            createdAt: new Date()
          },
          {
            title: 'Digital Frontiers',
            description: 'Explore the intersection of art and technology in this innovative exhibition.',
            imageUrl: 'https://example.com/images/digital.jpg',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2024-08-31'),
            isFeatured: false,
            isNew: true,
            createdAt: new Date()
          }
        ];
        await Exhibition.insertMany(exhibitions);

        // Create ticket types
        const ticketTypes = [
          {
            name: 'General Admission',
            description: 'Regular entrance ticket for all visitors',
            price: 18,
            color: 'blue',
            includes: ['Main Gallery Access', 'Temporary Exhibitions'],
            isPopular: true,
            createdAt: new Date()
          },
          {
            name: 'Premium Pass',
            description: 'Access to all exhibitions including special ones and a guided tour',
            price: 32,
            color: 'gold',
            includes: ['All Exhibitions', 'Guided Tour', 'Audio Guide', 'Souvenir Booklet'],
            isPopular: true,
            createdAt: new Date()
          },
          {
            name: 'Special Exhibition',
            description: 'Ticket for special exhibitions only',
            price: 25,
            color: 'purple',
            includes: ['Special Exhibition Access', 'Exhibition Catalog'],
            isPopular: false,
            createdAt: new Date()
          }
        ];
        await TicketType.insertMany(ticketTypes);

        // Create testimonials
        const testimonials = [
          {
            name: 'John Smith',
            role: 'Art Enthusiast',
            content: 'Absolutely amazing experience! The Ancient Egypt exhibition was breathtaking.',
            rating: 5,
            avatarUrl: 'https://example.com/avatars/john.jpg',
            isApproved: true,
            createdAt: new Date()
          },
          {
            name: 'Sarah Johnson',
            role: 'Teacher',
            content: 'Brought my class here and they loved it. Very educational and engaging for all ages.',
            rating: 4,
            avatarUrl: 'https://example.com/avatars/sarah.jpg',
            isApproved: true,
            createdAt: new Date()
          }
        ];
        await Testimonial.insertMany(testimonials);

        console.log('Sample data created successfully');
      } else {
        console.log('Database already contains data, skipping initialization');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<any | undefined> {
    try {
      const user = await User.findById(id);
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    try {
      const user = await User.findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async createUser(userData: InsertUser & { isAdmin?: boolean }): Promise<any> {
    try {
      const newUser = new User({
        ...userData,
        isAdmin: userData.isAdmin || false,
        createdAt: new Date()
      });
      await newUser.save();
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      return await User.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Exhibition operations
  async getExhibition(id: string): Promise<any | undefined> {
    try {
      const exhibition = await Exhibition.findById(id);
      return exhibition || undefined;
    } catch (error) {
      console.error('Error getting exhibition:', error);
      throw error;
    }
  }

  async getAllExhibitions(): Promise<any[]> {
    try {
      return await Exhibition.find().sort({ startDate: 1 });
    } catch (error) {
      console.error('Error getting all exhibitions:', error);
      throw error;
    }
  }

  async getFeaturedExhibitions(): Promise<any[]> {
    try {
      return await Exhibition.find({ isFeatured: true }).sort({ startDate: 1 });
    } catch (error) {
      console.error('Error getting featured exhibitions:', error);
      throw error;
    }
  }

  async createExhibition(exhibitionData: InsertExhibition): Promise<any> {
    try {
      const newExhibition = new Exhibition({
        ...exhibitionData,
        createdAt: new Date()
      });
      await newExhibition.save();
      return newExhibition;
    } catch (error) {
      console.error('Error creating exhibition:', error);
      throw error;
    }
  }

  async updateExhibition(id: string, exhibitionData: InsertExhibition): Promise<any | undefined> {
    try {
      const updatedExhibition = await Exhibition.findByIdAndUpdate(
        id,
        { ...exhibitionData },
        { new: true }
      );
      return updatedExhibition || undefined;
    } catch (error) {
      console.error('Error updating exhibition:', error);
      throw error;
    }
  }

  async deleteExhibition(id: string): Promise<boolean> {
    try {
      const result = await Exhibition.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting exhibition:', error);
      throw error;
    }
  }

  // Ticket type operations
  async getTicketType(id: string): Promise<any | undefined> {
    try {
      const ticketType = await TicketType.findById(id);
      return ticketType || undefined;
    } catch (error) {
      console.error('Error getting ticket type:', error);
      throw error;
    }
  }

  async getAllTicketTypes(): Promise<any[]> {
    try {
      return await TicketType.find().sort({ price: 1 });
    } catch (error) {
      console.error('Error getting all ticket types:', error);
      throw error;
    }
  }

  async createTicketType(ticketTypeData: InsertTicketType): Promise<any> {
    try {
      const newTicketType = new TicketType({
        ...ticketTypeData,
        createdAt: new Date()
      });
      await newTicketType.save();
      return newTicketType;
    } catch (error) {
      console.error('Error creating ticket type:', error);
      throw error;
    }
  }

  async updateTicketType(id: string, ticketTypeData: InsertTicketType): Promise<any | undefined> {
    try {
      const updatedTicketType = await TicketType.findByIdAndUpdate(
        id,
        { ...ticketTypeData },
        { new: true }
      );
      return updatedTicketType || undefined;
    } catch (error) {
      console.error('Error updating ticket type:', error);
      throw error;
    }
  }

  async deleteTicketType(id: string): Promise<boolean> {
    try {
      const result = await TicketType.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      throw error;
    }
  }

  // Ticket operations
  async getTicket(id: string): Promise<any | undefined> {
    try {
      const ticket = await Ticket.findById(id)
        .populate('userId')
        .populate('ticketTypeId')
        .populate('exhibitionId');
      return ticket || undefined;
    } catch (error) {
      console.error('Error getting ticket:', error);
      throw error;
    }
  }

  async getAllTickets(): Promise<any[]> {
    try {
      return await Ticket.find()
        .populate('userId')
        .populate('ticketTypeId')
        .populate('exhibitionId')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all tickets:', error);
      throw error;
    }
  }

  async getTicketsByUserId(userId: string): Promise<any[]> {
    try {
      return await Ticket.find({ userId })
        .populate('ticketTypeId')
        .populate('exhibitionId')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting tickets by user ID:', error);
      throw error;
    }
  }

  async createTicket(ticketData: InsertTicket): Promise<any> {
    try {
      // Convert string IDs to ObjectIds
      const ticketTypeId = ticketData.ticketTypeId;
      const userId = ticketData.userId;
      const exhibitionId = ticketData.exhibitionId;
      
      // Calculate total price based on ticket type and quantity
      const ticketType = await TicketType.findById(ticketTypeId);
      if (!ticketType) {
        throw new Error('Ticket type not found');
      }
      
      const totalPrice = ticketType.price * ticketData.quantity;
      
      const newTicket = new Ticket({
        userId,
        ticketTypeId,
        exhibitionId: exhibitionId || null,
        quantity: ticketData.quantity,
        visitDate: ticketData.visitDate,
        totalPrice,
        isPaid: false,
        isUsed: false,
        createdAt: new Date()
      });
      
      await newTicket.save();
      return await this.getTicket(newTicket._id ? newTicket._id.toString() : "");
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async markTicketAsPaid(id: string, paymentIntentId: string): Promise<any | undefined> {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        {
          isPaid: true,
          paymentIntentId
        },
        { new: true }
      )
        .populate('userId')
        .populate('ticketTypeId')
        .populate('exhibitionId');
      
      if (updatedTicket) {
        // Generate QR code
        await this.generateQRCode(updatedTicket._id ? updatedTicket._id.toString() : "");
        return await this.getTicket(updatedTicket._id ? updatedTicket._id.toString() : "");
      }
      
      return undefined;
    } catch (error) {
      console.error('Error marking ticket as paid:', error);
      throw error;
    }
  }

  async generateQRCode(id: string): Promise<any | undefined> {
    try {
      const ticket = await Ticket.findById(id);
      if (!ticket) {
        return undefined;
      }
      
      // Generate QR code data
      const qrData = {
        ticketId: ticket._id ? ticket._id.toString() : "",
        userId: ticket.userId ? ticket.userId.toString() : "",
        ticketTypeId: ticket.ticketTypeId ? ticket.ticketTypeId.toString() : "",
        quantity: ticket.quantity,
        visitDate: ticket.visitDate,
        isPaid: ticket.isPaid
      };
      
      // Convert to JSON string
      const qrString = JSON.stringify(qrData);
      
      // Generate QR code as data URL
      const qrCodeData = await QRCode.toDataURL(qrString);
      
      // Update ticket with QR code
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { qrCodeData },
        { new: true }
      );
      
      return updatedTicket || undefined;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async markTicketAsUsed(id: string): Promise<any | undefined> {
    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { isUsed: true },
        { new: true }
      )
        .populate('userId')
        .populate('ticketTypeId')
        .populate('exhibitionId');
      
      return updatedTicket || undefined;
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      throw error;
    }
  }

  // Conversation operations
  async getConversation(id: string): Promise<any | undefined> {
    try {
      const conversation = await Conversation.findById(id);
      return conversation || undefined;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  async createConversation(conversationData: InsertConversation): Promise<any> {
    try {
      const newConversation = new Conversation({
        sessionId: conversationData.sessionId,
        language: conversationData.language,
        userId: conversationData.userId || null,
        createdAt: new Date()
      });
      await newConversation.save();
      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<any> {
    try {
      const newMessage = new Message({
        conversationId: messageData.conversationId,
        isFromUser: messageData.isFromUser,
        content: messageData.content,
        createdAt: new Date()
      });
      await newMessage.save();
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async getMessagesByConversationId(conversationId: string): Promise<any[]> {
    try {
      return await Message.find({ conversationId }).sort({ createdAt: 1 });
    } catch (error) {
      console.error('Error getting messages by conversation ID:', error);
      throw error;
    }
  }

  // Analytics operations
  async getAnalytics(): Promise<any[]> {
    try {
      return await Analytics.find().sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error getting analytics:', error);
      throw error;
    }
  }

  async createAnalyticsEntry(analyticsData: InsertAnalytics): Promise<any> {
    try {
      const newAnalytics = new Analytics({
        ...analyticsData,
        timestamp: new Date()
      });
      await newAnalytics.save();
      return newAnalytics;
    } catch (error) {
      console.error('Error creating analytics entry:', error);
      throw error;
    }
  }

  // Testimonial operations
  async getApprovedTestimonials(): Promise<any[]> {
    try {
      return await Testimonial.find({ isApproved: true }).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting approved testimonials:', error);
      throw error;
    }
  }

  async createTestimonial(testimonialData: InsertTestimonial): Promise<any> {
    try {
      const newTestimonial = new Testimonial({
        ...testimonialData,
        isApproved: false,
        createdAt: new Date()
      });
      await newTestimonial.save();
      return newTestimonial;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async approveTestimonial(id: string): Promise<any | undefined> {
    try {
      const updatedTestimonial = await Testimonial.findByIdAndUpdate(
        id,
        { isApproved: true },
        { new: true }
      );
      return updatedTestimonial || undefined;
    } catch (error) {
      console.error('Error approving testimonial:', error);
      throw error;
    }
  }
}

// Adapter class to make MongoDB storage compatible with SQL storage interface
export class StorageAdapter implements IStorage {
  private mongoStorage: MongoDBStorage;

  constructor(mongoStorage: MongoDBStorage) {
    this.mongoStorage = mongoStorage;
  }

  get sessionStore(): session.Store {
    return this.mongoStorage.sessionStore;
  }

  async initializeDatabase(): Promise<void> {
    if (this.mongoStorage.initializeDatabase) {
      return this.mongoStorage.initializeDatabase();
    }
  }

  // User operations with type conversion
  async getUser(id: number): Promise<typeof users.$inferSelect | undefined> {
    const user = await this.mongoStorage.getUser(id.toString());
    if (!user) return undefined;
    return this.convertMongoUserToUser(user);
  }

  async getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined> {
    const user = await this.mongoStorage.getUserByUsername(username);
    if (!user) return undefined;
    return this.convertMongoUserToUser(user);
  }

  async getUserByEmail(email: string): Promise<typeof users.$inferSelect | undefined> {
    const user = await this.mongoStorage.getUserByEmail(email);
    if (!user) return undefined;
    return this.convertMongoUserToUser(user);
  }

  async createUser(user: InsertUser): Promise<typeof users.$inferSelect> {
    const mongoUser = await this.mongoStorage.createUser(user);
    return this.convertMongoUserToUser(mongoUser);
  }

  async getAllUsers(): Promise<typeof users.$inferSelect[]> {
    const users = await this.mongoStorage.getAllUsers();
    return users.map(user => this.convertMongoUserToUser(user));
  }

  // Exhibition operations with type conversion
  async getExhibition(id: number): Promise<typeof exhibitions.$inferSelect | undefined> {
    const exhibition = await this.mongoStorage.getExhibition(id.toString());
    if (!exhibition) return undefined;
    return this.convertMongoExhibitionToExhibition(exhibition);
  }

  async getAllExhibitions(): Promise<typeof exhibitions.$inferSelect[]> {
    const exhibitions = await this.mongoStorage.getAllExhibitions();
    return exhibitions.map(exhibition => this.convertMongoExhibitionToExhibition(exhibition));
  }

  async getFeaturedExhibitions(): Promise<typeof exhibitions.$inferSelect[]> {
    const exhibitions = await this.mongoStorage.getFeaturedExhibitions();
    return exhibitions.map(exhibition => this.convertMongoExhibitionToExhibition(exhibition));
  }

  async createExhibition(exhibition: InsertExhibition): Promise<typeof exhibitions.$inferSelect> {
    const mongoExhibition = await this.mongoStorage.createExhibition(exhibition);
    return this.convertMongoExhibitionToExhibition(mongoExhibition);
  }

  async updateExhibition(id: number, exhibition: InsertExhibition): Promise<typeof exhibitions.$inferSelect | undefined> {
    const mongoExhibition = await this.mongoStorage.updateExhibition(id.toString(), exhibition);
    if (!mongoExhibition) return undefined;
    return this.convertMongoExhibitionToExhibition(mongoExhibition);
  }

  async deleteExhibition(id: number): Promise<boolean> {
    return this.mongoStorage.deleteExhibition(id.toString());
  }

  // Ticket type operations with type conversion
  async getTicketType(id: number): Promise<TicketType | undefined> {
    const ticketType = await this.mongoStorage.getTicketType(id.toString());
    if (!ticketType) return undefined;
    return this.convertMongoTicketTypeToTicketType(ticketType);
  }

  async getAllTicketTypes(): Promise<TicketType[]> {
    const ticketTypes = await this.mongoStorage.getAllTicketTypes();
    return ticketTypes.map(ticketType => this.convertMongoTicketTypeToTicketType(ticketType));
  }

  async createTicketType(ticketType: InsertTicketType): Promise<TicketType> {
    const mongoTicketType = await this.mongoStorage.createTicketType(ticketType);
    return this.convertMongoTicketTypeToTicketType(mongoTicketType);
  }

  async updateTicketType(id: number, ticketType: InsertTicketType): Promise<TicketType | undefined> {
    const mongoTicketType = await this.mongoStorage.updateTicketType(id.toString(), ticketType);
    if (!mongoTicketType) return undefined;
    return this.convertMongoTicketTypeToTicketType(mongoTicketType);
  }

  async deleteTicketType(id: number): Promise<boolean> {
    return this.mongoStorage.deleteTicketType(id.toString());
  }

  // Ticket operations with type conversion
  async getTicket(id: number): Promise<Ticket | undefined> {
    const ticket = await this.mongoStorage.getTicket(id.toString());
    if (!ticket) return undefined;
    return this.convertMongoTicketToTicket(ticket);
  }

  async getAllTickets(): Promise<Ticket[]> {
    const tickets = await this.mongoStorage.getAllTickets();
    return tickets.map(ticket => this.convertMongoTicketToTicket(ticket));
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    const tickets = await this.mongoStorage.getTicketsByUserId(userId.toString());
    return tickets.map(ticket => this.convertMongoTicketToTicket(ticket));
  }

  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    // Convert ticket data for MongoDB
    const mongoTicketData = {
      ...ticket,
      userId: ticket.userId.toString(),
      ticketTypeId: ticket.ticketTypeId.toString(),
      exhibitionId: ticket.exhibitionId ? ticket.exhibitionId.toString() : undefined
    } as any;
    
    const mongoTicket = await this.mongoStorage.createTicket(mongoTicketData);
    return this.convertMongoTicketToTicket(mongoTicket);
  }

  async markTicketAsPaid(id: number, paymentIntentId: string): Promise<Ticket | undefined> {
    const ticket = await this.mongoStorage.markTicketAsPaid(id.toString(), paymentIntentId);
    if (!ticket) return undefined;
    return this.convertMongoTicketToTicket(ticket);
  }

  async generateQRCode(id: number): Promise<Ticket | undefined> {
    const ticket = await this.mongoStorage.generateQRCode(id.toString());
    if (!ticket) return undefined;
    return this.convertMongoTicketToTicket(ticket);
  }

  async markTicketAsUsed(id: number): Promise<Ticket | undefined> {
    const ticket = await this.mongoStorage.markTicketAsUsed(id.toString());
    if (!ticket) return undefined;
    return this.convertMongoTicketToTicket(ticket);
  }

  // Conversation operations with type conversion
  async getConversation(id: number): Promise<Conversation | undefined> {
    const conversation = await this.mongoStorage.getConversation(id.toString());
    if (!conversation) return undefined;
    return this.convertMongoConversationToConversation(conversation);
  }

  async createConversation(conversation: { sessionId: string; language?: string; userId?: number | null }): Promise<Conversation> {
    const mongoConversationData = {
      sessionId: conversation.sessionId,
      language: conversation.language || 'en',
      userId: conversation.userId ? conversation.userId.toString() : undefined,
    };
    
    const mongoConversation = await this.mongoStorage.createConversation(mongoConversationData as any);
    return this.convertMongoConversationToConversation(mongoConversation);
  }

  // Message operations with type conversion
  async createMessage(message: { conversationId: number; isFromUser: boolean; content: string }): Promise<Message> {
    const mongoMessageData = {
      conversationId: message.conversationId.toString(),
      isFromUser: message.isFromUser,
      content: message.content
    };
    
    const mongoMessage = await this.mongoStorage.createMessage(mongoMessageData);
    return this.convertMongoMessageToMessage(mongoMessage);
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    const messages = await this.mongoStorage.getMessagesByConversationId(conversationId.toString());
    return messages.map(message => this.convertMongoMessageToMessage(message));
  }

  // Analytics operations with type conversion
  async getAnalytics(): Promise<Analytics[]> {
    const analyticsEntries = await this.mongoStorage.getAnalytics();
    return analyticsEntries.map(entry => this.convertMongoAnalyticsToAnalytics(entry));
  }

  async createAnalyticsEntry(analytics: { date: Date; visitorCount: number; revenue: number; popularExhibitionId?: number | null; averageVisitDuration?: number | null }): Promise<Analytics> {
    const mongoAnalyticsData = {
      ...analytics,
      popularExhibitionId: analytics.popularExhibitionId ? analytics.popularExhibitionId.toString() : undefined
    };
    
    const mongoAnalytics = await this.mongoStorage.createAnalyticsEntry(mongoAnalyticsData as any);
    return this.convertMongoAnalyticsToAnalytics(mongoAnalytics);
  }

  // Testimonial operations with type conversion
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    const testimonials = await this.mongoStorage.getApprovedTestimonials();
    return testimonials.map(testimonial => this.convertMongoTestimonialToTestimonial(testimonial));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const mongoTestimonial = await this.mongoStorage.createTestimonial(testimonial);
    return this.convertMongoTestimonialToTestimonial(mongoTestimonial);
  }

  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = await this.mongoStorage.approveTestimonial(id.toString());
    if (!testimonial) return undefined;
    return this.convertMongoTestimonialToTestimonial(testimonial);
  }

  // Helper conversion functions
  private convertMongoUserToUser(mongoUser: any): User {
    return {
      id: parseInt(mongoUser._id.toString(), 10),
      username: mongoUser.username,
      password: mongoUser.password,
      email: mongoUser.email,
      fullName: mongoUser.fullName || null,
      isAdmin: mongoUser.isAdmin,
      languagePreference: mongoUser.languagePreference,
      createdAt: mongoUser.createdAt
    };
  }

  private convertMongoExhibitionToExhibition(mongoExhibition: any): Exhibition {
    return {
      id: parseInt(mongoExhibition._id.toString(), 10),
      title: mongoExhibition.title,
      description: mongoExhibition.description,
      imageUrl: mongoExhibition.imageUrl || null,
      startDate: mongoExhibition.startDate,
      endDate: mongoExhibition.endDate,
      isFeatured: mongoExhibition.isFeatured,
      isNew: mongoExhibition.isNew,
      createdAt: mongoExhibition.createdAt
    };
  }

  private convertMongoTicketTypeToTicketType(mongoTicketType: any): TicketType {
    return {
      id: parseInt(mongoTicketType._id.toString(), 10),
      name: mongoTicketType.name,
      description: mongoTicketType.description,
      price: mongoTicketType.price,
      color: mongoTicketType.color,
      includes: mongoTicketType.includes,
      isPopular: mongoTicketType.isPopular,
      createdAt: mongoTicketType.createdAt
    };
  }

  private convertMongoTicketToTicket(mongoTicket: any): Ticket {
    const ticket: Ticket = {
      id: parseInt(mongoTicket._id.toString(), 10),
      userId: parseInt(mongoTicket.userId._id ? mongoTicket.userId._id.toString() : mongoTicket.userId.toString(), 10),
      ticketTypeId: parseInt(mongoTicket.ticketTypeId._id ? mongoTicket.ticketTypeId._id.toString() : mongoTicket.ticketTypeId.toString(), 10),
      exhibitionId: mongoTicket.exhibitionId ? parseInt(mongoTicket.exhibitionId._id ? mongoTicket.exhibitionId._id.toString() : mongoTicket.exhibitionId.toString(), 10) : null,
      quantity: mongoTicket.quantity,
      visitDate: mongoTicket.visitDate,
      totalPrice: mongoTicket.totalPrice,
      isPaid: mongoTicket.isPaid,
      paymentIntentId: mongoTicket.paymentIntentId || null,
      qrCodeData: mongoTicket.qrCodeData || null,
      isUsed: mongoTicket.isUsed,
      createdAt: mongoTicket.createdAt
    };
    return ticket;
  }

  private convertMongoConversationToConversation(mongoConversation: any): Conversation {
    return {
      id: parseInt(mongoConversation._id.toString(), 10),
      userId: mongoConversation.userId ? parseInt(mongoConversation.userId.toString(), 10) : null,
      sessionId: mongoConversation.sessionId,
      language: mongoConversation.language,
      createdAt: mongoConversation.createdAt
    };
  }

  private convertMongoMessageToMessage(mongoMessage: any): Message {
    return {
      id: parseInt(mongoMessage._id.toString(), 10),
      conversationId: parseInt(mongoMessage.conversationId.toString(), 10),
      isFromUser: mongoMessage.isFromUser,
      content: mongoMessage.content,
      createdAt: mongoMessage.createdAt
    };
  }

  private convertMongoAnalyticsToAnalytics(mongoAnalytics: any): Analytics {
    return {
      id: parseInt(mongoAnalytics._id.toString(), 10),
      date: mongoAnalytics.date,
      visitorCount: mongoAnalytics.visitorCount,
      revenue: mongoAnalytics.revenue,
      popularExhibitionId: mongoAnalytics.popularExhibitionId ? parseInt(mongoAnalytics.popularExhibitionId.toString(), 10) : null,
      averageVisitDuration: mongoAnalytics.averageVisitDuration || null,
      createdAt: mongoAnalytics.createdAt
    };
  }

  private convertMongoTestimonialToTestimonial(mongoTestimonial: any): Testimonial {
    return {
      id: parseInt(mongoTestimonial._id.toString(), 10),
      name: mongoTestimonial.name,
      role: mongoTestimonial.role || null,
      content: mongoTestimonial.content,
      rating: mongoTestimonial.rating,
      avatarUrl: mongoTestimonial.avatarUrl || null,
      isApproved: mongoTestimonial.isApproved,
      createdAt: mongoTestimonial.createdAt
    };
  }
}

// Create the MongoDB storage implementation
const mongoStorage = new MongoDBStorage();

// Export the adapted storage that implements IStorage
export const storage = new StorageAdapter(mongoStorage);