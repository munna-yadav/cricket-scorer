import { supabase } from '../supabase';

export type User = {
  id: string;
  username: string;
  role: string;
};

// Sign in using your custom user table
export async function signIn(username: string, password: string) {
  // Query your custom user table
  const { data, error } = await supabase
    .from('user')
    .select('id, username, role, password')
    .eq('username', username)
    .single();
    
  if (error) {
    throw new Error('Authentication failed');
  }
  
  // Simple password check - in a real app, you'd use proper hashing
  if (!data || data.password !== password) {
    throw new Error('Invalid username or password');
  }
  
  return {
    user: {
      id: data.id,
      username: data.username,
      role: data.role
    }
  };
}

// Check if the current user has admin role
export const isAdmin = async (): Promise<boolean> => {
  const adminUser = localStorage.getItem('adminUser');
  if (!adminUser) return false;
  
  try {
    const user = JSON.parse(adminUser);
    return user.role === 'admin';
  } catch (error) {
    console.error("Error parsing admin user data:", error);
    return false;
  }
};

// Store admin user in localStorage after successful login
export function setAdminUser(user: User) {
  localStorage.setItem('adminUser', JSON.stringify(user));
}

// Remove admin user from localStorage on logout
export function clearAdminUser() {
  localStorage.removeItem('adminUser');
}

// Simple logout function
export async function signOut() {
  clearAdminUser();
  return true;
}

export async function getCurrentUser(): Promise<User | null> {
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminUser) {
    return null;
  }
  
  try {
    const user = JSON.parse(adminUser);
    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  } catch (error) {
    console.error('Error parsing admin user from storage:', error);
    return null;
  }
} 