'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  FileText, 
  UploadCloud, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { submitApplication, getUserProfile } from '@/lib/api'; // Import getUserProfile

export default function ApplicationForm() {
  const params = useParams();
  const router = useRouter();
  
  // 1. Get Service Name from URL (Dynamic)
  // Example: URL /apply/police-clearance -> "Police Clearance"
  const serviceId = params.id as string;
  const serviceTitle = serviceId
    ? serviceId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : "Service Application";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true); // Loading state for profile
  
  // 2. Form Data State (Initially Empty)
  const [formData, setFormData] = useState({
    nic: '', 
    name: '',
    phone: '',
    address: '',
    reason: ''
  });

  // 3. FETCH REAL USER DATA ON LOAD
  useEffect(() => {
    async function loadUserData() {
      try {
        setFetchingUser(true);
        const userProfile = await getUserProfile();
        
        // Auto-fill form with Database Data
        setFormData(prev => ({
          ...prev,
          nic: userProfile.nic || '',
          name: userProfile.fullname || '',
          phone: userProfile.phone || '',
          address: userProfile.address || ''
        }));
      } catch (error) {
        console.error("Failed to load user details", error);
        alert("Could not load user details. Please check your connection.");
      } finally {
        setFetchingUser(false);
      }
    }
    loadUserData();
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    alert("File upload simulated! (Files attached)");
  };

  // MAIN LOGIC: Handle Steps and Submission
  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // FINAL STEP: Submit to Backend
      setLoading(true);
      
      try {
        const payload = {
            service_type: serviceTitle, // Use the Dynamic Title
            applicant_nic: formData.nic, // Use Real NIC
            details: {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                reason: formData.reason
            },
            status: "Pending"
        };

        await submitApplication(payload);
        router.push('/payment');

      } catch (error) {
        console.error("Submission Error:", error);
        alert("Failed to submit application. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // If fetching user data, show loading screen
  if (fetchingUser) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-10 h-10 mb-4 text-blue-600" />
        <p>Verifying Digital Identity...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      
      {/* Page Header */}
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-blue-600 flex items-center mb-4">
            <ArrowLeft size={16} className="mr-1"/> Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600"/> {serviceTitle} Application
        </h1>
        {/* Dynamic Ref ID based on timestamp for uniqueness */}
        <p className="text-gray-500">Application Reference: <span className="font-mono text-gray-700">REQ-{new Date().getTime().toString().slice(-6)}</span></p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
            <span className={`text-sm font-bold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>1. Details</span>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>2. Uploads</span>
            <span className={`text-sm font-bold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>3. Review</span>
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
                className="bg-blue-600 h-full transition-all duration-500 ease-in-out" 
                style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
            ></div>
        </div>
      </div>

      {/* ==========================
          STEP 1: VERIFY DETAILS (REAL DATA)
      ========================== */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Verify Your Details</h2>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex gap-3">
                <ShieldCheck className="text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                    We have auto-filled this form using your <strong>National Digital Identity</strong>. Please check if the details are correct.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIC Number</label>
                    <input type="text" value={formData.nic} disabled className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 font-mono cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" value={formData.name} disabled className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input 
                        type="text" 
                        value={formData.phone} 
                        onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Application</label>
                    <input 
                        type="text" 
                        placeholder="e.g. Visa Purpose / Banking Requirement" 
                        value={formData.reason}
                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
            </div>
            
            <div className="flex justify-end">
                <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                    Next Step <ArrowRight size={18} />
                </button>
            </div>
        </div>
      )}

      {/* ==========================
          STEP 2: UPLOAD DOCUMENTS
      ========================== */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Required Proofs</h2>
            
            <div 
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-blue-500 transition-colors cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={32} />
                </div>
                <h3 className="text-gray-900 font-medium">Click or Drag documents here</h3>
                <p className="text-sm text-gray-500 mt-2">Required: Grama Niladhari Certificate, Scanned NIC Copy</p>
                <p className="text-xs text-gray-400 mt-1">Max file size: 5MB (PDF/JPG)</p>
            </div>

            <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <FileText className="text-gray-500" size={20}/>
                        <span className="text-sm font-medium text-gray-700">document_scan.pdf</span>
                    </div>
                    <CheckCircle className="text-green-500" size={18}/>
                </div>
            </div>

            <div className="flex justify-between mt-8">
                <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-900 font-medium">Back</button>
                <button onClick={handleNext} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                    Review Application <ArrowRight size={18} />
                </button>
            </div>
        </div>
      )}

      {/* ==========================
          STEP 3: REVIEW & SUBMIT
      ========================== */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Review Summary</h2>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Service Type</span>
                    <span className="font-bold text-gray-900">{serviceTitle}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Applicant</span>
                    <span className="font-bold text-gray-900">{formData.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Mobile</span>
                    <span className="font-bold text-gray-900">{formData.phone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Reason</span>
                    <span className="font-bold text-gray-900">{formData.reason || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700 font-medium">Government Fee</span>
                    <span className="font-bold text-xl text-blue-700">LKR 1,500.00</span>
                </div>
            </div>

            <div className="flex justify-between">
                <button 
                  onClick={() => setStep(2)} 
                  disabled={loading}
                  className="text-gray-500 hover:text-gray-900 font-medium disabled:opacity-50"
                >
                  Back
                </button>
                
                <button 
                  onClick={handleNext} 
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg disabled:opacity-70"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Proceed to Payment</>}
                </button>
            </div>
        </div>
      )}

    </div>
  );
}