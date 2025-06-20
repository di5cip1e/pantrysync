import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { 
  User, 
  Household, 
  HouseholdMember, 
  PantryItem, 
  ShoppingList, 
  ShoppingListItem, 
  Activity 
} from '@/types';

// Household Services
export const householdService = {
  async create(name: string, description: string, createdBy: string, userEmail: string, userDisplayName: string): Promise<string> {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('🏗️ Creating household with invite code:', inviteCode);
    
    const member: HouseholdMember = {
      userId: createdBy,
      email: userEmail,
      displayName: userDisplayName,
      role: 'admin',
      joinedAt: new Date()
    };
    
    const householdData = {
      name,
      description,
      createdBy,
      members: [member],
      memberUserIds: [createdBy],
      inviteCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('💾 Saving household data to Firestore...');
    const docRef = await addDoc(collection(db, 'households'), householdData);
    console.log('✅ Household created with document ID:', docRef.id);
    return docRef.id;
  },

  async getByUserId(userId: string): Promise<Household[]> {
    console.log('🔍 Searching for households containing user:', userId);
    
    try {
      // Use proper Firestore query with memberUserIds array
      const q = query(
        collection(db, 'households'),
        where('memberUserIds', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      
      const userHouseholds = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          members: data.members?.map((member: any) => ({
            ...member,
            joinedAt: member.joinedAt?.toDate ? member.joinedAt.toDate() : new Date(member.joinedAt)
          })) || []
        };
      }) as Household[];
      
      console.log('🏠 Found', userHouseholds.length, 'households for user');
      return userHouseholds;
    } catch (error) {
      console.error('❌ Error fetching households:', error);
      throw error;
    }
  },

  async joinByInviteCode(inviteCode: string, userId: string, userEmail: string, displayName: string): Promise<string> {
    console.log('🔍 Looking for household with invite code:', inviteCode);
    
    const q = query(
      collection(db, 'households'),
      where('inviteCode', '==', inviteCode)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.error('❌ No household found with invite code:', inviteCode);
      throw new Error('Invalid invite code');
    }

    const householdDoc = snapshot.docs[0];
    const household = householdDoc.data() as Household;
    
    console.log('🏠 Found household:', household.name);
    
    // Check if user is already a member
    const isAlreadyMember = household.members.some(member => member.userId === userId);
    if (isAlreadyMember) {
      console.log('⚠️ User is already a member of this household');
      throw new Error('You are already a member of this household');
    }

    // Add user to household
    const newMember: HouseholdMember = {
      userId,
      email: userEmail,
      displayName,
      role: 'member',
      joinedAt: new Date()
    };

    console.log('➕ Adding user to household members');
    await updateDoc(doc(db, 'households', householdDoc.id), {
      members: [...household.members, newMember],
      memberUserIds: [...(household.memberUserIds || []), userId],
      updatedAt: serverTimestamp()
    });

    console.log('✅ Successfully joined household');
    return householdDoc.id;
  },

  async updateMemberRole(householdId: string, userId: string, newRole: 'admin' | 'member'): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    const householdDoc = await getDoc(householdRef);
    
    if (!householdDoc.exists()) {
      throw new Error('Household not found');
    }

    const household = householdDoc.data() as Household;
    const updatedMembers = household.members.map(member =>
      member.userId === userId ? { ...member, role: newRole } : member
    );

    await updateDoc(householdRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
  },

  async removeMember(householdId: string, userId: string): Promise<void> {
    const householdRef = doc(db, 'households', householdId);
    const householdDoc = await getDoc(householdRef);
    
    if (!householdDoc.exists()) {
      throw new Error('Household not found');
    }

    const household = householdDoc.data() as Household;
    const updatedMembers = household.members.filter(member => member.userId !== userId);
    const updatedMemberUserIds = household.memberUserIds.filter(id => id !== userId);

    await updateDoc(householdRef, {
      members: updatedMembers,
      memberUserIds: updatedMemberUserIds,
      updatedAt: serverTimestamp()
    });
  }
};

// Pantry Services
export const pantryService = {
  async getItems(householdId: string): Promise<PantryItem[]> {
    const q = query(
      collection(db, 'pantryItems'),
      where('householdId', '==', householdId),
      orderBy('name')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expiryDate: doc.data().expiryDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as PantryItem[];
  },

  async addItem(item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const itemData = {
      ...item,
      expiryDate: item.expiryDate ? Timestamp.fromDate(item.expiryDate) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'pantryItems'), itemData);
    return docRef.id;
  },

  async updateItem(itemId: string, updates: Partial<PantryItem>): Promise<void> {
    const updateData = {
      ...updates,
      expiryDate: updates.expiryDate ? Timestamp.fromDate(updates.expiryDate) : null,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, 'pantryItems', itemId), updateData);
  },

  async deleteItem(itemId: string): Promise<void> {
    await deleteDoc(doc(db, 'pantryItems', itemId));
  },

  subscribeToItems(householdId: string, callback: (items: PantryItem[]) => void) {
    const q = query(
      collection(db, 'pantryItems'),
      where('householdId', '==', householdId),
      orderBy('name')
    );
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        expiryDate: doc.data().expiryDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as PantryItem[];
      callback(items);
    });
  }
};

// Shopping List Services
export const shoppingService = {
  async getLists(householdId: string): Promise<ShoppingList[]> {
    const q = query(
      collection(db, 'shoppingLists'),
      where('householdId', '==', householdId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      items: doc.data().items?.map((item: any) => ({
        ...item,
        createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt,
        completedAt: item.completedAt?.toDate ? item.completedAt.toDate() : item.completedAt
      })) || []
    })) as ShoppingList[];
  },

  async createList(name: string, householdId: string, createdBy: string, description?: string): Promise<string> {
    const listData = {
      name,
      description,
      householdId,
      createdBy,
      items: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'shoppingLists'), listData);
    return docRef.id;
  },

  async addItemToList(listId: string, item: Omit<ShoppingListItem, 'id' | 'createdAt'>): Promise<void> {
    const listRef = doc(db, 'shoppingLists', listId);
    const listDoc = await getDoc(listRef);
    
    if (!listDoc.exists()) {
      throw new Error('Shopping list not found');
    }

    const list = listDoc.data() as ShoppingList;
    const newItem: ShoppingListItem = {
      ...item,
      id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date() // Use regular Date for array fields
    };

    await updateDoc(listRef, {
      items: [...list.items, newItem],
      updatedAt: serverTimestamp()
    });
  },

  async updateListItem(listId: string, itemId: string, updates: Partial<ShoppingListItem>): Promise<void> {
    const listRef = doc(db, 'shoppingLists', listId);
    const listDoc = await getDoc(listRef);
    
    if (!listDoc.exists()) {
      throw new Error('Shopping list not found');
    }

    const list = listDoc.data() as ShoppingList;
    const updatedItems = list.items.map(item =>
      item.id === itemId ? { 
        ...item, 
        ...updates,
        completedAt: updates.completedAt || (updates.completed ? new Date() : item.completedAt)
      } : item
    );

    await updateDoc(listRef, {
      items: updatedItems,
      updatedAt: serverTimestamp()
    });
  },

  async removeItemFromList(listId: string, itemId: string): Promise<void> {
    const listRef = doc(db, 'shoppingLists', listId);
    const listDoc = await getDoc(listRef);
    
    if (!listDoc.exists()) {
      throw new Error('Shopping list not found');
    }

    const list = listDoc.data() as ShoppingList;
    const updatedItems = list.items.filter(item => item.id !== itemId);

    await updateDoc(listRef, {
      items: updatedItems,
      updatedAt: serverTimestamp()
    });
  },

  subscribeToLists(householdId: string, callback: (lists: ShoppingList[]) => void) {
    const q = query(
      collection(db, 'shoppingLists'),
      where('householdId', '==', householdId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const lists = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        items: doc.data().items?.map((item: any) => ({
          ...item,
          createdAt: item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt,
          completedAt: item.completedAt?.toDate ? item.completedAt.toDate() : item.completedAt
        })) || []
      })) as ShoppingList[];
      callback(lists);
    });
  }
};

// Activity Services
export const activityService = {
  async addActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<void> {
    const activityData = {
      ...activity,
      createdAt: serverTimestamp()
    };
    
    await addDoc(collection(db, 'activities'), activityData);
  },

  async getActivities(householdId: string, limit: number = 50): Promise<Activity[]> {
    const q = query(
      collection(db, 'activities'),
      where('householdId', '==', householdId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.slice(0, limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Activity[];
  },

  subscribeToActivities(householdId: string, callback: (activities: Activity[]) => void) {
    const q = query(
      collection(db, 'activities'),
      where('householdId', '==', householdId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Activity[];
      callback(activities);
    });
  }
};

// Image Upload Service
export const imageService = {
  async uploadImage(uri: string, path: string): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const imageRef = ref(storage, path);
    await uploadBytes(imageRef, blob);
    
    return await getDownloadURL(imageRef);
  },

  async deleteImage(path: string): Promise<void> {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  }
};