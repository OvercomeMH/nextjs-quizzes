# Adding New Pages to QuizMaster

This guide explains how to add new pages to the QuizMaster application, especially focusing on implementing the missing pages identified in the `missing-pages.md` document.

## Understanding Next.js App Router

QuizMaster uses Next.js App Router, where:

- Each folder under `/app` represents a route segment
- `page.tsx` files inside these folders define the UI for that route
- Dynamic routes use brackets in folder names like `[id]`
- API endpoints are defined in the `/app/api` directory with `route.ts` files

## Step-by-Step Guide to Adding a New Page

### 1. Identify Where the Page Belongs

First, determine where in the routing structure your new page should go:

- User-facing pages go directly under `/app` (like `/app/quizzes`)
- Admin pages go under `/app/admin/`
- Dynamic pages use folder names with brackets (like `/app/quizzes/[id]`)

### 2. Create the Page Directory and Files

For example, to create the missing `/quizzes` page:

1. Create a directory: `/app/quizzes/page.tsx`
2. For dynamic routes (like `/admin/users/[id]`):
   - Create directory: `/app/admin/users/[id]/`
   - Add file: `/app/admin/users/[id]/page.tsx`

### 3. Basic Page Structure

Here's a template for a new page:

```tsx
"use client" // Add this if using client-side features like hooks

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Define types/interfaces as needed
interface YourDataType {
  id: string;
  title: string;
  // other properties
}

export default function YourPageName() {
  // State management, if needed
  const [data, setData] = useState<YourDataType[]>([])
  const [loading, setLoading] = useState(true)

  // Data fetching, if needed
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch data here - example:
        const response = await fetch('/api/your-endpoint')
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // UI Rendering
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header - Copy from similar pages for consistency */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            {/* Add navigation links */}
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">Your Page Title</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Your content goes here */}
            {data.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Card content */}
                  <Button className="mt-4">Action Button</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

## Example: Creating the Missing Quizzes Page

Here's how to implement the missing `/quizzes` page that shows all available quizzes:

1. Create a file at `/app/quizzes/page.tsx`
2. Use this skeleton:

```tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Define the quiz type based on the API response
interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  totalQuestions: number;
  metadata: {
    totalPoints: number;
    averageRating: number;
    timesPlayed: number;
  };
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch quizzes from the API
    const fetchQuizzes = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/quizzes')
        
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes')
        }
        
        const data = await response.json()
        setQuizzes(data)
      } catch (error) {
        console.error('Error fetching quizzes:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuizzes()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold">
              QuizMaster
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:underline">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container py-6">
        <h1 className="text-2xl font-bold mb-6">All Quizzes</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading quizzes...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
              <Card key={quiz.id}>
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-4">
                    <div>Difficulty: {quiz.difficulty}</div>
                    <div>{quiz.totalQuestions} questions</div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/quizzes/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
```

## Creating API Routes (if needed)

If your new page needs new API endpoints, follow these steps:

1. Create a new file in the appropriate location under `/app/api`
   - For example: `/app/api/your-feature/route.ts`

2. Implement the API handler:

```typescript
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import 'server-only'

export async function GET() {
  try {
    // Your API logic here
    // Example: Reading from data files
    const dataPath = path.join(process.cwd(), 'data', 'your-data.json')
    const fileContents = await fs.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContents)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
```

## Best Practices for QuizMaster Pages

1. **Consistent UI Components**
   - Reuse the header and navigation structure from existing pages
   - Use UI components from `/components/ui/` for consistent styling

2. **Error Handling**
   - Always include loading states
   - Handle API errors gracefully
   - Display user-friendly error messages

3. **TypeScript Types**
   - Define clear interfaces for your data structures
   - Reuse types from other files when appropriate

4. **Responsive Design**
   - Use Tailwind's responsive classes (sm:, md:, lg:)
   - Test on multiple screen sizes

5. **API Integration**
   - Fetch data from the API endpoints in useEffect hooks
   - Handle loading states appropriately
   - Consider adding pagination for large data sets

## Implementing the Missing Pages

For each missing page identified in `missing-pages.md`:

1. **`/quizzes`**
   - Implement as shown in the example above

2. **`/admin/quizzes`**
   - Create directory and page.tsx file
   - List all quizzes with edit/analytics options
   - Provide "Create Quiz" button

3. **`/admin/quizzes/[id]/edit`**
   - Create form for editing quiz details and questions
   - Add save functionality

4. **`/admin/users/*` Pages**
   - First create the admin/users directory
   - Then implement each specific page with appropriate functionality
   - Follow the user management patterns from other admin pages

## Testing Your New Pages

1. Run the development server: `npm run dev`
2. Navigate to your new page route in the browser
3. Test all functionality and interactions
4. Verify it looks good on different screen sizes

## Need Help?

If you need further guidance, refer to:
- The project's existing code for examples
- [Next.js App Router Documentation](https://nextjs.org/docs)
- The `documentation.md` file for overall system understanding 