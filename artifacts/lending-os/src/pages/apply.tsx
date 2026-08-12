import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { Check, ChevronRight, Shield, User, FileText, Briefcase, Activity, AlertCircle, Loader2, ArrowLeft, Plus } from "lucide-react";
import { useGetMe, useListLoanProducts, useCreateLoanApplication } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { EmptyStates } from "@/components/ui/empty-state";

const steps = [
  { id: 1, label: "Select Product", icon: Briefcase, description: "Choose your loan product" },
  { id: 2, label: "Personal & KYC", icon: User, description: "Verify your identity" },
  { id: 3, label: "Financial Details", icon: FileText, description: "Income and employment" },
  { id: 4, label: "Review & Submit", icon: Activity, description: "Final review and submit" },
];

const employmentTypes = [
  { value: "salaried", label: "Salaried" },
  { value: "self_employed", label: "Self Employed" },
  { value: "business", label: "Business Owner" },
];

const loanPurposes = [
  { value: "personal", label: "Personal Expenses" },
  { value: "business", label: "Business Expansion" },
  { value: "education", label: "Education" },
  { value: "medical", label: "Medical Emergency" },
  { value: "home_improvement", label: "Home Improvement" },
  { value: "debt_consolidation", label: "Debt Consolidation" },
  { value: "vehicle", label: "Vehicle Purchase" },
  { value: "other", label: "Other" },
];

interface ApplicationFormData {
  productId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pan: string;
  employmentType: string;
  monthlyIncome: string;
  loanAmount: string;
  loanPurpose: string;
  tenorMonths: string;
}

export default function CustomerApply() {
  const { data: user } = useGetMe();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { data: productsRes, isLoading: loadingProducts } = useListLoanProducts(
    { active: true, tenantId: user?.tenantId || undefined }
  );

  const createApplication = useCreateLoanApplication();

  const form = useForm<ApplicationFormData>({
    defaultValues: {
      productId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      pan: "",
      employmentType: "",
      monthlyIncome: "",
      loanAmount: "",
      loanPurpose: "",
      tenorMonths: "12",
    },
    mode: "onBlur",
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    setSubmitError("");
    try {
      await createApplication.mutateAsync({
        data: {
          customerId: user?.id || "demo-customer",
          productId: data.productId,
          requestedAmount: parseFloat(data.loanAmount),
          requestedTenure: parseInt(data.tenorMonths),
          purpose: data.loanPurpose,
        },
      });
      setSubmitSuccess(true);
      setCurrentStep(5);
    } catch (error) {
      setSubmitError("Failed to submit application. Please try again.");
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 relative">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 -z-10 -translate-y-1/2" />
      {steps.map((s) => (
        <div key={s.id} className="flex flex-col items-center gap-2 bg-black px-2">
          <div
            className={cn(
              "w-10 h-10 flex items-center justify-center border transition-all duration-300",
              currentStep > s.id
                ? "bg-primary/20 border-primary text-primary"
                : currentStep === s.id
                ? "bg-white text-black border-white"
                : "bg-[#09090b] border-white/20 text-zinc-500"
            )}
          >
            {currentStep > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
          </div>
          <span className={cn("font-mono text-[10px] uppercase tracking-wider", currentStep >= s.id ? "text-white" : "text-zinc-500")}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Select Loan Product</h1>
        <p className="text-zinc-400 font-light">Choose the financing option that best fits your needs.</p>
      </div>

      <div className="grid gap-4">
        {loadingProducts ? (
          <div className="p-8 text-center font-mono text-sm text-primary animate-pulse border border-white/10">FETCHING_PRODUCTS...</div>
        ) : productsRes?.length === 0 ? (
          <EmptyState
            illustration="add"
            title="No Loan Products"
            description="Define your lending products with rates, terms, and eligibility criteria."
            action={{ label: "Create Product", icon: <Plus className="w-4 h-4" />, onClick: () => {} }}
          />
        ) : (
          productsRes?.map((product) => (
            <Controller
              key={product.id}
              name="productId"
              control={form.control}
              rules={{ required: "Please select a loan product" }}
              render={({ field: { onChange, value } }) => (
                <div
                  onClick={() => onChange(product.id)}
                  className={cn(
                    "p-6 border cursor-pointer transition-all",
                    value === product.id ? "border-primary bg-primary/5" : "border-white/10 bg-[#09090b] hover:border-white/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-medium mb-1">{product.name}</h3>
                      <p className="text-sm text-zinc-400">{product.description}</p>
                    </div>
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center",
                      value === product.id ? "border-primary bg-primary" : "border-zinc-600"
                    )}>
                      {value === product.id && <div className="w-2 h-2 rounded-full bg-black" />}
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
              )}
            />
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          disabled={!form.watch("productId")}
          onClick={handleNext}
          className="px-8 py-3"
        >
          CONTINUE <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Personal Information & KYC</h1>
        <p className="text-zinc-400 font-light">We need your details to verify your identity.</p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PAN Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter PAN (e.g., ABCDE1234F)" {...field} />
                </FormControl>
                <FormDescription>Required for identity verification</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6 py-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> BACK
          </Button>
          <Button onClick={handleNext} className="px-8 py-3">
            CONTINUE <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Form>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Financial Details</h1>
        <p className="text-zinc-400 font-light">Provide your employment and income information.</p>
      </div>

      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="employmentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employmentTypes.map((emp) => (
                        <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="monthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Enter monthly income" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loanPurpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loan Purpose</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {loanPurposes.map((purpose) => (
                          <SelectItem key={purpose.value} value={purpose.value}>{purpose.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requested Loan Amount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter loan amount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tenorMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenure (Months)</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                      <SelectItem value="36">36 Months</SelectItem>
                      <SelectItem value="48">48 Months</SelectItem>
                      <SelectItem value="60">60 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6 py-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> BACK
          </Button>
          <Button onClick={handleNext} className="px-8 py-3">
            CONTINUE <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Form>
    </div>
  );

  const renderStep4 = () => {
    const formData = form.watch();
    const product = productsRes?.find((p) => p.id === formData.productId);

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Review & Submit</h1>
          <p className="text-zinc-400 font-light">Please review your application before submitting.</p>
        </div>

        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Selected Product</CardTitle>
            </CardHeader>
            <CardContent>
              {product ? (
                <div className="flex flex-wrap gap-6 font-mono text-sm">
                  <div>
                    <div className="text-zinc-500 text-xs mb-1 uppercase">Product</div>
                    <div className="text-white font-medium">{product.name}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1 uppercase">Rate</div>
                    <div className="text-primary">{product.interestRate}% p.a.</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1 uppercase">Tenure</div>
                    <div className="text-white">{formData.tenorMonths} months</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1 uppercase">Amount</div>
                    <div className="text-white">₹{parseFloat(formData.loanAmount || "0").toLocaleString()}</div>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400">No product selected</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Name</div>
                  <div className="text-white">{formData.firstName} {formData.lastName}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Email</div>
                  <div className="text-white">{formData.email}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Phone</div>
                  <div className="text-white">{formData.phone}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">PAN</div>
                  <div className="text-white">{formData.pan}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Financial Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 font-mono text-sm">
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Employment</div>
                  <div className="text-white">{employmentTypes.find(e => e.value === formData.employmentType)?.label || "—"}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Monthly Income</div>
                  <div className="text-white">₹{parseFloat(formData.monthlyIncome || "0").toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-zinc-500 text-xs mb-1 uppercase">Purpose</div>
                  <div className="text-white">{loanPurposes.find(p => p.value === formData.loanPurpose)?.label || "—"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="border-primary/30 bg-primary/5 mb-8">
          <Shield className="w-5 h-5 text-primary shrink-0" />
          <AlertDescription className="text-zinc-300">
            By submitting this application, you authorize LendingOS and its partners to fetch your credit report and evaluate your profile using automated risk models. Your data is encrypted and processed in compliance with RBI guidelines.
          </AlertDescription>
        </Alert>

        {submitError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="w-5 h-5" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="px-6 py-3">
            <ArrowLeft className="w-4 h-4 mr-2" /> BACK
          </Button>
          <Button
            onClick={() => form.handleSubmit(handleSubmit)()}
            disabled={createApplication.isPending}
            className="px-8 py-3 flex items-center gap-2"
          >
            {createApplication.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                PROCESSING...
              </>
            ) : (
              <>
                SUBMIT APPLICATION
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="animate-in zoom-in-95 duration-500 text-center py-12">
      <div className="w-24 h-24 bg-primary/10 border border-primary/30 flex items-center justify-center rounded-full mx-auto mb-8">
        <Check className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-3xl font-semibold mb-4">Application Submitted Successfully</h1>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto">
        Your loan application has been received. Our AI Risk Engine is currently evaluating your profile. You will receive a notification once the risk score is computed.
      </p>
      <div className="font-mono text-xs text-zinc-500 p-4 border border-white/10 bg-[#09090b] inline-block mb-8">
        REF_ID: LOAN_APP_{Math.random().toString(36).substr(2, 9).toUpperCase()}
      </div>
      <Button onClick={() => setLocation("/apply")} className="px-8 py-3">
        <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO HOME
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#040405]">
        <img src="/logo.svg" alt="LendingOS" className="h-5" />
        <div className="font-mono text-xs text-zinc-500">
          SECURE_APPLICATION_ENVIRONMENT
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-6">
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
      </main>
    </div>
  );
}