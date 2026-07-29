import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Activity, Database, Shield, Zap, Lock, BarChart3, ChevronDown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 font-sans">
      <Navigation />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AICapabilitiesSection />
      <MarketplacePreview />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

function Navigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between px-6 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <img src="/logo.svg" alt="LendingOS" className="h-6" />
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-mono text-zinc-400">
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a href="#platform" className="hover:text-white transition-colors">Platform</a>
        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/sign-in" className="text-sm font-mono hover:text-white text-zinc-400 transition-colors">
          Login
        </Link>
        <Link href="/sign-up" className="text-sm font-mono bg-primary hover:bg-primary/90 text-black px-4 py-2 flex items-center gap-2 transition-colors">
          Initialize Terminal <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-black to-black -z-10" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.css/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-primary font-mono text-xs mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          V 2.4.1 LIVE: AI Risk Engine Update
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tighter leading-[1.1] mb-6"
        >
          The Operating System <br className="hidden md:block"/> for Modern Lending
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl font-light mb-10"
        >
          A high-performance command center for NBFCs, Banks, and Fintechs. Process applications, assess risk via AI, and manage crores of volume with absolute precision.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link href="/sign-up" className="w-full sm:w-auto px-8 py-4 bg-primary text-black font-semibold font-mono flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
            Deploy Environment <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-mono flex items-center justify-center hover:bg-white/10 transition-colors">
            View Architecture
          </a>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-20 max-w-6xl mx-auto rounded-xl border border-white/10 bg-[#09090B] overflow-hidden shadow-2xl shadow-primary/5"
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 bg-[#0A0A0C]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <div className="ml-4 font-mono text-xs text-zinc-500">terminal@lending-os:~</div>
        </div>
        <div className="aspect-[16/9] w-full bg-[url('https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=2532&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-luminosity" />
      </motion.div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { label: "Platform Volume", value: "₹4.2K Cr+" },
    { label: "Active Tenants", value: "140+" },
    { label: "AI Underwriting Time", value: "< 2.5s" },
    { label: "Default Rate", value: "1.2%" }
  ];

  return (
    <section className="py-20 border-y border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4">
              <div className="text-3xl md:text-4xl font-mono font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm font-mono text-primary uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Real-time Portfolio Health",
      description: "Monitor exposure, NPA ratios, and collection rates with millisecond precision across all products."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Automated Origination",
      description: "Drop-in customer flows. eKYC, Bank statement analysis, and bureau fetch in one single pipeline."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Bank-Grade Compliance",
      description: "Audit logs for every action. RBI compliant reporting ready to export. RBAC down to the column level."
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Multi-Tenant Architecture",
      description: "Onboard DSAs, co-lenders, or manage separate lending brands from a unified root dashboard."
    }
  ];

  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold mb-4">Engineered for Scale.</h2>
          <p className="text-xl text-zinc-400 font-light max-w-2xl">Not a CRM customized for finance. A ground-up lending primitive.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div key={i} className="p-8 border border-white/10 bg-[#09090B] hover:bg-[#0c0c0e] transition-colors group">
              <div className="h-12 w-12 bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AICapabilitiesSection() {
  return (
    <section className="py-32 px-6 bg-[#040405] border-y border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
          <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-mono text-xs mb-6">
            LendingOS Intelligence
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold mb-6">AI that actually decides.</h2>
          <p className="text-lg text-zinc-400 font-light mb-8">
            Stop waiting for manual credit reviews. Our proprietary risk engine analyzes 400+ data points including alternative data to score applicants instantly.
          </p>
          <ul className="space-y-4">
            {["Fraud flag detection via graph analysis", "Automated bank statement parsing", "Dynamic credit limit sizing", "AI-prioritized collections queue"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 font-mono text-sm text-zinc-300">
                <div className="h-1.5 w-1.5 bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2 w-full">
          <div className="aspect-square bg-black border border-white/10 p-6 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
            
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
              <span className="font-mono text-xs text-zinc-500">RISK_SCORE_COMPUTE</span>
              <span className="font-mono text-xs text-primary animate-pulse">PROCESSING</span>
            </div>
            
            <div className="flex-1 font-mono text-sm text-zinc-400 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between"><span className="text-zinc-600">BUREAU_FETCH</span><span className="text-white">742</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">INCOME_EST</span><span className="text-white">₹1.2L/mo</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">FOIR_CALC</span><span className="text-white">34.2%</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">FRAUD_PROB</span><span className="text-primary">0.012</span></div>
              
              <div className="mt-auto border border-primary/30 bg-primary/5 p-4 flex flex-col items-center justify-center">
                <span className="text-xs text-zinc-500 mb-1">FINAL GRADE</span>
                <span className="text-4xl text-white font-bold">A1</span>
                <span className="text-primary text-xs mt-2">AUTO_APPROVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarketplacePreview() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-semibold mb-6">Connect everything.</h2>
        <p className="text-lg text-zinc-400 font-light max-w-2xl mx-auto mb-16">
          LendingOS integrates natively with your existing data providers, payment gateways, and communication channels.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {["CIBIL", "Experian", "Karza", "Razorpay", "Cashfree", "DigiLocker", "Perfios", "SignDesk", "Twilio"].map((partner) => (
            <div key={partner} className="px-6 py-3 border border-white/10 bg-[#09090B] font-mono text-sm text-zinc-300 hover:border-primary/50 hover:text-white transition-colors cursor-default">
              {partner}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-6 bg-[#040405] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-semibold mb-4">Transparent Deployment.</h2>
          <p className="text-xl text-zinc-400 font-light">Scale linearly with your AUM.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Starter */}
          <div className="p-8 border border-white/10 bg-black flex flex-col">
            <h3 className="text-xl font-mono mb-2 text-zinc-300">Starter</h3>
            <div className="text-3xl font-bold mb-6">₹49,999<span className="text-sm font-normal text-zinc-500">/mo</span></div>
            <p className="text-sm text-zinc-400 mb-8 flex-1">For new originators scaling up to ₹10Cr AUM.</p>
            <ul className="space-y-3 mb-8 font-mono text-sm text-zinc-300">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Up to 1,000 active loans</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> 2 Admin Seats</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Basic KYC Suite</li>
            </ul>
            <Link href="/sign-up" className="w-full py-3 bg-white/5 border border-white/10 text-center font-mono text-sm hover:bg-white/10 transition-colors">Select Plan</Link>
          </div>
          
          {/* Growth */}
          <div className="p-8 border border-primary bg-black flex flex-col relative shadow-[0_0_30px_rgba(0,230,160,0.1)]">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-black font-mono text-xs px-3 py-1 font-bold">MOST DEPLOYED</div>
            <h3 className="text-xl font-mono mb-2 text-primary">Growth</h3>
            <div className="text-3xl font-bold mb-6">₹1,49,999<span className="text-sm font-normal text-zinc-500">/mo</span></div>
            <p className="text-sm text-zinc-400 mb-8 flex-1">For established NBFCs running high volume operations.</p>
            <ul className="space-y-3 mb-8 font-mono text-sm text-zinc-300">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary" /> Up to 10,000 active loans</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary" /> Unlimited Seats</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary" /> AI Risk Engine Access</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-primary" /> Custom Approval Workflows</li>
            </ul>
            <Link href="/sign-up" className="w-full py-3 bg-primary text-black text-center font-mono font-bold text-sm hover:bg-primary/90 transition-colors">Deploy Now</Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 border border-white/10 bg-black flex flex-col">
            <h3 className="text-xl font-mono mb-2 text-zinc-300">Enterprise</h3>
            <div className="text-3xl font-bold mb-6">Custom</div>
            <p className="text-sm text-zinc-400 mb-8 flex-1">Dedicated instances for Banks and major lenders.</p>
            <ul className="space-y-3 mb-8 font-mono text-sm text-zinc-300">
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Unlimited volume</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Dedicated VPC</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> Custom Integrations</li>
              <li className="flex items-center gap-2"><div className="w-1 h-1 bg-white" /> 24/7 SLA</li>
            </ul>
            <a href="mailto:contact@lendingos.example" className="w-full py-3 bg-white/5 border border-white/10 text-center font-mono text-sm hover:bg-white/10 transition-colors">Contact Sales</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "Is LendingOS RBI compliant out of the box?", a: "Yes. All data is localized in India. We maintain full audit trails, masking where required, and support CKYC and mandated reporting formats." },
    { q: "Can we use our own risk models?", a: "Absolutely. While our AI risk engine is available, enterprise clients can plug in custom models via our webhook infrastructure or Python SDK." },
    { q: "How fast is deployment?", a: "Standard growth deployments complete in under 48 hours including configuration of your specific loan products and approval workflows." }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-semibold mb-12 text-center">System Queries</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 p-6 bg-[#09090B]">
              <h4 className="font-mono text-primary mb-3 text-sm">{faq.q}</h4>
              <p className="text-zinc-400 font-light text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6 text-sm font-mono text-zinc-500 bg-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="LendingOS" className="h-5 grayscale opacity-50" />
          <span>© 2024 LendingOS Infrastructure.</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">System Status</a>
          <a href="#" className="hover:text-primary transition-colors">Documentation</a>
          <a href="#" className="hover:text-primary transition-colors">Security</a>
        </div>
      </div>
    </footer>
  );
}
