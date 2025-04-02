# Museum Ticket Booking System

A multilingual chatbot-based museum ticket booking system with integrated payment processing and analytics.

## Features

- **Multilingual Support**: Available in English, Spanish, French, and German
- **Interactive Chatbot Interface**: Easy and intuitive ticket booking experience
- **Online Payment Processing**: Complete transactions without human intervention
- **Exhibition Management**: Browse current, upcoming, and featured exhibitions
- **Ticket Management**: Purchase, view, and manage tickets
- **User Authentication**: Secure login and registration system
- **Admin Dashboard**: Analytics and management tools for staff
- **Testimonials**: Read visitor experiences

## Technology Stack

- **Frontend**: React, TailwindCSS, Shadcn UI, TanStack Query
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Internationalization**: i18next

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Yash_032/museum-ticket-booking.git
   cd museum-ticket-booking
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   SESSION_SECRET=your_session_secret
   ```

4. Initialize the database
   ```
   npm run db:push
   ```

5. Start the application
   ```
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

## Screenshots

- Home page with featured exhibitions
- Interactive chatbot booking interface
- Ticket management and checkout
- Admin analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.