// Simple mock database for users
// In a real app, this would be stored in a database

interface User {
  id: string;
  username: string;
  password: string; // In a real app, this would be hashed
  name: string;
  email: string;
  stats: {
    quizzesTaken: number;
    averageScore: number;
    totalPoints: number;
    rank: string;
  };
  settings: {
    emailNotifications: boolean;
    publicProfile: boolean;
  };
}

// Mock user data - we'll start with one test user
export const users: User[] = [
  {
    id: "1",
    username: "testuser",
    password: "password123", // This would be hashed in a real app
    name: "Test User",
    email: "test@example.com",
    stats: {
      quizzesTaken: 5,
      averageScore: 82,
      totalPoints: 410,
      rank: "Quiz Novice"
    },
    settings: {
      emailNotifications: true,
      publicProfile: true
    }
  }
];

// Simple auth functions
export function findUserByUsername(username: string): User | undefined {
  return users.find(user => user.username === username);
}

export function authenticateUser(username: string, password: string): User | null {
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

// Function to get a user by ID
export function getUserById(id: string): User | undefined {
  return users.find(user => user.id === id);
}

// Add a new user
export function addUser(userData: Omit<User, 'id'>): User {
  const newUser: User = {
    ...userData,
    id: (users.length + 1).toString(),
    stats: userData.stats || {
      quizzesTaken: 0,
      averageScore: 0,
      totalPoints: 0,
      rank: "Beginner"
    },
    settings: userData.settings || {
      emailNotifications: true,
      publicProfile: true
    }
  };
  
  users.push(newUser);
  return newUser;
}

// Update user data
export function updateUser(id: string, data: Partial<User>): User | null {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = {
    ...users[userIndex],
    ...data,
    // Make sure the nested objects are merged properly
    settings: {
      ...users[userIndex].settings,
      ...(data.settings || {})
    },
    stats: {
      ...users[userIndex].stats,
      ...(data.stats || {})
    }
  };
  
  return users[userIndex];
} 