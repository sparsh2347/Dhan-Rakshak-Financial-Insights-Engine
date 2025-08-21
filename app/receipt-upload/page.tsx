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


interface ChatMessage{
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ReceiptUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  // for chat section
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    vendor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    paymentMethod: '',
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

  // Fetch all receipts for the user
  useEffect(() => {
    if (!user) return;
    const fetchReceipts = async () => {
      const expenses = await firestoreDB.getUserExpenses(user.uid);
      setReceipts(expenses);
    };
    fetchReceipts();
    // Listen for real-time updates
    const unsub = realtimeDB.onUserExpensesChange(user.uid, setReceipts);
    return () => { if (unsub) unsub(); };
  }, [user]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      processReceipt(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const processReceipt = async (file: File) => {
    setUploading(true);
    try {
      console.log("uploading")
      const formData = new FormData();
      formData.append('file', file);
      // Use new API route
      const res = await fetch('/api/receipt/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "unknown error")
      }
      console.log("kajdkajkdsjajsd");
      console.log(res);
      const data = await res.json();
      if (data.length < 1) console.log("no data")
      if (data.error) throw new Error(data.error);
      // console.log("ahsdkljfaklsdjfalksjdflasjkdflk")
      console.log(data)
      // Set extracted data for form
      const expensesss = {
        vendor: data.vendor || '',
        total: data.total_amount || '',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.items?.[0]?.category || '',
        description: 'Auto-filled from receipt',
        paymentMethod: '',
        items: data.items || [],
        fileName: data.fileName,
      }
      console.log("calling db")
      console.log(expensesss)

      if (!user) return

      const db = await Promise.all([
        realtimeDB.addExpense(user.uid, expensesss),
        firestoreDB.addExpense(user.uid, expensesss)
      ]);

      console.log("before");

      console.log(db);

      setExtractedData({
        vendor: data.vendor || '',
        amount: data.total_amount || '',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.items?.[0]?.category || '',
        description: 'Auto-filled from receipt',
        paymentMethod: '',
        items: data.items || [],
        fileName: data.fileName,
      });
      setFormData({
        vendor: data.vendor || '',
        amount: data.total_amount || '',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.items?.[0]?.category || '',
        description: 'Auto-filled from receipt',
        paymentMethod: '',
      });


      console.log("ajsldajslkdfjas");
      toast({
        title: 'Receipt processed successfully!',
        description: 'Please verify the extracted information.',
      });
    } catch (error: any) {

      console.error("❌ Error during receipt upload:", error.message || error);
      toast({
        title: 'Error processing receipt',
        description: 'Please try again or enter manually.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  function extractAmount(text: string) {
    const match = text.match(/(?:Rs\.?|₹)\s?(\d+(\.\d{1,2})?)/i);
    return match ? match[1] : '';
  }

  function extractDate(text: string) {
    const match = text.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/);
    if (match) {
      const [d, m, y] = match[0].split(/[\/\-.]/);
      const yyyy = y.length === 2 ? `20${y}` : y;
      return new Date(`${yyyy}-${m}-${d}`).toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  }

  function extractVendor(text: string) {
    const lines = text.split('\n');
    return lines.length ? lines[0].trim() : 'Unknown Vendor';
  }

  function extractCategory(text: string) {
    const categories = {
      'Food & Dining': ['restaurant', 'cafe', 'meal', 'food', 'dining'],
      Groceries: ['grocery', 'supermarket', 'mart', 'kirana'],
      Transportation: ['uber', 'ola', 'taxi', 'fuel', 'petrol', 'bus', 'train'],
      Shopping: ['shopping', 'amazon', 'flipkart', 'store', 'purchase'],
      Entertainment: ['movie', 'netflix', 'pvr', 'bookmyshow'],
      'Bills & Utilities': ['electricity', 'water', 'bill', 'recharge'],
      Healthcare: ['pharmacy', 'doctor', 'hospital', 'clinic', 'medic'],
      Education: ['school', 'tuition', 'university', 'course'],
      Travel: ['flight', 'airline', 'hotel', 'booking.com'],
      Other: [],
    };

    const lower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(word => lower.includes(word))) {
        return category;
      }
    }
    return '';
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setUploading(true);

      const expense = {
        category: formData.category,
        total: parseFloat(formData.amount),
        items: extractedData?.items || [],
        fileName: extractedData?.fileName || uploadedFile?.name || null,
      };

      // Save to both Realtime Database and Firestore
      await Promise.all([
        realtimeDB.addExpense(user.uid, expense),
        firestoreDB.addExpense(user.uid, expense),
      ]);

      toast({
        title: 'Expense added successfully!',
        description: 'Your expense has been recorded and categorized.',
      });

      // Reset form
      setFormData({
        vendor: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        paymentMethod: '',
      });
      setUploadedFile(null);
      setExtractedData(null);
      setManualEntry(false);

    } catch (error) {
      toast({
        title: 'Error saving expense',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      console.log("hello")
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
  

  function getCategoryBreakdown(
    items: Array<{ category?: string; price?: number; quantity?: number; [key: string]: any }>
  ): { name: string; amount: number; items: any[] }[] {
    // 1) build a map of totals
    const map: Record<string, { amount: number; items: any[] }> = {};
  
    for (const item of items) {
      const name = item.category ?? "Uncategorized";
      // if you have price use price*qty, otherwise just qty
      const amount =
        item.price != null
          ? item.price * (item.quantity ?? 1)
          : item.quantity ?? 0;
  
      if (!map[name]) {
        map[name] = { amount: 0, items: [] };
      }
  
      map[name].amount += amount;
      map[name].items.push(item);
    }
  
    // 2) turn it into the chart‑friendly array
    return Object.entries(map).map(([name, entry]) => ({
      name,
      amount: entry.amount,
      items: entry.items,
    }));
  }

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

      const receipts = await realtimeDB.getAllUserExpenses(userId);

      const res = await fetch('/api/receipt/receipt-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipts, question: userMessage }),
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

    // Validate message length
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
    const userId = user?.uid;
    

    try {
      // Get AI response
      const responseContent = await generateAIResponse(newMessage, userId!);
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseContent,
        timestamp: new Date(),
      };

      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again in a few minutes.',
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
          <h1 className="text-3xl font-bold text-[#2b2731] mb-2">Upload Receipt</h1>
          <p className="text-[#2b2731] opacity-80">
            Scan your receipts or enter expenses manually
          </p>
        </div>

        <div className=" grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-[#c2dedb] border-[#2f8c8c]">
            <CardHeader>
              <CardTitle className="text-[#2b2731]">Upload Receipt</CardTitle>
              <CardDescription className="text-[#2b2731] opacity-70">
                Drag and drop your receipt or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                      ? 'border-[#81dbe0] bg-[#81dbe0]/10'
                      : 'border-[#2f8c8c] hover:border-[#81dbe0] hover:bg-[#81dbe0]/5'
                    }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-[#4e7e93] mx-auto mb-4" />
                  <p className="text-[#2b2731] font-medium mb-2">
                    {isDragActive ? 'Drop your receipt here' : 'Upload receipt image or PDF'}
                  </p>
                  <p className="text-[#2b2731] opacity-70 text-sm">
                    Supports JPEG, PNG, PDF files up to 10MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#81dbe0] rounded-full flex items-center justify-center mx-auto mb-4">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2b2731]" />
                    ) : (
                      <Check className="w-8 h-8 text-[#2b2731]" />
                    )}
                  </div>
                  <p className="text-[#2b2731] font-medium mb-2">
                    {uploading ? 'Processing receipt...' : 'Receipt uploaded successfully!'}
                  </p>
                  <p className="text-[#2b2731] opacity-70 text-sm mb-4">
                    {uploadedFile.name}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setUploadedFile(null);
                      setExtractedData(null);
                    }}
                    className="text-[#2b2731] border-[#2f8c8c]"
                  >
                    Upload Different File
                  </Button>
                </div>
              )}

              {/* <div className="mt-4 text-center">
                <Button
                  variant="default"
                  className="w-full bg-[#81dbe0] hover:bg-[#4e7e93] text-[#2b2731] mb-2"
                  onClick={autoExtractAndSave}
                  disabled={!uploadedFile || uploading}
                >
                  Auto Extract & Save
                </Button>
              </div> */}

              {/* <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setManualEntry(true)}
                  className="text-[#2b2731] border-[#2f8c8c]"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Enter Manually Instead
                </Button>
              </div> */}
            </CardContent>
          </Card>

          {/* Form Section */}
          {/* <Card className="bg-[#c2dedb] border-[#2f8c8c]">
            <CardHeader>
              <CardTitle className="text-[#2b2731]">Expense Details</CardTitle>
              <CardDescription className="text-[#2b2731] opacity-70">
                {extractedData ? 'Verify and edit the extracted information' : 'Enter expense details manually'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="vendor" className="text-[#2b2731]">Vendor/Store</Label>
                  <Input
                    id="vendor"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    placeholder="Enter store name"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-[#2b2731]">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-[#2b2731]">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-[#2b2731]">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-white border-[#2f8c8c] text-[#2b2731]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentMethod" className="text-[#2b2731]">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                    <SelectTrigger className="bg-white border-[#2f8c8c] text-[#2b2731]">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description" className="text-[#2b2731]">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional notes about this expense"
                    className="bg-white border-[#2f8c8c] text-[#2b2731]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#81dbe0] hover:bg-[#4e7e93] text-[#2b2731]"
                  disabled={uploading}
                >
                  {uploading ? 'Saving...' : 'Save Expense'}
                </Button>
              </form>
            </CardContent>
          </Card> */}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-[#2b2731] mb-4 mt-8">Your Receipts</h2>
        <div className="overflow-x-auto rounded-lg shadow-inner bg-[#c2dedb] border border-[#2f8c8c]">
          <div className="divide-y divide-[#2f8c8c]">
            <AnimatePresence>
              {receipts.length > 0 ? receipts.map((receipt) => (
                <motion.div
                  key={receipt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer hover:bg-[#81dbe0]/20 transition-colors px-4 py-3"
                  onClick={() => setExpandedReceiptId(expandedReceiptId === receipt.id ? null : receipt.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-[#2b2731]">{receipt.vendor}</span>
                      <span className="ml-2 text-[#2b2731] opacity-70">{receipt.fileName}</span>
                    </div>
                    <div className="font-bold text-[#2b2731]">₹{receipt.total}</div>
                  </div>
                  <AnimatePresence>
                    {expandedReceiptId === receipt.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-2"
                      >
                        <div className="bg-sky-200 rounded-lg p-4 border border-[#2f8c8c] space-y-4">
                          {/* Item List */}
                          {receipt.items && receipt.items.length > 0 ? (
                            <div>
                              <div className="font-semibold mb-1">Items:</div>
                              <ul className="space-y-1">
                                {receipt.items.map((item: any, idx: number) => (
                                  <li key={idx} className="flex justify-between">
                                    <span>{item.category} → {item.name}</span>
                                    <span>₹{item.price} {item.quantity ? `x${item.quantity}` : ''}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="italic text-[#2b2731] opacity-70">No itemized data</div>
                          )}

                          {/* Pie Chart for Item Categories */}
                          {receipt.items && receipt.items.length > 0 && (
                            <div className="border-t pt-4">
                              <div className="font-semibold mb-2 text-[#2b2731]">Category Breakdown:</div>
                              <ChartReceipt
                                data={getCategoryBreakdown(receipt.items)}
                                type="pie"
                              />

                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )) : 
              <div className="flex items-center justify-center h-40 w-full rounded-xl bg-muted/50 text-muted-foreground border border-dashed">
                <p className="text-center text-lg md:text-base font-medium">📭 No receipt found. Add one to get started!</p>
              </div>
              }
            </AnimatePresence>
          </div>
        </div>
        <div className='mt-5'>
        <Card className="bg-[#c2dedb] border-[#2f8c8c]">
              <CardHeader>
                <CardTitle className="text-[#2b2731] flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Ask Your AI
                </CardTitle>
                <CardDescription className="text-[#2b2731] opacity-70">
                  Ask questions about your receipt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 p-4 bg-white rounded-lg border border-[#2f8c8c]">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-[#2b2731] opacity-70 py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-[#4e7e93]" />
                      <p className="mb-2">Hi! I'm your AI assistant.</p>
                      <p className="text-sm">Ask me anything about from your previous uploaded reciept</p>
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
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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