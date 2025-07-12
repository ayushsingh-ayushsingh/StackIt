# StackIt - AI-Powered Q&A Platform

StackIt is a modern, full-stack Q&A platform that promotes collaborative learning by providing a simple, user-friendly environment for community members to ask and answer questions efficiently. Built with cutting-edge technologies and AI integration for enhanced user experience.

## 🚀 Features

- **AI-Powered Answers**: Integrated Groq LLM for instant AI-generated responses
- **Rich Text Editor**: TipTap-based editor with emoji, image, and link support
- **Real-time Search**: Advanced search functionality across questions, tags, and authors
- **User Authentication**: Secure authentication powered by Clerk
- **Voting System**: Upvote/downvote answers with real-time updates
- **Tag Management**: Organize questions with custom tags
- **Admin Panel**: Comprehensive admin dashboard for platform management
- **Responsive Design**: Modern UI built with shadcn/ui components
- **Dark/Light Mode**: Theme switching with next-themes
- **Real-time Notifications**: User notification system

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark/light mode support

### Backend & Database
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **Neon** - Serverless PostgreSQL hosting
- **Prisma Accelerate** - Database connection pooling

### Authentication & AI
- **Clerk** - User authentication and management
- **Groq SDK** - AI language model integration
- **Marked** - Markdown to HTML conversion

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **TSX** - TypeScript execution for scripts

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **npm** package manager
- **PostgreSQL** database (or Neon account)
- **Clerk** account for authentication
- **Groq** API key for AI features

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ayushsingh-ayushsingh/StackIt.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AI Integration (Groq)
GROQ_API_KEY=your_groq_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database with sample data
npm run seed
```

### 5. Start Development Server

```bash
npm run dev
```

Your application will be available at `http://localhost:3000`

## 📁 Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI integration endpoints
│   │   ├── admin/        # Admin panel APIs
│   │   ├── answers/      # Answer management
│   │   ├── notifications/# Notification system
│   │   ├── questions/    # Question management
│   │   └── tags/         # Tag management
│   ├── admin/            # Admin dashboard pages
│   ├── questions/        # Question detail pages
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ai/              # AI-related components
│   ├── custom/          # Custom components
│   ├── questions/       # Question components
│   ├── search/          # Search functionality
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── prisma/              # Database schema and migrations
└── public/              # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## 🌟 Key Features Explained

### AI Integration
The platform uses Groq's LLM to provide instant AI-generated answers to user questions. The AI responses are formatted in markdown and converted to HTML for display.

### Rich Text Editor
Built with TipTap, the rich text editor supports:
- Emoji insertion
- Image uploads
- Link embedding
- Text alignment
- Placeholder text

### Authentication System
Clerk handles all authentication flows including:
- User registration and login
- Social authentication
- User profile management
- Role-based access control

### Database Design
The PostgreSQL database is designed with:
- User profiles with roles (GUEST, USER, ADMIN)
- Questions with rich text descriptions
- Answers with voting system
- Tags and question-tag relationships
- Notification system
- Admin action logging

## 👨‍💻 Author

**Ayush Singh**
- GitHub: [@ayushsingh-ayushsingh](https://www.github.com/ayushsingh-ayushsingh)

---

Crafted with ❤️ by Ayush Singh