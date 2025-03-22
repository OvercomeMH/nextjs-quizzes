# QuizMaster System Documentation

## Overview

QuizMaster is a dynamic quiz application that allows users to take quizzes, view their results, and track their progress. Administrators can create quizzes, add questions, and view analytics on user performance.

### Tech Stack

- **Frontend:** Next.js 14 (React framework) with App Router
- **Backend:** API Routes in Next.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS with shadcn/ui components
- **State Management:** React Context API
- **Hosting:** Vercel (recommended)

## Architecture

The application follows a client-server architecture:

1. **Client:** Next.js application rendering UI components and making API requests
2. **Server:** Next.js API routes handling data operations
3. **Database:** Supabase PostgreSQL database storing all application data
4. **Authentication:** Supabase Auth for user authentication and session management

## Project Structure

```
quizmaster/
├── app/                   # Next.js app directory (App Router)
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── quizzes/           # Quiz pages
│   └── layout.tsx         # Root layout with providers
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── ui/                # UI components from shadcn
│   └── ...                # Other components
├── lib/                   # Utility functions and shared code
│   ├── supabase.ts        # Supabase client configuration
│   └── ...                # Other utility functions
├── hooks/                 # Custom React hooks
├── styles/                # Global styles
├── public/                # Static assets
└── ...                    # Configuration files
```

## Data Model

The application uses the following core data models:

### User

- `id`: UUID (primary key)
- `email`: String (unique)
- `username`: String (unique)
- `full_name`: String
- `quizzes_taken`: Integer
- `total_points`: Integer
- `average_score`: Decimal
- `created_at`: Timestamp

### Quiz

- `id`: UUID (primary key)
- `title`: String
- `description`: String
- `difficulty`: String (easy, medium, hard)
- `created_by`: UUID (foreign key to User)
- `times_played`: Integer
- `created_at`: Timestamp
- `is_public`: Boolean

### Question

- `id`: UUID (primary key)
- `quiz_id`: UUID (foreign key to Quiz)
- `text`: String
- `options`: JSON Array
- `correct_answer`: Integer (index of correct option)
- `points`: Integer

### Submission

- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to User, nullable for anonymous submissions)
- `quiz_id`: UUID (foreign key to Quiz)
- `score`: Integer
- `total_possible`: Integer
- `time_spent`: Integer (seconds)
- `created_at`: Timestamp

### UserAnswer

- `id`: UUID (primary key)
- `submission_id`: UUID (foreign key to Submission)
- `question_id`: UUID (foreign key to Question)
- `selected_option`: Integer
- `is_correct`: Boolean

## Features

### User Features

- **Authentication:** Sign up, login, and logout
- **Profile Management:** View and update profile information
- **Quiz Taking:** Browse and take quizzes
- **Results Viewing:** See results after completing a quiz
- **Progress Tracking:** View quiz history and statistics

### Admin Features

- **Quiz Management:** Create, edit, and delete quizzes
- **Question Management:** Add, edit, and delete questions
- **Analytics:** View statistics on quiz performance

## API Endpoints

### Authentication APIs

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user

### Quiz APIs

- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/[id]` - Get a specific quiz
- `POST /api/quizzes` - Create a new quiz
- `PUT /api/quizzes/[id]` - Update a quiz
- `DELETE /api/quizzes/[id]` - Delete a quiz

### Question APIs

- `GET /api/quizzes/[id]/questions` - Get questions for a quiz
- `POST /api/questions` - Create a new question
- `PUT /api/questions/[id]` - Update a question
- `DELETE /api/questions/[id]` - Delete a question

### Submission APIs

- `POST /api/quizzes/submit` - Submit a quiz result
- `GET /api/users/[id]/submissions` - Get submissions for a user

## Routing Structure

### Public Routes

- `/` - Homepage
- `/login` - Login page
- `/register` - Registration page
- `/quizzes` - Browse quizzes

### Protected Routes

- `/dashboard` - User dashboard
- `/quizzes/[id]` - Take a specific quiz
- `/quizzes/[id]/results` - View results for a quiz

### Admin Routes

- `/admin/dashboard` - Admin dashboard
- `/admin/quizzes` - Manage quizzes
- `/admin/quizzes/create` - Create a new quiz
- `/admin/quizzes/[id]/edit` - Edit a quiz
- `/admin/quizzes/[id]/questions` - Manage questions for a quiz

## Development Guide

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env.local` file with the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
4. Run the development server: `npm run dev`
5. Access the application at `http://localhost:3000`

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set up the following tables:
   - `users`
   - `quizzes`
   - `questions`
   - `submissions`
   - `user_answers`
3. Configure table schemas according to the data model described above
4. Enable Row Level Security (RLS) with appropriate policies

### Authentication Setup

1. Configure Supabase Auth in your Supabase project
2. Enable Email/Password authentication
3. Configure email templates for verification emails

## Known Issues

- Session handling needs improvement for persistent login across page refreshes
- Admin functionality requires more robust access control
- Quiz submission could be optimized for better performance

## Future Improvements

- Add social login (Google, GitHub, etc.)
- Implement real-time updates for quiz analytics
- Add support for different question types (multiple choice, true/false, etc.)
- Introduce quiz categories and tags for better organization
- Implement quiz sharing functionality
- Add support for quiz comments and ratings 