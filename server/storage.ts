import { users, type User, type InsertUser, 
  exhibitions, type Exhibition, type InsertExhibition,
  ticketTypes, type TicketType, type InsertTicketType,
  tickets, type Ticket, type InsertTicket,
  conversations, type Conversation, type InsertConversation,
  messages, type Message, type InsertMessage,
  analytics, type Analytics, type InsertAnalytics,
  testimonials, type Testimonial, type InsertTestimonial 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Exhibition operations
  getExhibition(id: number): Promise<Exhibition | undefined>;
  getAllExhibitions(): Promise<Exhibition[]>;
  getFeaturedExhibitions(): Promise<Exhibition[]>;
  createExhibition(exhibition: InsertExhibition): Promise<Exhibition>;
  updateExhibition(id: number, exhibition: InsertExhibition): Promise<Exhibition | undefined>;
  deleteExhibition(id: number): Promise<boolean>;

  // Ticket type operations
  getTicketType(id: number): Promise<TicketType | undefined>;
  getAllTicketTypes(): Promise<TicketType[]>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  updateTicketType(id: number, ticketType: InsertTicketType): Promise<TicketType | undefined>;
  deleteTicketType(id: number): Promise<boolean>;

  // Ticket operations
  getTicket(id: number): Promise<Ticket | undefined>;
  getAllTickets(): Promise<Ticket[]>;
  getTicketsByUserId(userId: number): Promise<Ticket[]>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  markTicketAsPaid(id: number, paymentIntentId: string): Promise<Ticket | undefined>;
  generateQRCode(id: number): Promise<Ticket | undefined>;
  markTicketAsUsed(id: number): Promise<Ticket | undefined>;

  // Conversation operations
  getConversation(id: number): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;

  // Analytics operations
  getAnalytics(): Promise<Analytics[]>;
  createAnalyticsEntry(analytics: InsertAnalytics): Promise<Analytics>;

  // Testimonial operations
  getApprovedTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  approveTestimonial(id: number): Promise<Testimonial | undefined>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exhibitions: Map<number, Exhibition>;
  private ticketTypes: Map<number, TicketType>;
  private tickets: Map<number, Ticket>;
  private conversations: Map<number, Conversation>;
  private messages: Map<number, Message>;
  private analyticsEntries: Map<number, Analytics>;
  private testimonials: Map<number, Testimonial>;
  sessionStore: session.SessionStore;
  private userIdCounter: number;
  private exhibitionIdCounter: number;
  private ticketTypeIdCounter: number;
  private ticketIdCounter: number;
  private conversationIdCounter: number;
  private messageIdCounter: number;
  private analyticsIdCounter: number;
  private testimonialIdCounter: number;

  constructor() {
    this.users = new Map();
    this.exhibitions = new Map();
    this.ticketTypes = new Map();
    this.tickets = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.analyticsEntries = new Map();
    this.testimonials = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.userIdCounter = 1;
    this.exhibitionIdCounter = 1;
    this.ticketTypeIdCounter = 1;
    this.ticketIdCounter = 1;
    this.conversationIdCounter = 1;
    this.messageIdCounter = 1;
    this.analyticsIdCounter = 1;
    this.testimonialIdCounter = 1;

    // Add seed data
    this.seedData();
  }

  private seedData() {
    // Create an admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$5H8dj4/ZgZS38KZWy0MO5.Kt5qdvLaYNc7jcG7zQ5EZWNMSCyKiHa", // 'admin123'
      email: "admin@museum.com",
      fullName: "Admin User",
      languagePreference: "en",
      isAdmin: true
    });

    // Create sample exhibitions
    this.createExhibition({
      title: "Ancient Egypt: The Eternal Life",
      description: "Explore the fascinating world of ancient Egyptian beliefs about death and the afterlife through artifacts, mummies, and immersive experiences.",
      imageUrl: "https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2023-09-01"),
      endDate: new Date("2023-12-15"),
      isFeatured: true,
      isNew: false
    });

    this.createExhibition({
      title: "Modern Masters: 20th Century Icons",
      description: "A curated collection of masterpieces from Picasso, Dalí, Warhol, and more, showcasing the revolutionary art movements of the 20th century.",
      imageUrl: "https://images.unsplash.com/photo-1605429523419-d828acb941d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2023-10-10"),
      endDate: new Date("2024-02-28"),
      isFeatured: true,
      isNew: true
    });

    this.createExhibition({
      title: "Digital Frontiers: Art & Technology",
      description: "An immersive exhibition exploring the intersection of art and technology through interactive installations, digital media, and virtual reality experiences.",
      imageUrl: "https://images.unsplash.com/photo-1569587112025-0d160c8c6f7b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      startDate: new Date("2023-11-05"),
      endDate: new Date("2024-01-15"),
      isFeatured: false,
      isNew: false
    });

    // Create sample ticket types
    this.createTicketType({
      name: "General Admission",
      description: "Access to permanent collections",
      price: 18.0,
      color: "primary",
      includes: ["Access to all permanent exhibitions", "Audio guide (additional $5)", "Valid for the selected date only"],
      isPopular: false
    });

    this.createTicketType({
      name: "Premium Pass",
      description: "All-inclusive museum experience",
      price: 32.0,
      color: "accent",
      includes: ["All permanent & special exhibitions", "Complimentary audio guide", "Priority entry (skip the line)", "One free museum publication"],
      isPopular: true
    });

    this.createTicketType({
      name: "Special Exhibition",
      description: "Entry to featured exhibitions",
      price: 25.0,
      color: "neutral",
      includes: ["Access to special exhibitions only", "Exhibition-specific guided tour", "Valid for the selected date & time"],
      isPopular: false
    });

    // Create sample testimonials
    this.createTestimonial({
      name: "Sarah J.",
      role: "Museum Member",
      content: "The chatbot made booking tickets so easy! I told it when I wanted to visit and how many people were in my group, and it handled everything. No more waiting in long lines!",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      isApproved: true
    });

    this.createTestimonial({
      name: "Michael T.",
      role: "International Visitor",
      content: "I was impressed by how the chatbot could answer all my questions about the exhibitions in multiple languages. It even suggested the best time to visit based on crowd levels.",
      rating: 4,
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      isApproved: true
    });

    this.createTestimonial({
      name: "Rebecca K.",
      role: "High School Teacher",
      content: "As a teacher planning a field trip, the group booking feature of the chatbot was a lifesaver. It handled all 30 student tickets efficiently and even arranged a guided tour for us.",
      rating: 5,
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      isApproved: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: Partial<InsertUser> & { isAdmin?: boolean }): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      username: userData.username!,
      password: userData.password!,
      email: userData.email!,
      fullName: userData.fullName || null,
      isAdmin: userData.isAdmin || false,
      languagePreference: userData.languagePreference || "en",
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Exhibition operations
  async getExhibition(id: number): Promise<Exhibition | undefined> {
    return this.exhibitions.get(id);
  }

  async getAllExhibitions(): Promise<Exhibition[]> {
    return Array.from(this.exhibitions.values());
  }

  async getFeaturedExhibitions(): Promise<Exhibition[]> {
    return Array.from(this.exhibitions.values()).filter(
      (exhibition) => exhibition.isFeatured,
    );
  }

  async createExhibition(exhibitionData: InsertExhibition): Promise<Exhibition> {
    const id = this.exhibitionIdCounter++;
    const now = new Date();
    const exhibition: Exhibition = {
      id,
      title: exhibitionData.title,
      description: exhibitionData.description,
      imageUrl: exhibitionData.imageUrl || null,
      startDate: exhibitionData.startDate,
      endDate: exhibitionData.endDate,
      isFeatured: exhibitionData.isFeatured || false,
      isNew: exhibitionData.isNew || false,
      createdAt: now,
    };
    this.exhibitions.set(id, exhibition);
    return exhibition;
  }

  async updateExhibition(id: number, exhibitionData: InsertExhibition): Promise<Exhibition | undefined> {
    const exhibition = this.exhibitions.get(id);
    if (!exhibition) {
      return undefined;
    }

    const updatedExhibition: Exhibition = {
      ...exhibition,
      title: exhibitionData.title,
      description: exhibitionData.description,
      imageUrl: exhibitionData.imageUrl || exhibition.imageUrl,
      startDate: exhibitionData.startDate,
      endDate: exhibitionData.endDate,
      isFeatured: exhibitionData.isFeatured,
      isNew: exhibitionData.isNew,
    };

    this.exhibitions.set(id, updatedExhibition);
    return updatedExhibition;
  }

  async deleteExhibition(id: number): Promise<boolean> {
    return this.exhibitions.delete(id);
  }

  // Ticket type operations
  async getTicketType(id: number): Promise<TicketType | undefined> {
    return this.ticketTypes.get(id);
  }

  async getAllTicketTypes(): Promise<TicketType[]> {
    return Array.from(this.ticketTypes.values());
  }

  async createTicketType(ticketTypeData: InsertTicketType): Promise<TicketType> {
    const id = this.ticketTypeIdCounter++;
    const now = new Date();
    const ticketType: TicketType = {
      id,
      name: ticketTypeData.name,
      description: ticketTypeData.description,
      price: ticketTypeData.price,
      color: ticketTypeData.color || "primary",
      includes: ticketTypeData.includes,
      isPopular: ticketTypeData.isPopular || false,
      createdAt: now,
    };
    this.ticketTypes.set(id, ticketType);
    return ticketType;
  }

  async updateTicketType(id: number, ticketTypeData: InsertTicketType): Promise<TicketType | undefined> {
    const ticketType = this.ticketTypes.get(id);
    if (!ticketType) {
      return undefined;
    }

    const updatedTicketType: TicketType = {
      ...ticketType,
      name: ticketTypeData.name,
      description: ticketTypeData.description,
      price: ticketTypeData.price,
      color: ticketTypeData.color || ticketType.color,
      includes: ticketTypeData.includes,
      isPopular: ticketTypeData.isPopular,
    };

    this.ticketTypes.set(id, updatedTicketType);
    return updatedTicketType;
  }

  async deleteTicketType(id: number): Promise<boolean> {
    return this.ticketTypes.delete(id);
  }

  // Ticket operations
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }

  async getAllTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values());
  }

  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      (ticket) => ticket.userId === userId,
    );
  }

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const id = this.ticketIdCounter++;
    const now = new Date();
    const ticket: Ticket = {
      id,
      userId: ticketData.userId,
      ticketTypeId: ticketData.ticketTypeId,
      exhibitionId: ticketData.exhibitionId || null,
      quantity: ticketData.quantity,
      visitDate: ticketData.visitDate,
      totalPrice: ticketData.totalPrice,
      isPaid: false,
      paymentIntentId: null,
      qrCodeData: null,
      isUsed: false,
      createdAt: now,
    };
    this.tickets.set(id, ticket);
    return ticket;
  }

  async markTicketAsPaid(id: number, paymentIntentId: string): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      return undefined;
    }

    const updatedTicket: Ticket = {
      ...ticket,
      isPaid: true,
      paymentIntentId,
      // Generate a QR code for the ticket
      qrCodeData: `ticket_${id}_${Date.now()}`,
    };

    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async generateQRCode(id: number): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      return undefined;
    }

    const updatedTicket: Ticket = {
      ...ticket,
      qrCodeData: `ticket_${id}_${Date.now()}`,
    };

    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  async markTicketAsUsed(id: number): Promise<Ticket | undefined> {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      return undefined;
    }

    const updatedTicket: Ticket = {
      ...ticket,
      isUsed: true,
    };

    this.tickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Conversation operations
  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const id = this.conversationIdCounter++;
    const now = new Date();
    const conversation: Conversation = {
      id,
      userId: conversationData.userId || null,
      sessionId: conversationData.sessionId,
      language: conversationData.language || "en",
      createdAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = {
      id,
      conversationId: messageData.conversationId,
      isFromUser: messageData.isFromUser,
      content: messageData.content,
      createdAt: now,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Analytics operations
  async getAnalytics(): Promise<Analytics[]> {
    return Array.from(this.analyticsEntries.values());
  }

  async createAnalyticsEntry(analyticsData: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const now = new Date();
    const analytics: Analytics = {
      id,
      date: analyticsData.date || now,
      visitorCount: analyticsData.visitorCount,
      revenue: analyticsData.revenue,
      popularExhibitionId: analyticsData.popularExhibitionId || null,
      averageVisitDuration: analyticsData.averageVisitDuration || null,
      createdAt: now,
    };
    this.analyticsEntries.set(id, analytics);
    return analytics;
  }

  // Testimonial operations
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      (testimonial) => testimonial.isApproved,
    );
  }

  async createTestimonial(testimonialData: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialIdCounter++;
    const now = new Date();
    const testimonial: Testimonial = {
      id,
      name: testimonialData.name,
      role: testimonialData.role || null,
      content: testimonialData.content,
      rating: testimonialData.rating,
      avatarUrl: testimonialData.avatarUrl || null,
      isApproved: false,
      createdAt: now,
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }

  async approveTestimonial(id: number): Promise<Testimonial | undefined> {
    const testimonial = this.testimonials.get(id);
    if (!testimonial) {
      return undefined;
    }

    const updatedTestimonial: Testimonial = {
      ...testimonial,
      isApproved: true,
    };

    this.testimonials.set(id, updatedTestimonial);
    return updatedTestimonial;
  }
}

export const storage = new MemStorage();
