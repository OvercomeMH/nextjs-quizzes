// File-based database for users
// Mark this module as server-only
import 'server-only';

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

// Function to read users from the JSON file
async function readUsers(): Promise<User[]> {
  try {
    // Dynamically import fs and path modules to ensure they're only loaded on the server
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const usersFilePath = path.default.join(process.cwd(), 'data', 'users.json');
    const fileContents = await fs.default.readFile(usersFilePath, 'utf-8');
    const data = JSON.parse(fileContents);
    return data.users || [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

// Function to write users to the JSON file
async function writeUsers(users: User[]): Promise<void> {
  try {
    // Dynamically import fs and path modules
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const usersFilePath = path.default.join(process.cwd(), 'data', 'users.json');
    const data = { users };
    await fs.default.writeFile(usersFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users file:', error);
  }
}

// Simple auth functions
export async function findUserByUsername(username: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.username === username);
}

export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await findUserByUsername(username);
  if (!user || user.password !== password) {
    return null;
  }
  return user;
}

// Function to get a user by ID
export async function getUserById(id: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.id === id);
}

// Add a new user
export async function addUser(userData: Omit<User, 'id'>): Promise<User> {
  const users = await readUsers();
  
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
  await writeUsers(users);
  return newUser;
}

// Update user data
export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
  const users = await readUsers();
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
  
  await writeUsers(users);
  return users[userIndex];
} 