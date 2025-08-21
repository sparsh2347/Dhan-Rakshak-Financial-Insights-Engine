// db.ts (Refactored and Optimized)
import {
  ref,
  push,
  set,
  onValue,
  off,
  get,
} from 'firebase/database';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { database, firestore } from './firebase';

// Utility to ensure parent user document exists
async function ensureUserDocExists(userId: string) {
  const userRef = doc(firestore, 'users', userId);
  await setDoc(userRef, { createdAt: serverTimestamp() }, { merge: true });
}

// Realtime Database
export const realtimeDB = {
  setUserProfile: async (userId: string, profile: any) => {
    const userRef = ref(database, `users/${userId}/profile`);
    await set(userRef, profile);
  },

  addExpense: async (userId: string, expense: any) => {
    const expensesRef = ref(database, `users/${userId}/expenses`);
    const newRef = push(expensesRef);
    console.log(expense.vendor)
    await set(newRef, {
      id: newRef.key,
      timestamp: Date.now(),
      category: expense.category,
      total: expense.total,
      vendor: expense.vendor,
      items: expense.items || [],
      fileName: expense.fileName || null,
    });
    return newRef.key;
  },

  getAllUserExpenses: async (userId: string) => {
    const expensesRef = ref(database, `users/${userId}/expenses`);
    const snapshot = await get(expensesRef);
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },
  

  onUserExpensesChange: (userId: string, callback: (expenses: any[]) => void) => {
    const expensesRef = ref(database, `users/${userId}/expenses`);
    return onValue(expensesRef, (snap) => {
      const data = snap.val();
      const expenses = data ? Object.values(data) : [];
      callback(expenses);
    });
  },

  // 1. Add a new loan
  addLoan: async (userId: string, loan: any) => {
    const loansRef = ref(database, `users/${userId}/loans`);
    const newRef = push(loansRef);
    await set(newRef, {
      id: newRef.key,
      timestamp: Date.now(),
      loan_category: loan.loan_category,
      monthly_installment: loan.monthly_installment,
      amount: loan.amount,
      interest_rate: loan.interest_rate,
      interest_type: loan.interest_type,
      start_date: loan.start_date,
      amount_paid: loan.amount_paid || 0,
      bank_name: loan.bank_name,
    });
    return newRef.key;
  },
  getAllUserLoans : async (userId: string) => {
    const loansRef = ref(database, `users/${userId}/loans`);
    const snapshot = await get(loansRef);
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },

  getUserLoans: async (userId: string) => {
    const loansRef = ref(database, `users/${userId}/loans`);
    const snapshot = await get(loansRef);
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },

  // 3. Get loans by category
  getLoansByCategory: async (userId: string, category: string) => {
    const loansRef = ref(database, `users/${userId}/loans`);
    const snapshot = await get(loansRef);
    const data = snapshot.val();
    if (!data) return [];

    return Object.values(data).filter(
      (loan: any) => loan.loan_category === category
    );
  },

  // Optional: Real-time loan listener
  onUserLoansChange: (userId: string, callback: (loans: any[]) => void) => {
    const loansRef = ref(database, `users/${userId}/loans`);
    return onValue(loansRef, (snap) => {
      const data = snap.val();
      const loans = data ? Object.values(data) : [];
      callback(loans);
    });
  },

  // tax optimization
  saveTaxOptimization: async (userId: string, optimization: any) => {
    const taxRef = ref(database, `users/${userId}/tax_optimizations`);
    const newRef = push(taxRef);
    await set(newRef, {
      id: newRef.key,
      timestamp: Date.now(),
      old_regime: optimization.old_regime,
      new_regime: optimization.new_regime,
      final_advice: optimization.final_advice,
      investment_tips: optimization.investment_tips,
    });
    return newRef.key;
  },

  getAllTaxOptimizations: async (userId: string) => {
    const taxRef = ref(database, `users/${userId}/tax_optimizations`);
    const snapshot = await get(taxRef);
    const data = snapshot.val();
    return data ? Object.values(data) : [];
  },

  onUserTaxOptimizationsChange: (
    userId: string,
    callback: (taxData: any[]) => void
  ) => {
    const taxRef = ref(database, `users/${userId}/tax_optimizations`);
    return onValue(taxRef, (snap) => {
      const data = snap.val();
      const taxData = data ? Object.values(data) : [];
      callback(taxData);
    });
  },
  
  

  off,
};

// Firestore
export const firestoreDB = {
  addExpense: async (userId: string, expense: any) => {
    await ensureUserDocExists(userId);
    const expensesRef = collection(firestore, `users/${userId}/expenses`);
    const docRef = await addDoc(expensesRef, {
      category: expense.category,
      total: expense.total,
      vendor: expense.vendor,
      items: expense.items || [],
      fileName: expense.fileName || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  getUserExpenses: async (userId: string) => {
    const expensesRef = collection(firestore, `users/${userId}/expenses`);
    const q = query(expensesRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  getExpensesByCategory: async (userId: string, category: string) => {
    const expensesRef = collection(firestore, `users/${userId}/expenses`);
    const q = query(
      expensesRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },


  // Loans Collection Operations
  addLoan: async (userId: string, loan: any) => {
    await ensureUserDocExists(userId);
    const loansRef = collection(firestore, `users/${userId}/loans`);
    const docRef = await addDoc(loansRef, {
      loan_category: loan.loan_category,
      monthly_installment: loan.monthly_installment,
      amount: loan.amount,
      interest_rate: loan.interest_rate,
      interest_type: loan.interest_type,
      start_date: loan.start_date,
      amount_paid: loan.amount_paid || 0,
      bank_name: loan.bank_name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  getUserLoans: async (userId: string) => {
    const loansRef = collection(firestore, `users/${userId}/loans`);
    const q = query(loansRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  getLoansByCategory: async (userId: string, category: string) => {
    const loansRef = collection(firestore, `users/${userId}/loans`);
    const q = query(
      loansRef,
      where('loan_category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },


  updateUserProfile: async (userId: string, profile: any) => {
    await ensureUserDocExists(userId);
    const userRef = doc(firestore, `users/${userId}`);
    await updateDoc(userRef, {
      ...profile,
      updatedAt: serverTimestamp(),
    });
  },
  // save the user SIP
  saveSIPCalculation: async (userId: string, calculation: any) => {
    await ensureUserDocExists(userId);
    const sipRef = collection(firestore, `users/${userId}/sip_calculations`);
    const docRef = await addDoc(sipRef, {
      ...calculation
    });
    return docRef.id;
  },

  saveTaxOptimization: async (userId: string, optimization: any) => {
    await ensureUserDocExists(userId);
    const taxRef = collection(firestore, `users/${userId}/tax_optimizations`);
    const docRef = await addDoc(taxRef, {
      timestamp: serverTimestamp(),
      old_regime: optimization.old_regime,
      new_regime: optimization.new_regime,
      final_advice: optimization.final_advice,
      investment_tips: optimization.investment_tips,
    });
    return docRef.id;
  },

  getAllTaxOptimizations: async (userId: string) => {
    const taxRef = collection(firestore, `users/${userId}/tax_optimizations`);
    const snapshot = await getDocs(taxRef);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
  }
  
};

// Mock Fi Money API (can be replaced later)
export const fiMoneyAPI = {
  getProfile: async (userId: string) => ({
    id: userId,
    name: 'User Name',
    email: 'user@example.com',
    balance: 50000,
    income: 80000,
    investments: 150000,
  }),

  getTransactions: async (userId: string) => [
    {
      id: '1',
      amount: -500,
      description: 'Grocery Store',
      date: new Date().toISOString(),
      category: 'Food',
    },
    {
      id: '2',
      amount: -200,
      description: 'Gas Station',
      date: new Date().toISOString(),
      category: 'Transportation',
    },
  ],

  getAssets: async (userId: string) => ({
    total: 150000,
    breakdown: {
      stocks: 80000,
      bonds: 30000,
      mutualFunds: 40000,
    },
  }),
};
