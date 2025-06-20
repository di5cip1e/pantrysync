export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Household {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: HouseholdMember[];
  memberUserIds: string[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  joinedAt: Date;
}

export interface PantryItem {
  id: string;
  householdId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate?: Date;
  imageUrl?: string;
  notes?: string;
  lowStockThreshold: number;
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingList {
  id: string;
  householdId: string;
  name: string;
  description?: string;
  items: ShoppingListItem[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
  assignedTo?: string;
  addedBy: string;
  completedBy?: string;
  completedAt?: Date;
  createdAt: Date;
}

export interface Activity {
  id: string;
  householdId: string;
  type: 'pantry_add' | 'pantry_remove' | 'pantry_update' | 'shopping_add' | 'shopping_complete' | 'member_join' | 'member_leave';
  userId: string;
  userName: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}