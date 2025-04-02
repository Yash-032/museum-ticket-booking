import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExhibitionSchema, insertTicketSchema, insertTicketTypeSchema, insertTestimonialSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Express.Request, res: Express.Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Middleware to ensure user is an admin
  const ensureAdmin = (req: Express.Request, res: Express.Response, next: Function) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: "Not authorized" });
  };

  // ====== Exhibition Routes ======
  app.get("/api/exhibitions", async (req, res, next) => {
    try {
      const exhibitions = await storage.getAllExhibitions();
      res.json(exhibitions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exhibitions/featured", async (req, res, next) => {
    try {
      const exhibitions = await storage.getFeaturedExhibitions();
      res.json(exhibitions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/exhibitions/:id", async (req, res, next) => {
    try {
      const exhibition = await storage.getExhibition(Number(req.params.id));
      if (!exhibition) {
        return res.status(404).json({ message: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/exhibitions", ensureAdmin, async (req, res, next) => {
    try {
      const validatedData = insertExhibitionSchema.parse(req.body);
      const exhibition = await storage.createExhibition(validatedData);
      res.status(201).json(exhibition);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.put("/api/exhibitions/:id", ensureAdmin, async (req, res, next) => {
    try {
      const validatedData = insertExhibitionSchema.parse(req.body);
      const exhibition = await storage.updateExhibition(Number(req.params.id), validatedData);
      if (!exhibition) {
        return res.status(404).json({ message: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.delete("/api/exhibitions/:id", ensureAdmin, async (req, res, next) => {
    try {
      const success = await storage.deleteExhibition(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Exhibition not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ====== Ticket Type Routes ======
  app.get("/api/ticket-types", async (req, res, next) => {
    try {
      const ticketTypes = await storage.getAllTicketTypes();
      res.json(ticketTypes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ticket-types", ensureAdmin, async (req, res, next) => {
    try {
      const validatedData = insertTicketTypeSchema.parse(req.body);
      const ticketType = await storage.createTicketType(validatedData);
      res.status(201).json(ticketType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.put("/api/ticket-types/:id", ensureAdmin, async (req, res, next) => {
    try {
      const validatedData = insertTicketTypeSchema.parse(req.body);
      const ticketType = await storage.updateTicketType(Number(req.params.id), validatedData);
      if (!ticketType) {
        return res.status(404).json({ message: "Ticket type not found" });
      }
      res.json(ticketType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.delete("/api/ticket-types/:id", ensureAdmin, async (req, res, next) => {
    try {
      const success = await storage.deleteTicketType(Number(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Ticket type not found" });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ====== Ticket Routes ======
  app.get("/api/tickets", ensureAuthenticated, async (req, res, next) => {
    try {
      if (req.user.isAdmin) {
        const tickets = await storage.getAllTickets();
        return res.json(tickets);
      }
      
      const tickets = await storage.getTicketsByUserId(req.user.id);
      res.json(tickets);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tickets", ensureAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertTicketSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.get("/api/tickets/:id", ensureAuthenticated, async (req, res, next) => {
    try {
      const ticket = await storage.getTicket(Number(req.params.id));
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Only allow access to the user's own tickets or admin
      if (ticket.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      res.json(ticket);
    } catch (error) {
      next(error);
    }
  });

  // ====== Payment Routes ======
  app.post("/api/payments/process", ensureAuthenticated, async (req, res, next) => {
    try {
      const { ticketId } = req.body;
      if (!ticketId) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }

      const ticket = await storage.getTicket(Number(ticketId));
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      if (ticket.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      if (ticket.isPaid) {
        return res.status(400).json({ message: "Ticket already paid" });
      }

      // In a real application, we would integrate with a payment processor here
      // For this example, we'll just mark the ticket as paid
      const paymentId = `pi_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const updatedTicket = await storage.markTicketAsPaid(ticket.id, paymentId);

      res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
      next(error);
    }
  });

  // ====== Chatbot Routes ======
  app.post("/api/chat/start", async (req, res, next) => {
    try {
      const { language = "en", userId } = req.body;
      const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      const conversation = await storage.createConversation({
        sessionId,
        language,
        userId: userId || null,
      });

      // Add welcome message
      await storage.createMessage({
        conversationId: conversation.id,
        isFromUser: false,
        content: "Hello! I'm your museum booking assistant. How can I help you today?",
      });

      const messages = await storage.getMessagesByConversationId(conversation.id);
      
      res.json({ 
        conversationId: conversation.id,
        sessionId,
        messages
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/chat/message", async (req, res, next) => {
    try {
      const { conversationId, message } = req.body;
      if (!conversationId || !message) {
        return res.status(400).json({ message: "Conversation ID and message are required" });
      }

      // Save user message
      await storage.createMessage({
        conversationId,
        isFromUser: true,
        content: message,
      });

      // Process the message and generate a response
      // This would typically use natural language processing
      let responseText = "Thank you for your message. How can I assist you further?";
      
      // Simple keyword-based responses for demonstration
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("ticket") || lowerMessage.includes("book")) {
        responseText = "I can help you book tickets! What date would you like to visit the museum?";
      } else if (lowerMessage.includes("exhibition") || lowerMessage.includes("show")) {
        responseText = "We have several exciting exhibitions currently. Our featured exhibitions include 'Ancient Egypt', 'Modern Masters', and 'Digital Frontiers'. Which one interests you?";
      } else if (lowerMessage.includes("hour") || lowerMessage.includes("open")) {
        responseText = "The museum is open Tuesday to Thursday from 10 AM to 5 PM, Friday from 10 AM to 9 PM, and weekends from 9 AM to 6 PM. We're closed on Mondays.";
      } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("fee")) {
        responseText = "We offer different ticket types. General Admission is $18, Premium Pass is $32, and Special Exhibition tickets are $25. Children under 12 enter for free, and we have discounts for students and seniors.";
      } else if (lowerMessage.includes("discount") || lowerMessage.includes("student") || lowerMessage.includes("senior")) {
        responseText = "Yes, we offer a 25% discount for students with valid ID and seniors (65+). Children under 12 can enter for free.";
      }

      // Save bot response
      await storage.createMessage({
        conversationId,
        isFromUser: false,
        content: responseText,
      });

      const messages = await storage.getMessagesByConversationId(conversationId);
      
      res.json({ messages });
    } catch (error) {
      next(error);
    }
  });

  // ====== Testimonial Routes ======
  app.get("/api/testimonials", async (req, res, next) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/testimonials", ensureAuthenticated, async (req, res, next) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.put("/api/testimonials/:id/approve", ensureAdmin, async (req, res, next) => {
    try {
      const testimonial = await storage.approveTestimonial(Number(req.params.id));
      if (!testimonial) {
        return res.status(404).json({ message: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      next(error);
    }
  });

  // ====== Analytics Routes ======
  app.get("/api/analytics", ensureAdmin, async (req, res, next) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
