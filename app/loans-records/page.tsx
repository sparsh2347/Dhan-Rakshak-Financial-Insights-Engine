'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Navbar from '@/components/layout/navbar';
import Loading from '@/components/layout/loading';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { realtimeDB, firestoreDB } from '@/lib/database';
import { Upload, Camera, FileText, Check, X, MessageCircle, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseChart from '@/components/charts/expense-chart';
import ChartReceipt from '@/components/charts/chart-receipt';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';


interface ChatMessage{
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

type Loan = {
  amount_paid?: number;
  interest_rate?: number;
  [key: string]: any; // for flexibility
};

export default function ReceiptUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [loans, setLoans] = useState<any[]>([]);

  const [loansId, setLoansId] = useState<string | null>(null);

  // for chat section
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [investmentPeriod, setInvestmentPeriod] = useState<number>(5);

  // Form state
  const [formData, setFormData] = useState({
    bank_name: '',
    loan_category: '',
    amount: 0,
    monthly_installment: 0,
    interest_rate: 0,
    interest_type: '',
    start_date: '',
    amount_paid: 0,
  });
  

  const categories = [
    'Food & Dining',
    'Groceries',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Wallet',
  ];

  // useEffect(() => {
  //   if (!user) return;
  
  //   // Initial fetch from Firestore
  //   const fetchLoans = async () => {
  //     const data = await firestoreDB.getUserLoans(user.uid);
  //     if (data) setLoans(data);
  //   };
  
  //   fetchLoans();
  
  //   // Setup RealtimeDB listener
  //   const unsub = realtimeDB.onUserLoansChange(user.uid, (newData: any) => {
  //     if (newData) {
  //       setLoans(Object.values(newData));
  //     }
  //   });
  
  //   // Cleanup listener on unmount
  //   return () => {
  //     if (unsub) unsub();
  //   };
  // }, [user]);
  

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop,
  //   accept: {
  //     'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
  //     'application/pdf': ['.pdf'],
  //   },
  //   maxFiles: 1,
  // });


  useEffect(() => {
    if (!user) return;
  
    const fetchLoans = async () => {
      const data = await firestoreDB.getUserLoans(user.uid);
      if (data) setLoans(data);
    };
  
    fetchLoans();
  
    const unsub = realtimeDB.onUserLoansChange(user.uid, (newData: any) => {
  if (newData) {
    const parsedLoans: Loan[] = Object.values(newData);

    setLoans(parsedLoans);

    const simulatedYears = 5;
    setInvestmentPeriod(simulatedYears);

    const totalInvestment = parsedLoans.reduce(
      (sum, loan) => sum + (loan.amount_paid || 0),
      0
    );

    const averageRate =
      parsedLoans.reduce((sum, loan) => sum + (loan.interest_rate || 0), 0) /
        parsedLoans.length || 0;

    const chartData = Array.from({ length: simulatedYears }, (_, year) => {
      const investment = totalInvestment;
      const value = investment * Math.pow(1 + averageRate / 100, year + 1);
      return {
        year: new Date().getFullYear() + year,
        investment,
        value,
        returns: value - investment,
      };
    });

    setYearlyData(chartData);
  }
});
  
    return () => {
      if (unsub) unsub();
    };
  }, [user]);
  


  // const processReceipt = async (file: File) => {
  //   setUploading(true);
  //   try {
  //     console.log("uploading")
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     // Use new API route
  //     const res = await fetch('/api/receipt/upload', {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     if (!res.ok) {
  //       const errorData = await res.json();
  //       throw new Error(errorData?.error || "unknown error")
  //     }
  //     console.log("kajdkajkdsjajsd");
  //     console.log(res);
  //     const data = await res.json();
  //     if (data.length < 1) console.log("no data")
  //     if (data.error) throw new Error(data.error);
  //     // console.log("ahsdkljfaklsdjfalksjdflasjkdflk")
  //     console.log(data)
  //     // Set extracted data for form
  //     const expensesss = {
  //       vendor: data.vendor || '',
  //       total: data.total_amount || '',
  //       date: data.date || new Date().toISOString().split('T')[0],
  //       category: data.items?.[0]?.category || '',
  //       description: 'Auto-filled from receipt',
  //       paymentMethod: '',
  //       items: data.items || [],
  //       fileName: data.fileName,
  //     }
  //     console.log("calling db")
  //     console.log(expensesss)

  //     if (!user) return

  //     const db = await Promise.all([
  //       realtimeDB.addExpense(user.uid, expensesss),
  //       firestoreDB.addExpense(user.uid, expensesss),
  //     ]);

  //     console.log("before");

  //     console.log(db);

  //     setExtractedData({
  //       vendor: data.vendor || '',
  //       amount: data.total_amount || '',
  //       date: data.date || new Date().toISOString().split('T')[0],
  //       category: data.items?.[0]?.category || '',
  //       description: 'Auto-filled from receipt',
  //       paymentMethod: '',
  //       items: data.items || [],
  //       fileName: data.fileName,
  //     });
  //     setFormData({
  //       vendor: data.vendor || '',
  //       amount: data.total_amount || '',
  //       date: data.date || new Date().toISOString().split('T')[0],
  //       category: data.items?.[0]?.category || '',
  //       description: 'Auto-filled from receipt',
  //       paymentMethod: '',
  //     });


  //     console.log("ajsldajslkdfjas");
  //     toast({
  //       title: 'Receipt processed successfully!',
  //       description: 'Please verify the extracted information.',
  //     });
  //   } catch (error: any) {

  //     console.error("❌ Error during receipt upload:", error.message || error);
  //     toast({
  //       title: 'Error processing receipt',
  //       description: 'Please try again or enter manually.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // function extractAmount(text: string) {
  //   const match = text.match(/(?:Rs\.?|₹)\s?(\d+(\.\d{1,2})?)/i);
  //   return match ? match[1] : '';
  // }

  // function extractDate(text: string) {
  //   const match = text.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/);
  //   if (match) {
  //     const [d, m, y] = match[0].split(/[\/\-.]/);
  //     const yyyy = y.length === 2 ? `20${y}` : y;
  //     return new Date(`${yyyy}-${m}-${d}`).toISOString().split('T')[0];
  //   }
  //   return new Date().toISOString().split('T')[0];
  // }

  // function extractVendor(text: string) {
  //   const lines = text.split('\n');
  //   return lines.length ? lines[0].trim() : 'Unknown Vendor';
  // }

  // function extractCategory(text: string) {
  //   const categories = {
  //     'Food & Dining': ['restaurant', 'cafe', 'meal', 'food', 'dining'],
  //     Groceries: ['grocery', 'supermarket', 'mart', 'kirana'],
  //     Transportation: ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'bus', 'train'],
  //     Shopping: ['shopping', 'amazon', 'flipkart', 'store', 'purchase'],
  //     Entertainment: ['movie', 'netflix', 'pvr', 'bookmyshow'],
  //     'Bills & Utilities': ['electricity', 'water', 'bill', 'recharge'],
  //     Healthcare: ['pharmacy', 'doctor', 'hospital', 'clinic', 'medic'],
  //     Education: ['school', 'tuition', 'university', 'course'],
  //     Travel: ['flight', 'airline', 'hotel', 'booking.com'],
  //     Other: [],
  //   };

  //   const lower = text.toLowerCase();
  //   for (const [category, keywords] of Object.entries(categories)) {
  //     if (keywords.some(word => lower.includes(word))) {
  //       return category;
  //     }
  //   }
  //   return '';
  // }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const userId = user?.uid;
    try {
      const db = await Promise.all([
        await firestoreDB.addLoan(userId!, formData),
        await realtimeDB.addLoan(userId!, formData)
      ])
      toast({
        title: 'Loan saved successfully',
        description: 'All details have been stored.',
      });
      setFormData({
        bank_name: '',
        loan_category: '',
        amount: 0,
        monthly_installment: 0,
        interest_rate: 0,
        interest_type: '',
        start_date: '',
        amount_paid: 0,
      });
    } catch (err) {
      toast({
        title: 'Failed to save loan',
        description: 'error while uploading to database',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };
  

  const autoExtractAndSave = async () => {
    if (!user || !uploadedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      console.log("before")
      formData.append('file', uploadedFile);
      console.log("before2")
      const res = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });
      console.log("lakjsdfljkalskdfja");
      console.log("the data", res);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      // Save to both Realtime Database and Firestore
      const expense = {
        category: data.category,
        total: data.total,
        items: data.items || [],
        fileName: data.fileName,
      };
      await Promise.all([
        realtimeDB.addExpense(user.uid, expense),
        firestoreDB.addExpense(user.uid, expense),
      ]);
      toast({
        title: 'Receipt extracted and saved!',
        description: 'All details and items have been stored.',
      });
      setUploadedFile(null);
      setExtractedData(null);
    } catch (error) {
      console.error("❌ Error during receipt upload:", error);
      toast({
        title: 'Error extracting or saving',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // function getCategoryBreakdown(items: any[]): { name: string; amount: number; items: any[] }[] {
  //   const categoryMap: Record<string, { amount: number; items: any[] }> = {};
  
  //   for (const item of items) { 
  //     const category = item.category || 'Uncategorized';
  //     const amount = (item.price || 0) * (item.quantity || 1);
  //     if (!categoryMap[category]) {
  //       categoryMap[category] = { amount: 0, items: [] };
  //     }
  //     categoryMap[category].amount += amount;
  //     categoryMap[category].items.push(item);
  //   }

  //   return Object.entries(categoryMap).map(([name, data]) => ({
  //     name,
  //     amount: data.amount,
  //     items: data.items,
  //   }));
  // }
  

  // function getCategoryBreakdown(
  //   items: Array<{ category?: string; price?: number; quantity?: number; [key: string]: any }>
  // ): { name: string; amount: number; items: any[] }[] {
  //   // 1) build a map of totals
  //   const map: Record<string, { amount: number; items: any[] }> = {};
  
  //   for (const item of items) {
  //     const name = item.category ?? "Uncategorized";
  //     // if you have price use price*qty, otherwise just qty
  //     const amount =
  //       item.price != null
  //         ? item.price * (item.quantity ?? 1)
  //         : item.quantity ?? 0;
  
  //     if (!map[name]) {
  //       map[name] = { amount: 0, items: [] };
  //     }
  
  //     map[name].amount += amount;
  //     map[name].items.push(item);
  //   }
  
  //   // 2) turn it into the chart‑friendly array
  //   return Object.entries(map).map(([name, entry]) => ({
  //     name,
  //     amount: entry.amount,
  //     items: entry.items,
  //   }));
  // }

  const generateAIResponse = async (userMessage: string, userId: string): Promise<string> => {
    if (!userId) {
      toast({
        title: 'Please sign in to use AI queries.',
        description: 'Please try again or enter manually.',
        variant: 'destructive',
      });
      return '';
    }

    try {
      const loansData = await realtimeDB.getAllUserLoans(userId);
      // console.log(loansData);

      const res = await fetch('/api/loans-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loansData, question: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from AI.');
      }

      return data.response;
    } catch (err: any) {
      console.error('AI query error:', err);
      toast({
        title: 'AI failed to answer. Try again.',
        description: 'Please try again or enter manually.',
        variant: 'destructive',
      });
      return 'Sorry, I could not understand that.';
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (newMessage.length > 500) {
      toast({
        title: 'Message too long',
        description: 'Please keep your question under 500 characters.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      const responseContent = await generateAIResponse(newMessage, user?.uid!);
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: 'Sorry, something went wrong. Please try again later.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };
  

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    router.push('/');
    return <Loading />;
  }

  return (
    <div className="min-h-screen ">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2b2731] mb-2">Track Your Loans</h1>
          <p className="text-[#2b2731] opacity-80">
            Scan your receipts or enter expenses manually
          </p>
        </div>

        <div className="flex justify-center w-full px-4">
          {/* Upload Section */}
          
          {/* Form Section */}
          <Card className="bg-[#c2dedb] border-[#2f8c8c] w-full max-w-xl">
            <CardHeader>
                <CardTitle className="text-[#2b2731]">Loan Details</CardTitle>
                <CardDescription className="text-[#2b2731] opacity-70">
                Enter your loan details
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                    <Label htmlFor="bank_name" className="text-[#2b2731]">Bank Name</Label>
                    <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Enter bank name"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                    />
                </div>

                <div>
                    <Label htmlFor="loan_category" className="text-[#2b2731]">Loan Category</Label>
                    <Select
                    value={formData.loan_category}
                    onValueChange={(value) => setFormData({ ...formData, loan_category: value })}
                    >
                    <SelectTrigger className="bg-white border-[#2f8c8c] text-[#2b2731]">
                        <SelectValue placeholder="Select loan category" />
                    </SelectTrigger>
                    <SelectContent>
                        {['Home Loan', 'Personal Loan', 'Education Loan', 'Car Loan'].map((category) => (
                        <SelectItem key={category} value={category}>
                            {category}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="amount" className="text-[#2b2731]">Loan Amount (₹)</Label>
                    <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    placeholder="Enter loan amount"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                    />
                </div>

                <div>
                    <Label htmlFor="monthly_installment" className="text-[#2b2731]">Monthly Installment (₹)</Label>
                    <Input
                    id="monthly_installment"
                    type="number"
                    value={formData.monthly_installment}
                    onChange={(e) => setFormData({ ...formData, monthly_installment: parseFloat(e.target.value) })}
                    placeholder="EMI per month"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                    />
                </div>

                <div>
                    <Label htmlFor="interest_rate" className="text-[#2b2731]">Interest Rate (%)</Label>
                    <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) })}
                    placeholder="Enter interest rate"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                    />
                </div>

                <div>
                    <Label htmlFor="interest_type" className="text-[#2b2731]">Interest Type</Label>
                    <Select
                    value={formData.interest_type}
                    onValueChange={(value) => setFormData({ ...formData, interest_type: value })}
                    >
                    <SelectTrigger className="bg-white border-[#2f8c8c] text-[#2b2731]">
                        <SelectValue placeholder="Select interest type" />
                    </SelectTrigger>
                    <SelectContent>
                        {['Fixed', 'Floating'].map((type) => (
                        <SelectItem key={type} value={type}>
                            {type}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="start_date" className="text-[#2b2731]">Start Date</Label>
                    <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                    />
                </div>

                <div>
                    <Label htmlFor="amount_paid" className="text-[#2b2731]">Amount Paid So Far (₹)</Label>
                    <Input
                    id="amount_paid"
                    type="number"
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
                    placeholder="Enter amount paid"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-[#81dbe0] hover:bg-[#4e7e93] text-[#2b2731]"
                    disabled={uploading}
                >
                    {uploading ? 'Saving...' : 'Save Loan'}
                </Button>
                </form>
            </CardContent>
            </Card>

        </div>
      </div>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 pb-8">
  <h2 className="text-2xl font-bold text-[#2b2731] mb-4 mt-8">Your Loans</h2>

  <div className="rounded-lg shadow-inner bg-[#c2dedb] border border-[#2f8c8c] divide-y divide-[#2f8c8c]">
    <AnimatePresence>
      {loans.length > 0 ? loans.map((loan) => (
        <motion.div
          key={loan.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="cursor-pointer hover:bg-[#81dbe0]/20 transition-colors px-4 py-3"
          onClick={() => setLoansId(loansId === loan.id ? null : loan.id)}
        >
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#2b2731]">{loan.bank_name}</span>
            <span className="font-bold text-[#2b2731]">₹{loan.amount?.toLocaleString()}</span>
          </div>

          <AnimatePresence>
            {loansId === loan.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-2"
              >
                <div className="bg-sky-200 rounded-lg p-4 border border-[#2f8c8c] space-y-4">
                  {/* Loan Info */}
                  <div className="grid grid-cols-2 gap-4 text-[#2b2731] font-medium">
                    <InfoBlock label="Loan Category" value={loan.loan_category} />
                    <InfoBlock label="Interest Type" value={loan.interest_type} />
                    <InfoBlock label="Amount Paid" value={`₹${loan.amount_paid?.toLocaleString()}`} />
                    <InfoBlock label="Interest Rate" value={`${loan.interest_rate}%`} />
                    <InfoBlock label="Monthly EMI" value={`₹${loan.monthly_installment?.toLocaleString()}`} />
                    <InfoBlock label="Start Date" value={loan.start_date} />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="bg-[#c2dedb] border-[#2f8c8c]">
                      <CardHeader>
                        <CardTitle className="text-[#2b2731]">Growth Over Time</CardTitle>
                        <CardDescription className="text-[#2b2731] opacity-70">
                          Investment vs Returns over {investmentPeriod} years
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={yearlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, '']} />
                            <Line type="monotone" dataKey="investment" stroke="#4e7e93" strokeWidth={2} name="Investment" />
                            <Line type="monotone" dataKey="value" stroke="#81dbe0" strokeWidth={3} name="Value" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#c2dedb] border-[#2f8c8c]">
                      <CardHeader>
                        <CardTitle className="text-[#2b2731]">Annual Returns</CardTitle>
                        <CardDescription className="text-[#2b2731] opacity-70">
                          Year-wise return breakdown
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                      <div style={{ width: '100%', height: 300 }}>
                      <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={yearlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                            <Tooltip formatter={(value) => [`₹${(value as number).toLocaleString()}`, '']} />
                            <Bar dataKey="returns" fill="#81dbe0" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )) : 
      <div className="flex items-center justify-center h-40 w-full rounded-xl bg-muted/50 text-muted-foreground border border-dashed">
        <p className="text-center text-lg md:text-base font-medium">📭 No loans found. Add one to get started!</p>
      </div>
    
      }
    </AnimatePresence>
  </div>

  {/* Chat Section */}
  <div className="mt-8">
    <Card className="bg-[#c2dedb] border-[#2f8c8c]">
      <CardHeader>
        <CardTitle className="text-[#2b2731] flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Ask Your AI
        </CardTitle>
        <CardDescription className="text-[#2b2731] opacity-70">
          Ask questions about your loans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 overflow-y-auto mb-4 p-4 bg-white rounded-lg border border-[#2f8c8c]">
          {chatMessages.length === 0 ? (
            <div className="text-center text-[#2b2731] opacity-70 py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-[#4e7e93]" />
              <p className="mb-2">Hi! I'm your AI assistant.</p>
              <p className="text-sm">Got questions about your loans? I’m here to help — ask me anything!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-[#81dbe0] text-[#2b2731]'
                      : 'bg-[#4e7e93] text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#4e7e93] text-white p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about investments, taxes, retirement... (max 500 chars)"
            className="bg-white border-[#2f8c8c] text-[#2b2731]"
            maxLength={500}
          />
          <Button
            onClick={handleSendMessage}
            className="bg-[#81dbe0] hover:bg-[#4e7e93] text-[#2b2731]"
            disabled={!newMessage.trim() || isTyping}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs text-[#2b2731] opacity-60 mt-1">
          {newMessage.length}/500 characters
        </div>
      </CardContent>
    </Card>
  </div>
</div>
    </div>
  );
}

const InfoBlock = ({ label, value }: { label: string, value: string | number }) => (
  <div>
    <div className="text-sm opacity-70">{label}</div>
    <div>{value}</div>
  </div>
);


export const dynamic = 'force-dynamic';
