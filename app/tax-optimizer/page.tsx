// 'use client';

// import { useState, useEffect } from 'react';
// import { useAuth } from '@/lib/auth-context';
// import { useRouter } from 'next/navigation';
// import Navbar from '@/components/layout/navbar';
// import Loading from '@/components/layout/loading';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Checkbox } from '@/components/ui/checkbox';
// import { useToast } from '@/hooks/use-toast';
// import { firestoreDB } from '@/lib/database';
// import { Shield, Calculator, TrendingUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// interface TaxSavingOption {
//   id: string;
//   section: string;
//   name: string;
//   maxLimit: number;
//   currentInvestment: number;
//   suggestedInvestment: number;
//   taxSaving: number;
//   description: string;
//   priority: 'high' | 'medium' | 'low';
// }

// export default function TaxOptimizerPage() {
//   const { user, loading } = useAuth();
//   const router = useRouter();
//   const { toast } = useToast();
  
//   const [annualIncome, setAnnualIncome] = useState(1200000);
//   const [taxRegime, setTaxRegime] = useState('old');
//   const [deductions, setDeductions] = useState({
//     section80C: 0,
//     section80D: 0,
//     section24B: 0,
//     nps: 0,
//   });
//   const [taxSavingOptions, setTaxSavingOptions] = useState<TaxSavingOption[]>([]);
//   const [totalTaxSaving, setTotalTaxSaving] = useState(0);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     calculateTaxOptimization();
//   }, [annualIncome, taxRegime, deductions]);

//   const calculateTaxOptimization = () => {
//     const options: TaxSavingOption[] = [
//       {
//         id: '1',
//         section: '80C',
//         name: 'ELSS Mutual Funds',
//         maxLimit: 150000,
//         currentInvestment: deductions.section80C,
//         suggestedInvestment: Math.min(150000, Math.max(0, 150000 - deductions.section80C)),
//         taxSaving: 0,
//         description: 'Tax-saving mutual funds with potential for high returns',
//         priority: 'high',
//       },
//       {
//         id: '2',
//         section: '80D',
//         name: 'Health Insurance Premium',
//         maxLimit: 25000,
//         currentInvestment: deductions.section80D,
//         suggestedInvestment: Math.min(25000, Math.max(0, 25000 - deductions.section80D)),
//         taxSaving: 0,
//         description: 'Health insurance premiums for self and family',
//         priority: 'high',
//       },
//       {
//         id: '3',
//         section: '24B',
//         name: 'Home Loan Interest',
//         maxLimit: 200000,
//         currentInvestment: deductions.section24B,
//         suggestedInvestment: Math.min(200000, Math.max(0, 200000 - deductions.section24B)),
//         taxSaving: 0,
//         description: 'Interest on home loan for self-occupied property',
//         priority: 'medium',
//       },
//       {
//         id: '4',
//         section: '80CCD(1B)',
//         name: 'NPS (National Pension System)',
//         maxLimit: 50000,
//         currentInvestment: deductions.nps,
//         suggestedInvestment: Math.min(50000, Math.max(0, 50000 - deductions.nps)),
//         taxSaving: 0,
//         description: 'Additional deduction for NPS investment',
//         priority: 'medium',
//       },
//     ];

//     // Calculate tax saving for each option
//     const taxRate = getTaxRate(annualIncome);
//     let totalSaving = 0;

//     options.forEach(option => {
//       option.taxSaving = option.suggestedInvestment * taxRate;
//       totalSaving += option.taxSaving;
//     });

//     setTaxSavingOptions(options);
//     setTotalTaxSaving(totalSaving);
//   };

//   const getTaxRate = (income: number): number => {
//     if (taxRegime === 'new') {
//       if (income <= 300000) return 0;
//       if (income <= 600000) return 0.05;
//       if (income <= 900000) return 0.1;
//       if (income <= 1200000) return 0.15;
//       if (income <= 1500000) return 0.2;
//       return 0.3;
//     } else {
//       if (income <= 250000) return 0;
//       if (income <= 500000) return 0.05;
//       if (income <= 1000000) return 0.2;
//       return 0.3;
//     }
//   };

//   const saveTaxOptimization = async () => {
//     if (!user) return;

//     setSaving(true);
//     try {
//       const optimization = {
//         annualIncome,
//         taxRegime,
//         deductions,
//         taxSavingOptions,
//         totalTaxSaving,
//         calculatedAt: new Date(),
//       };

//       await firestoreDB.saveTaxOptimization(user.uid, optimization);

//       toast({
//         title: 'Tax optimization saved!',
//         description: 'Your tax planning strategy has been saved to your profile.',
//       });
//     } catch (error) {
//       toast({
//         title: 'Error saving optimization',
//         description: 'Please try again.',
//         variant: 'destructive',
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <Loading />;
//   }

//   if (!user) {
//     router.push('/');
//     return <Loading />;
//   }

//   return (
//     <div className="min-h-screen bg-[#e5e7eb]">
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-[#2b2731] mb-2">Tax Optimizer</h1>
//           <p className="text-[#2b2731] opacity-80">
//             Maximize your tax savings with intelligent planning strategies
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Input Section */}
//           <Card className="bg-[#c2dedb] border-[#2f8c8c]">
//             <CardHeader>
//               <CardTitle className="text-[#2b2731] flex items-center">
//                 <Calculator className="w-5 h-5 mr-2" />
//                 Tax Details
//               </CardTitle>
//               <CardDescription className="text-[#2b2731] opacity-70">
//                 Enter your income and current investments
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div>
//                 <Label htmlFor="annualIncome" className="text-[#2b2731] mb-2 block">
//                   Annual Income (₹)
//                 </Label>
//                 <Input
//                   id="annualIncome"
//                   type="number"
//                   value={annualIncome}
//                   onChange={(e) => setAnnualIncome(parseInt(e.target.value) || 0)}
//                   className="bg-white border-[#2f8c8c] text-[#2b2731]"
//                   min="0"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="taxRegime" className="text-[#2b2731] mb-2 block">
//                   Tax Regime
//                 </Label>
//                 <Select value={taxRegime} onValueChange={setTaxRegime}>
//                   <SelectTrigger className="bg-white border-[#2f8c8c] text-[#2b2731]">
//                     <SelectValue placeholder="Select tax regime" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="old">Old Tax Regime</SelectItem>
//                     <SelectItem value="new">New Tax Regime</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>

//               <div>
//                 <Label htmlFor="section80C" className="text-[#2b2731] mb-2 block">
//                   Current 80C Investments (₹)
//                 </Label>
//                 <Input
//                   id="section80C"
//                   type="number"
//                   value={deductions.section80C}
//                   onChange={(e) => setDeductions({...deductions, section80C: parseInt(e.target.value) || 0})}
//                   className="bg-white border-[#2f8c8c] text-[#2b2731]"
//                   min="0"
//                   max="150000"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="section80D" className="text-[#2b2731] mb-2 block">
//                   Health Insurance Premium (₹)
//                 </Label>
//                 <Input
//                   id="section80D"
//                   type="number"
//                   value={deductions.section80D}
//                   onChange={(e) => setDeductions({...deductions, section80D: parseInt(e.target.value) || 0})}
//                   className="bg-white border-[#2f8c8c] text-[#2b2731]"
//                   min="0"
//                   max="25000"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="section24B" className="text-[#2b2731] mb-2 block">
//                   Home Loan Interest (₹)
//                 </Label>
//                 <Input
//                   id="section24B"
//                   type="number"
//                   value={deductions.section24B}
//                   onChange={(e) => setDeductions({...deductions, section24B: parseInt(e.target.value) || 0})}
//                   className="bg-white border-[#2f8c8c] text-[#2b2731]"
//                   min="0"
//                   max="200000"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="nps" className="text-[#2b2731] mb-2 block">
//                   NPS Investment (₹)
//                 </Label>
//                 <Input
//                   id="nps"
//                   type="number"
//                   value={deductions.nps}
//                   onChange={(e) => setDeductions({...deductions, nps: parseInt(e.target.value) || 0})}
//                   className="bg-white border-[#2f8c8c] text-[#2b2731]"
//                   min="0"
//                   max="50000"
//                 />
//               </div>

//               <Button
//                 onClick={saveTaxOptimization}
//                 className="w-full bg-[#81dbe0] hover:bg-[#4e7e93] text-[#2b2731]"
//                 disabled={saving}
//               >
//                 {saving ? 'Saving...' : 'Save Tax Plan'}
//               </Button>
//             </CardContent>
//           </Card>

//           {/* Tax Saving Summary */}
//           <Card className="bg-[#c2dedb] border-[#2f8c8c]">
//             <CardHeader>
//               <CardTitle className="text-[#2b2731] flex items-center">
//                 <Shield className="w-5 h-5 mr-2" />
//                 Tax Saving Summary
//               </CardTitle>
//               <CardDescription className="text-[#2b2731] opacity-70">
//                 Your potential tax savings
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div className="text-center p-6 bg-[#81dbe0] rounded-lg">
//                   <h3 className="text-2xl font-bold text-[#2b2731] mb-2">
//                     ₹{totalTaxSaving.toLocaleString()}
//                   </h3>
//                   <p className="text-[#2b2731] opacity-80">Total Tax Savings</p>
//                 </div>

//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#2f8c8c]">
//                     <span className="text-[#2b2731] opacity-70">Annual Income</span>
//                     <span className="font-semibold text-[#2b2731]">₹{annualIncome.toLocaleString()}</span>
//                   </div>
                  
//                   <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#2f8c8c]">
//                     <span className="text-[#2b2731] opacity-70">Tax Regime</span>
//                     <span className="font-semibold text-[#2b2731]">
//                       {taxRegime === 'old' ? 'Old Regime' : 'New Regime'}
//                     </span>
//                   </div>
                  
//                   <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#2f8c8c]">
//                     <span className="text-[#2b2731] opacity-70">Current Tax Rate</span>
//                     <span className="font-semibold text-[#2b2731]">
//                       {(getTaxRate(annualIncome) * 100).toFixed(0)}%
//                     </span>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                   <div className="flex items-center space-x-2 mb-2">
//                     <CheckCircle className="w-5 h-5 text-green-600" />
//                     <span className="font-semibold text-green-800">Tax Saving Tip</span>
//                   </div>
//                   <p className="text-sm text-green-700">
//                     Invest in ELSS funds for the highest tax savings and potential returns. 
//                     These investments have a 3-year lock-in period but offer dual benefits of tax saving and wealth creation.
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Optimization Recommendations */}
//           <Card className="bg-[#c2dedb] border-[#2f8c8c]">
//             <CardHeader>
//               <CardTitle className="text-[#2b2731] flex items-center">
//                 <TrendingUp className="w-5 h-5 mr-2" />
//                 Recommendations
//               </CardTitle>
//               <CardDescription className="text-[#2b2731] opacity-70">
//                 Optimize your tax savings
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {taxSavingOptions.map((option) => (
//                   <div key={option.id} className="bg-white p-4 rounded-lg border border-[#2f8c8c]">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="font-semibold text-[#2b2731]">{option.name}</h3>
//                       <span className="text-xs bg-[#81dbe0] text-[#2b2731] px-2 py-1 rounded">
//                         {option.section}
//                       </span>
//                     </div>
//                     <p className="text-sm text-[#2b2731] opacity-70 mb-3">{option.description}</p>
                    
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-[#2b2731] opacity-70">Suggested Investment:</span>
//                         <span className="font-semibold text-[#2b2731]">
//                           ₹{option.suggestedInvestment.toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-[#2b2731] opacity-70">Tax Saving:</span>
//                         <span className="font-semibold text-green-600">
//                           ₹{option.taxSaving.toLocaleString()}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-[#2b2731] opacity-70">Max Limit:</span>
//                         <span className="text-[#2b2731]">₹{option.maxLimit.toLocaleString()}</span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tax Planning Tips */}
//         <Card className="bg-[#c2dedb] border-[#2f8c8c] mt-8">
//           <CardHeader>
//             <CardTitle className="text-[#2b2731] flex items-center">
//               <FileText className="w-5 h-5 mr-2" />
//               Tax Planning Tips
//             </CardTitle>
//             <CardDescription className="text-[#2b2731] opacity-70">
//               Expert advice for effective tax planning
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div className="bg-white p-6 rounded-lg border border-[#2f8c8c]">
//                 <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
//                 <h3 className="font-semibold text-[#2b2731] mb-2">Start Early</h3>
//                 <p className="text-sm text-[#2b2731] opacity-70">
//                   Begin tax planning at the start of the financial year to maximize benefits and avoid last-minute rush.
//                 </p>
//               </div>
              
//               <div className="bg-white p-6 rounded-lg border border-[#2f8c8c]">
//                 <TrendingUp className="w-8 h-8 text-[#4e7e93] mb-3" />
//                 <h3 className="font-semibold text-[#2b2731] mb-2">Diversify Investments</h3>
//                 <p className="text-sm text-[#2b2731] opacity-70">
//                   Spread your 80C investments across ELSS, EPF, PPF, and NSC for optimal risk-return balance.
//                 </p>
//               </div>
              
//               <div className="bg-white p-6 rounded-lg border border-[#2f8c8c]">
//                 <AlertCircle className="w-8 h-8 text-orange-600 mb-3" />
//                 <h3 className="font-semibold text-[#2b2731] mb-2">Review Annually</h3>
//                 <p className="text-sm text-[#2b2731] opacity-70">
//                   Review and adjust your tax planning strategy annually based on income changes and new regulations.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





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
import ChartReceipt from '@/components/charts/chart-receipt';




export default function ReceiptUploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);


  // Fetch all receipts for the user
  useEffect(() => {
    if (!user) return;
    const fetchReceipts = async () => {
      const form16 = await firestoreDB.getAllTaxOptimizations(user.uid);
      setReceipts(form16);
    };
    fetchReceipts();
    // Listen for real-time updates
    const unsub = realtimeDB.onUserTaxOptimizationsChange(user.uid, setReceipts);
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
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please choose a Form 16 file to upload.",
        variant: "destructive",
      });
      return;
    }
  
    if (!user) {
      toast({
        title: "User not authenticated",
        description: "Please sign in before uploading a receipt.",
        variant: "destructive",
      });
      return;
    }
  
    setUploading(true);
  
    try {
      console.log("📤 Uploading Form16...");
  
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await fetch("/api/form16-upload", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || "Unknown error occurred during upload.");
      }
  
      const data = await res.json();
      console.log("✅ Received data:", data);
  
      if (data.error) throw new Error(data.error);
  
      if (!data.old_regime && !data.new_regime && !data.final_advice) {
        throw new Error("Incomplete data received from the server.");
      }
  
      const taxOptimization = {
        old_regime: data.old_regime || '',
        new_regime: data.new_regime || '',
        final_advice: data.final_advice || '',
        investment_tips: Array.isArray(data.investment_tips) ? data.investment_tips : [],
        timestamp: new Date().toISOString(),
      };
  
      console.log("📦 Saving to DB:", taxOptimization);
  
      await Promise.all([
        realtimeDB.saveTaxOptimization(user.uid, taxOptimization),
        firestoreDB.saveTaxOptimization(user.uid, taxOptimization),
      ]);
  
      toast({
        title: "Form 16 processed successfully!",
        description: "Tax optimization insights have been saved to your account.",
      });
  
    } catch (error: any) {
      console.error("❌ Error during Form16 processing:", error.message || error);
  
      toast({
        title: "Failed to process Form 16",
        description: error?.message || "Please try again or upload manually.",
        variant: "destructive",
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


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!user) return;

  //   try {
  //     setUploading(true);

  //     const expense = {
  //       category: formData.category,
  //       total: parseFloat(formData.amount),
  //       items: extractedData?.items || [],
  //       fileName: extractedData?.fileName || uploadedFile?.name || null,
  //     };

  //     // Save to both Realtime Database and Firestore
  //     await Promise.all([
  //       realtimeDB.addExpense(user.uid, expense),
  //       firestoreDB.addExpense(user.uid, expense),
  //     ]);

  //     toast({
  //       title: 'Expense added successfully!',
  //       description: 'Your expense has been recorded and categorized.',
  //     });

  //     // Reset form
  //     setFormData({
  //       vendor: '',
  //       amount: '',
  //       date: new Date().toISOString().split('T')[0],
  //       category: '',
  //       description: '',
  //       paymentMethod: '',
  //     });
  //     setUploadedFile(null);
  //     setExtractedData(null);
  //     setManualEntry(false);

  //   } catch (error) {
  //     toast({
  //       title: 'Error saving expense',
  //       description: 'Please try again.',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     console.log("hello")
  //     setUploading(false);
  //   }
  // };

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

  // const generateAIResponse = async (userMessage: string, userId: string): Promise<string> => {
  //   if (!userId) {
  //     toast({
  //       title: 'Please sign in to use AI queries.',
  //       description: 'Please try again or enter manually.',
  //       variant: 'destructive',
  //     });
  //     return '';
  //   }
  
  //   try {

  //     const receipts = await realtimeDB.getAllUserExpenses(userId);

  //     const res = await fetch('/api/receipt/receipt-query', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ receipts, question: userMessage }),
  //     });
  
  //     const data = await res.json();
  
  //     if (!res.ok) {
  //       throw new Error(data.error || 'Failed to get response from AI.');
  //     }
  
  //     return data.response;
  //   } catch (err: any) {
  //     console.error('AI query error:', err);
  //     toast({
  //       title: 'AI failed to answer. Try again.',
  //       description: 'Please try again or enter manually.',
  //       variant: 'destructive',
  //     });
  //     return 'Sorry, I could not understand that.';
  //   }
  // };
  

  // const handleSendMessage = async () => {
  //   if (!newMessage.trim()) return;

  //   // Validate message length
  //   if (newMessage.length > 500) {
  //     toast({
  //       title: 'Message too long',
  //       description: 'Please keep your question under 500 characters.',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }
  //   const userMessage: ChatMessage = {
  //     id: Date.now().toString(),
  //     type: 'user',
  //     content: newMessage,
  //     timestamp: new Date(),
  //   };

  //   setChatMessages(prev => [...prev, userMessage]);
  //   setNewMessage('');
  //   setIsTyping(true);
  //   const userId = user?.uid;
    

  //   try {
  //     // Get AI response
  //     const responseContent = await generateAIResponse(newMessage, userId!);
      
  //     const aiResponse: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       type: 'ai',
  //       content: responseContent,
  //       timestamp: new Date(),
  //     };

  //     setChatMessages(prev => [...prev, aiResponse]);
  //   } catch (error) {
  //     console.error('Error getting AI response:', error);
  //     const errorResponse: ChatMessage = {
  //       id: (Date.now() + 1).toString(),
  //       type: 'ai',
  //       content: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again in a few minutes.',
  //       timestamp: new Date(),
  //     };
  //     setChatMessages(prev => [...prev, errorResponse]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // };
  

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    router.push('/');
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#e5e7eb]">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2b2731] mb-2">Tax Optimizer</h1>
          <p className="text-[#2b2731] opacity-80">
            Optimize your Tax in one click
          </p>
        </div>

        <div className=" grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="bg-[#c2dedb] border-[#2f8c8c]">
            <CardHeader>
              <CardTitle className="text-[#2b2731]">Upload Form-16</CardTitle>
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
        <h2 className="text-2xl font-bold text-[#2b2731] mb-4 mt-8">Tax Guide</h2>
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
                      <span className="font-semibold text-[#2b2731]">Form 16</span>
                    </div>
                    <div className="font-bold text-[#2b2731]">Dated on: {receipt.timestamp?.seconds
                            ? new Date(receipt.timestamp.seconds * 1000).toLocaleDateString()
                            : new Date(receipt.timestamp).toLocaleDateString()}</div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Old Regime */}
                      <div className="bg-green-50 border border-green-400 rounded-xl p-4 shadow">
                        <h2 className="text-xl font-bold text-green-800 mb-2">Old Regime</h2>
                        <div className="text-green-900">
                          <h3 className="font-semibold">Pros:</h3>
                          <ul className="list-disc pl-5 mb-2">
                            {receipt.old_regime.pros.map((pro: string, idx: number) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                          <h3 className="font-semibold">Cons:</h3>
                          <ul className="list-disc pl-5 mb-2">
                            {receipt.old_regime.cons.map((con: string, idx: number) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                          <p className="mt-2 font-medium">Tax: ₹{receipt.old_regime.tax}</p>
                        </div>
                      </div>

                      {/* New Regime */}
                      <div className="bg-red-50 border border-red-400 rounded-xl p-4 shadow">
                        <h2 className="text-xl font-bold text-red-800 mb-2">New Regime</h2>
                        <div className="text-red-900">
                          <h3 className="font-semibold">Pros:</h3>
                          <ul className="list-disc pl-5 mb-2">
                            {receipt.new_regime.pros.map((pro: string, idx: number) => (
                              <li key={idx}>{pro}</li>
                            ))}
                          </ul>
                          <h3 className="font-semibold">Cons:</h3>
                          <ul className="list-disc pl-5 mb-2">
                            {receipt.new_regime.cons.map((con: string, idx: number) => (
                              <li key={idx}>{con}</li>
                            ))}
                          </ul>
                          <p className="mt-2 font-medium">Tax: ₹{receipt.new_regime.tax}</p>
                        </div>
                      </div>

                      {/* Investment Tips */}
                      <div className="bg-blue-50 border border-blue-400 rounded-xl p-4 shadow">
                        <h2 className="text-xl font-bold text-blue-800 mb-2">Investment Tips</h2>
                        <ul className="space-y-3">
                          {receipt.investment_tips.map((tip: any, idx: number) => (
                            <li key={idx} className="bg-white border rounded p-3">
                              <p className="font-semibold text-sm text-gray-600">Section: {tip.section}</p>
                              <p className="text-sm">Current: ₹{tip.current} / ₹{tip.max_limit}</p>
                              <p className="text-gray-700 mt-1">{tip.tip}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Final Advice */}
                      <div className="bg-yellow-50 border border-yellow-400 rounded-xl p-4 shadow">
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">Final Advice</h2>
                        <p className="text-yellow-900 leading-relaxed">{receipt.final_advice}</p>
                        
                      </div>
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
        
      </div>


    </div>
  );
}

export const dynamic = 'force-dynamic';