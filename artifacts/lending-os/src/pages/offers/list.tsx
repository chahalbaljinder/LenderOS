import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useGetOffers, useAcceptOffer, useCalculateEmi } from "@workspace/api-client-react";
import { useParams, Link, useLocation } from "wouter";
import { ArrowLeft, CreditCard, Calculator, Loader2, AlertCircle, CheckCircle, Clock, Eye, Banknote, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function OffersPage() {
  const params = useParams<{ applicationId: string }>();
  const [, setLocation] = useLocation();
  const applicationId = params.applicationId;

  const { data: offers, isLoading, error, refetch } = useGetOffers({ path: { applicationId: applicationId || "" } });
  const acceptMutation = useAcceptOffer();
  const calculateEmiMutation = useCalculateEmi();

  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [calculatingEmi, setCalculatingEmi] = useState<string | null>(null);
  const [emiResult, setEmiResult] = useState<{ emi: number; totalPayable: number; totalInterest: number; processingFee: number; schedule: any[] } | null>(null);

  if (isLoading) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeTab="applications">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/applications" className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-white">Loan Offers</h1>
            </div>
          </div>
          <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-mono">Failed to load offers</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const activeOffers = offers?.filter((o: any) => new Date(o.expiresAt) > new Date()) || [];
  const expiredOffers = offers?.filter((o: any) => new Date(o.expiresAt) <= new Date()) || [];

  const handleAccept = (offerId: string) => {
    if (confirm("Accept this loan offer? This action cannot be undone.")) {
      acceptMutation.mutate(
        { path: { applicationId: applicationId || "" }, offerId },
        {
          onSuccess: () => {
            alert("Offer accepted successfully!");
            refetch();
          },
          onError: (err) => alert(err.message),
        }
      );
    }
  };

  const handleCalculateEmi = (offer: any) => {
    setCalculatingEmi(offer.id);
    calculateEmiMutation.mutate(
      { principal: offer.offeredAmount, annualRate: offer.interestRate, tenureMonths: offer.tenure },
      {
        onSuccess: (data) => {
          setEmiResult(data);
          setCalculatingEmi(null);
          setExpandedOfferId(offer.id);
        },
        onError: (err) => {
          alert(err.message);
          setCalculatingEmi(null);
        },
      }
    );
  };

  return (
    <DashboardLayout activeTab="applications">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/applications/${applicationId}`} className="p-2 hover:bg-white/5 rounded transition-colors text-zinc-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-white">Loan Offers</h1>
            <p className="font-mono text-sm text-zinc-400">Compare and accept the best offer for your application</p>
          </div>
        </div>

        {activeOffers.length === 0 && expiredOffers.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Offers Available</h2>
            <p className="text-zinc-400 font-mono mb-6">No lenders have made offers for this application yet.</p>
            <Link href={`/applications/${applicationId}`} className="px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors inline-block">
              Back to Application
            </Link>
          </div>
        ) : (
          <>
            {activeOffers.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Banknote className="w-5 h-5" /> Available Offers ({activeOffers.length})
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-mono rounded">Active</span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {activeOffers.map((offer: any) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isExpanded={expandedOfferId === offer.id}
                      onToggle={() => setExpandedOfferId(expandedOfferId === offer.id ? null : offer.id)}
                      onAccept={() => handleAccept(offer.id)}
                      onCalculateEmi={() => handleCalculateEmi(offer)}
                      calculatingEmi={calculatingEmi === offer.id}
                      emiResult={emiResult}
                      acceptMutation={acceptMutation}
                    />
                  ))}
                </div>
              </div>
            )}

            {expiredOffers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Expired Offers ({expiredOffers.length})
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs font-mono rounded">Expired</span>
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {expiredOffers.map((offer: any) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isExpired={true}
                      acceptMutation={acceptMutation}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {emiResult && expandedOfferId && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[#09090b] border border-[#1e1e24] rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-mono tracking-tight">EMI Calculation</h3>
                <button onClick={() => { setEmiResult(null); setExpandedOfferId(null); }} className="text-zinc-400 hover:text-white">×</button>
              </div>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                  <p className="font-mono text-xs text-zinc-400 mb-2">Monthly EMI</p>
                  <p className="text-3xl font-bold text-white">₹{emiResult.emi.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-background/50 rounded p-3">
                    <p className="text-zinc-400 font-mono">Total Payable</p>
                    <p className="font-semibold text-white">₹{emiResult.totalPayable.toLocaleString()}</p>
                  </div>
                  <div className="bg-background/50 rounded p-3">
                    <p className="text-zinc-400 font-mono">Total Interest</p>
                    <p className="font-semibold text-white">₹{emiResult.totalInterest.toLocaleString()}</p>
                  </div>
                  <div className="bg-background/50 rounded p-3">
                    <p className="text-zinc-400 font-mono">Processing Fee</p>
                    <p className="font-semibold text-white">₹{emiResult.processingFee.toLocaleString()}</p>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500 border-b border-border">
                        <th className="pb-2">#</th>
                        <th className="pb-2 text-right">Due Date</th>
                        <th className="pb-2 text-right">EMI</th>
                        <th className="pb-2 text-right">Principal</th>
                        <th className="pb-2 text-right">Interest</th>
                        <th className="pb-2 text-right">Outstanding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {emiResult.schedule.map((s: any, i: number) => (
                        <tr key={i} className="hover:bg-white/5">
                          <td className="py-2 font-mono">{s.installmentNumber}</td>
                          <td className="py-2 text-right font-mono text-zinc-400">{format(new Date(s.dueDate), "MMM d, yyyy")}</td>
                          <td className="py-2 text-right font-mono text-white">₹{s.emiAmount.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono text-green-400">₹{s.principal.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono text-yellow-400">₹{s.interest.toLocaleString()}</td>
                          <td className="py-2 text-right font-mono text-zinc-300">₹{s.outstandingAfter.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function OfferCard({
  offer,
  isExpanded,
  onToggle,
  onAccept,
  onCalculateEmi,
  calculatingEmi,
  emiResult,
  acceptMutation,
  isExpired = false,
}: {
  offer: any;
  isExpanded?: boolean;
  onToggle?: () => void;
  onAccept?: () => void;
  onCalculateEmi?: () => void;
  calculatingEmi?: string | null;
  emiResult?: any;
  acceptMutation: any;
  isExpired?: boolean;
}) {
  const timeLeft = offer.expiresAt ? Math.max(0, new Date(offer.expiresAt).getTime() - Date.now()) : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className={cn("bg-card border border-border rounded-lg p-6 transition-all", isExpanded && "ring-2 ring-primary/50")}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center rounded">
            <Banknote className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-white">{offer.tenantName || "Lender"}</p>
            <p className="font-mono text-xs text-zinc-400">{offer.disbursementTime} disbursement</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpired ? (
            <StatusBadge status="suspended" />
          ) : (
            <StatusBadge status={daysLeft <= 1 ? "pending_tenant" : "active_tenant"} />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-background/50 rounded-lg p-4">
          <p className="font-mono text-xs text-zinc-400 mb-1">Offered Amount</p>
          <p className="text-2xl font-bold text-white">₹{offer.offeredAmount?.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background/50 rounded-lg p-3">
            <p className="font-mono text-xs text-zinc-400 mb-1">Interest Rate</p>
            <p className="font-bold text-white">{offer.interestRate}%</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="font-mono text-xs text-zinc-400 mb-1">Tenure</p>
            <p className="font-bold text-white">{offer.tenure} months</p>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <p className="font-mono text-xs text-zinc-400 mb-1">Approval Prob.</p>
            <p className="font-bold text-white">{(offer.approvalProbability * 100).toFixed(0)}%</p>
          </div>
        </div>

        {!isExpired && (
          <div className="flex items-center gap-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
            <div>
              <p className="font-mono text-xs text-zinc-400">Expires in</p>
              <p className="font-mono text-white">{daysLeft}d {hoursLeft}h</p>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="flex items-center gap-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="font-mono text-sm text-red-400">This offer has expired</p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-border">
          {!isExpired && (
            <>
              <button
                onClick={onAccept}
                disabled={acceptMutation.isPending}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Accept Offer
              </button>
              <button
                onClick={onCalculateEmi}
                disabled={calculatingEmi === offer.id}
                className="w-full px-4 py-2 border border-zinc-700 text-zinc-300 hover:bg-white/5 font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {calculatingEmi === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Calculate EMI
              </button>
            </>
          )}

          <button
            onClick={onToggle}
            className="w-full px-4 py-2 text-zinc-400 hover:text-white font-mono text-xs rounded transition-colors"
          >
            {isExpanded ? <Eye className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {isExpanded ? "Hide Details" : "Show Details"}
          </button>
        </div>

        {isExpanded && emiResult && (
          <div className="mt-4 pt-4 border-t border-border space-y-3 animate-in">
            <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
              <p className="font-mono text-xs text-zinc-400 mb-2">Monthly EMI</p>
              <p className="text-2xl font-bold text-white">₹{emiResult.emi.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-background/50 rounded p-3">
                <p className="text-zinc-400 font-mono">Total Payable</p>
                <p className="font-semibold text-white">₹{emiResult.totalPayable.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 rounded p-3">
                <p className="text-zinc-400 font-mono">Total Interest</p>
                <p className="font-semibold text-white">₹{emiResult.totalInterest.toLocaleString()}</p>
              </div>
              <div className="bg-background/50 rounded p-3">
                <p className="text-zinc-400 font-mono">Processing Fee</p>
                <p className="font-semibold text-white">₹{emiResult.processingFee.toLocaleString()}</p>
              </div>
            </div>
            <details className="bg-background/50 rounded p-3">
              <summary className="font-mono text-xs text-zinc-400 cursor-pointer mb-2">View Repayment Schedule</summary>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-xs font-mono uppercase tracking-wider text-zinc-500 border-b border-border">
                      <th className="pb-1">#</th>
                      <th className="pb-1 text-right">Due</th>
                      <th className="pb-1 text-right">EMI</th>
                      <th className="pb-1 text-right">Principal</th>
                      <th className="pb-1 text-right">Interest</th>
                      <th className="pb-1 text-right">Outstanding</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {emiResult.schedule.map((s: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="py-1 font-mono">{s.installmentNumber}</td>
                        <td className="py-1 text-right font-mono text-zinc-400">{format(new Date(s.dueDate), "MMM d, yy")}</td>
                        <td className="py-1 text-right font-mono text-white">₹{s.emiAmount.toLocaleString()}</td>
                        <td className="py-1 text-right font-mono text-green-400">₹{s.principal.toLocaleString()}</td>
                        <td className="py-1 text-right font-mono text-yellow-400">₹{s.interest.toLocaleString()}</td>
                        <td className="py-1 text-right font-mono text-zinc-300">₹{s.outstandingAfter.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}