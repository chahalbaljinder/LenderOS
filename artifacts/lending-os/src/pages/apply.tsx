import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, ChevronRight, Shield, User, FileText, Briefcase, Activity } from "lucide-react";
import { useGetMe, useListLoanProducts, useCreateLoanApplication } from "@workspace/api-client-react";

export default function CustomerApply() {
  const { data: user } = useGetMe();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  // Need to know tenant ID to list their products. 
  // In a real flow, the customer signs up via a specific tenant's branded URL.
  // For this demo, we assume the user object has the tenantId they are applying to.
  const { data: productsRes, isLoading: loadingProducts } = useListLoanProducts(
    { active: true, tenantId: user?.tenantId || undefined },
    { query: { enabled: !!user?.tenantId } }
  );

  const createApplication = useCreateLoanApplication();

  const handleApply = () => {
    if (!selectedProduct || !user?.id) return;
    
    // Create draft application
    createApplication.mutate({
      data: {
        customerId: user.id, // In a real app we'd create a customer profile first
        productId: selectedProduct,
        requestedAmount: 500000,
        requestedTenure: 12,
        purpose: "Business Expansion"
      }
    }, {
      onSuccess: (app) => {
        // Redirect to a real status page
        // setLocation(`/apply/status/${app.id}`);
        setStep(4);
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#040405]">
        <img src="/logo.svg" alt="LendingOS" className="h-5" />
        <div className="font-mono text-xs text-zinc-500">
          SECURE_APPLICATION_ENVIRONMENT
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -z-10 -translate-y-1/2" />
          
          {[
            { id: 1, label: "Select Product", icon: <Briefcase className="w-4 h-4" /> },
            { id: 2, label: "Profile & KYC", icon: <User className="w-4 h-4" /> },
            { id: 3, label: "Financials", icon: <FileText className="w-4 h-4" /> },
            { id: 4, label: "Approval", icon: <Activity className="w-4 h-4" /> }
          ].map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 bg-black px-2">
              <div className={`w-10 h-10 flex items-center justify-center border transition-colors ${
                step > s.id ? 'bg-primary/20 border-primary text-primary' :
                step === s.id ? 'bg-white text-black border-white' :
                'bg-[#09090b] border-white/20 text-zinc-500'
              }`}>
                {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
              </div>
              <span className={`font-mono text-[10px] uppercase tracking-wider ${step >= s.id ? 'text-white' : 'text-zinc-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: Product Selection */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-semibold mb-2">Select Loan Product</h1>
            <p className="text-zinc-400 mb-8 font-light">Choose the financing option that best fits your needs.</p>
            
            <div className="grid gap-4">
              {loadingProducts ? (
                <div className="p-8 text-center font-mono text-sm text-primary animate-pulse border border-white/10">FETCHING_PRODUCTS...</div>
              ) : (
                productsRes?.data?.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`p-6 border cursor-pointer transition-all ${selectedProduct === product.id ? 'border-primary bg-primary/5' : 'border-white/10 bg-[#09090b] hover:border-white/30'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium mb-1">{product.name}</h3>
                        <p className="text-sm text-zinc-400">{product.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedProduct === product.id ? 'border-primary bg-primary' : 'border-zinc-600'}`}>
                        {selectedProduct === product.id && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                    
                    <div className="flex gap-6 mt-6 pt-6 border-t border-white/5 font-mono text-sm">
                      <div>
                        <div className="text-zinc-500 text-xs mb-1 uppercase">Amount Range</div>
                        <div className="text-white">₹{product.minAmount.toLocaleString()} - ₹{product.maxAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-1 uppercase">Interest Rate</div>
                        <div className="text-primary">{product.interestRate}% <span className="text-zinc-500 text-xs">p.a.</span></div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-xs mb-1 uppercase">Tenure</div>
                        <div className="text-white">{product.minTenureMonths} - {product.maxTenureMonths} mo</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                disabled={!selectedProduct}
                onClick={() => setStep(2)}
                className="px-8 py-3 bg-white text-black font-semibold font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
              >
                CONTINUE
              </button>
            </div>
          </div>
        )}

        {/* Step 2: KYC */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-semibold mb-2">Verify Identity</h1>
            <p className="text-zinc-400 mb-8 font-light">We need your PAN and Aadhaar to verify your identity.</p>
            
            <div className="space-y-6">
              <div className="p-6 border border-white/10 bg-[#09090b]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-sm uppercase text-white">PAN Verification</h3>
                  <span className="text-xs font-mono text-yellow-500 px-2 py-0.5 border border-yellow-500/20 bg-yellow-500/10">PENDING</span>
                </div>
                <div className="flex gap-4">
                  <input type="text" placeholder="Enter PAN Number" className="flex-1 bg-black border border-white/20 px-4 py-2 font-mono text-white focus:outline-none focus:border-primary uppercase" />
                  <button className="px-6 py-2 border border-white/20 font-mono text-sm hover:bg-white hover:text-black transition-colors">VERIFY</button>
                </div>
              </div>
              
              <div className="p-6 border border-white/10 bg-[#09090b] opacity-50 pointer-events-none">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-mono text-sm uppercase text-white">Aadhaar eKYC</h3>
                  <span className="text-xs font-mono text-zinc-500 px-2 py-0.5 border border-zinc-700 bg-zinc-800">LOCKED</span>
                </div>
                <p className="text-sm text-zinc-400 font-mono">Complete PAN verification to unlock.</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-white/20 text-white font-mono text-sm hover:bg-white/5 transition-colors"
              >
                BACK
              </button>
              <button 
                onClick={() => setStep(3)}
                className="px-8 py-3 bg-white text-black font-semibold font-mono text-sm hover:bg-zinc-200 transition-colors"
              >
                SKIP FOR DEMO
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Financials & Submit */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-semibold mb-2">Loan Requirements</h1>
            <p className="text-zinc-400 mb-8 font-light">Specify your loan amount and submit for AI assessment.</p>
            
            <div className="p-8 border border-white/10 bg-[#09090b] mb-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block font-mono text-xs text-zinc-500 mb-2 uppercase">Requested Amount (₹)</label>
                  <input type="number" defaultValue="500000" className="w-full bg-black border border-white/20 px-4 py-3 font-mono text-2xl text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block font-mono text-xs text-zinc-500 mb-2 uppercase">Tenure (Months)</label>
                  <select className="w-full bg-black border border-white/20 px-4 py-3 font-mono text-xl text-white focus:outline-none focus:border-primary appearance-none">
                    <option value="6">6 Months</option>
                    <option value="12" selected>12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs text-zinc-500 mb-2 uppercase">Purpose of Loan</label>
                  <input type="text" defaultValue="Business Expansion" className="w-full bg-black border border-white/20 px-4 py-3 font-mono text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 border border-primary/30 bg-primary/5 mb-8 text-sm">
              <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-zinc-300">By submitting this application, you authorize LendingOS and its partners to fetch your credit report and evaluate your profile using automated risk models.</p>
            </div>

            <div className="flex justify-between">
              <button 
                onClick={() => setStep(2)}
                className="px-6 py-3 border border-white/20 text-white font-mono text-sm hover:bg-white/5 transition-colors"
              >
                BACK
              </button>
              <button 
                onClick={handleApply}
                disabled={createApplication.isPending}
                className="px-8 py-3 bg-primary text-black font-semibold font-mono text-sm hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                {createApplication.isPending ? 'PROCESSING...' : 'SUBMIT APPLICATION'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Final / Processing */}
        {step === 4 && (
          <div className="animate-in zoom-in-95 duration-500 text-center py-12">
            <div className="w-24 h-24 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-full mx-auto mb-8">
              <Activity className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">Application Submitted</h1>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Our AI Risk Engine is currently evaluating your profile. You will receive a notification once the risk score is computed.
            </p>
            <div className="font-mono text-xs text-zinc-500 p-4 border border-white/10 bg-[#09090b] inline-block">
              REF_ID: LOAN_APP_{Math.random().toString(36).substr(2, 9).toUpperCase()}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
