import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Investment, CreateInvestmentForm, UpdateInvestmentForm } from '@/types';

const INVESTMENTS_COLLECTION = 'investments';

// Create investment
export async function createInvestment(
  userId: string,
  investmentData: CreateInvestmentForm
): Promise<Investment> {
  try {
    const investment: Omit<Investment, 'id'> = {
      ...investmentData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(collection(db, INVESTMENTS_COLLECTION), investment);
    
    return {
      id: docRef.id,
      ...investment,
    };
  } catch (error) {
    console.error('Error creating investment:', error);
    throw error;
  }
}

// Get all investments for a user
export async function getUserInvestments(userId: string): Promise<Investment[]> {
  try {
    const q = query(
      collection(db, INVESTMENTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const investments: Investment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        purchaseDate: data.purchaseDate.toDate(),
      } as Investment);
    });

    return investments;
  } catch (error) {
    console.error('Error getting user investments:', error);
    throw error;
  }
}

// Get single investment
export async function getInvestment(
  investmentId: string,
  userId: string
): Promise<Investment | null> {
  try {
    const docRef = doc(db, INVESTMENTS_COLLECTION, investmentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    
    // Verify the investment belongs to the user
    if (data.userId !== userId) {
      throw new Error('Unauthorized access to investment');
    }

    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      purchaseDate: data.purchaseDate.toDate(),
    } as Investment;
  } catch (error) {
    console.error('Error getting investment:', error);
    throw error;
  }
}

// Update investment
export async function updateInvestment(
  investmentData: UpdateInvestmentForm,
  userId: string
): Promise<Investment> {
  try {
    const { id, ...updateData } = investmentData;
    
    // First verify the investment belongs to the user
    const existingInvestment = await getInvestment(id, userId);
    if (!existingInvestment) {
      throw new Error('Investment not found or unauthorized');
    }

    const docRef = doc(db, INVESTMENTS_COLLECTION, id);
    
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: new Date(),
    });

    // Return updated investment
    const updatedInvestment = await getInvestment(id, userId);
    if (!updatedInvestment) {
      throw new Error('Failed to retrieve updated investment');
    }

    return updatedInvestment;
  } catch (error) {
    console.error('Error updating investment:', error);
    throw error;
  }
}

// Delete investment
export async function deleteInvestment(
  investmentId: string,
  userId: string
): Promise<void> {
  try {
    // First verify the investment belongs to the user
    const existingInvestment = await getInvestment(investmentId, userId);
    if (!existingInvestment) {
      throw new Error('Investment not found or unauthorized');
    }

    const docRef = doc(db, INVESTMENTS_COLLECTION, investmentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting investment:', error);
    throw error;
  }
}

// Get investments by type
export async function getInvestmentsByType(
  userId: string,
  type: string
): Promise<Investment[]> {
  try {
    const q = query(
      collection(db, INVESTMENTS_COLLECTION),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const investments: Investment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        purchaseDate: data.purchaseDate.toDate(),
      } as Investment);
    });

    return investments;
  } catch (error) {
    console.error('Error getting investments by type:', error);
    throw error;
  }
}
