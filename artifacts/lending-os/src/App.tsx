import { useEffect, useRef, useState, Component, type ReactNode } from "react";
import { useState } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useAuth, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Link, useParams } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";
import { KeyRound, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

import LandingPage from "@/pages/landing";
import SuperAdminDashboard from "@/pages/dashboard-super";
import TenantDashboard from "@/pages/dashboard-tenant";
import TenantsList from "@/pages/tenants/list";
import NewTenantPage from "@/pages/tenants/new";
import TenantDetailPage from "@/pages/tenants/detail";
import TenantUsersPage from "@/pages/tenants/users";
import ApplicationsList from "@/pages/applications/list";
import NewApplicationPage from "@/pages/applications/new";
import ApplicationDetailPage from "@/pages/applications/detail";
import CustomersList from "@/pages/customers/list";
import NewCustomerPage from "@/pages/customers/new";
import CustomerDetailPage from "@/pages/customers/detail";
import LoansList from "@/pages/loans/list";
import LoanDetailPage from "@/pages/loans/detail";
import CollectionsList from "@/pages/collections/list";
import CollectionDetailPage from "@/pages/collections/detail";
import ProductsList from "@/pages/products/list";
import NewProductPage from "@/pages/products/new";
import ProductDetailPage from "@/pages/products/detail";
import EditProductPage from "@/pages/products/edit";
import AuditList from "@/pages/audit/list";
import SettingsPage from "@/pages/settings";
import CustomerApply from "@/pages/apply";
import NotFound from "@/pages/not-found";
import OffersList from "@/pages/offers/list";
import PlaceholderPage from "@/pages/placeholder";
import InvitationsList from "@/pages/invitations/list";
import PlatformAnalyticsPage from "@/pages/platform/analytics";
import TenantAnalyticsPage from "@/pages/platform/tenant-analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

const rawKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const isClerkConfigured =
  Boolean(rawKey) &&
  rawKey !== "pk_test_your_key_here" &&
  !rawKey.includes("your_key_here") &&
  rawKey.startsWith("pk_");

let clerkPubKey: string | null = null;
if (isClerkConfigured) {
  try {
    clerkPubKey = publishableKeyFromHost(
      window.location.hostname,
      rawKey,
    );
  } catch (e) {
    console.warn("Failed to parse Clerk publishable key:", e);
    clerkPubKey = null;
  }
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(160 100% 42%)",
    colorForeground: "hsl(0 0% 98%)",
    colorMutedForeground: "hsl(240 10% 65%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(240 10% 8%)",
    colorInput: "hsl(240 10% 16%)",
    colorInputForeground: "hsl(0 0% 98%)",
    colorNeutral: "hsl(240 10% 16%)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0a0a0c] rounded-md border border-[#1e1e24] w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-bold tracking-tight",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-zinc-300 font-mono text-xs uppercase tracking-wider",
    footerActionLink: "text-[#00cc88] hover:text-[#00ffaa]",
    footerActionText: "text-zinc-400",
    dividerText: "text-zinc-500 font-mono text-xs",
    identityPreviewEditButton: "text-[#00cc88]",
    formFieldSuccessText: "text-[#00cc88]",
    alertText: "text-red-400",
    logoBox: "mb-6",
    logoImage: "h-8 object-contain",
    socialButtonsBlockButton: "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white rounded-none",
    formButtonPrimary: "bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold rounded-none border-none",
    formFieldInput: "bg-zinc-800 border-zinc-700 text-white rounded-none focus:ring-1 focus:ring-[#00cc88] font-mono placeholder:text-zinc-500",
    footerAction: "bg-zinc-950",
    dividerLine: "bg-zinc-800",
    alert: "border-red-900 bg-red-950/20",
    otpCodeFieldInput: "bg-zinc-800 border-zinc-700 text-white rounded-none font-mono",
    formFieldRow: "mb-4",
    main: "gap-6",
  },
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("LenderOS UI Error Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-black text-white p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center shadow-xl">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="text-xl font-bold font-mono tracking-tight mb-2">Interface Recovery</h2>
            <p className="text-sm text-zinc-400 mb-4 font-mono">
              {this.state.error?.message || "An unexpected rendering error occurred."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold px-4 py-2 text-sm font-mono transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DemoBanner() {
  return (
    <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 text-xs font-mono text-emerald-300 flex items-center justify-between z-50">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Local Demo Mode active — using seeded Super Admin session. Add real Clerk keys to .env to enable authentication.</span>
      </div>
      <Link href="/dashboard" className="text-emerald-200 underline hover:text-white font-semibold ml-4">
        Open Workspace →
      </Link>
    </div>
  );
}

function ClerkSetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="w-[480px] max-w-full bg-[#09090b] border border-[#1e1e24] p-8 rounded-lg shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#00cc88]/10 border border-[#00cc88]/30 rounded flex items-center justify-center text-[#00cc88]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-white">Clerk Configuration Required</h1>
            <p className="text-xs text-zinc-400 font-mono">Authentication module setup</p>
          </div>
        </div>

        <p className="text-sm text-zinc-300 mb-4 leading-relaxed">
          To enable live multi-tenant authentication, update your <code className="bg-zinc-900 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> file with your Clerk API keys:
        </p>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded mb-6 font-mono text-xs text-zinc-400 space-y-1.5 overflow-x-auto">
          <div><span className="text-zinc-500"># In your .env file:</span></div>
          <div><span className="text-emerald-400">CLERK_PUBLISHABLE_KEY</span>=pk_test_...</div>
          <div><span className="text-emerald-400">CLERK_SECRET_KEY</span>=sk_test_...</div>
          <div><span className="text-emerald-400">VITE_CLERK_PUBLISHABLE_KEY</span>=pk_test_...</div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-2.5 bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold font-mono text-sm flex items-center justify-center gap-2 transition-colors"
          >
            Continue in Demo Mode <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
          >
            Open Clerk Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  if (!clerkPubKey) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="w-[420px] max-w-full rounded-lg border border-white/10 bg-[#09090b] p-8 text-center text-white">
          <h1 className="text-xl font-semibold">Demo sign-in is not active</h1>
          <p className="mt-3 text-sm text-zinc-400">Use the landing page buttons to continue in demo mode or open the dashboard directly.</p>
          <div className="mt-6 flex flex-col gap-3">
            <a href="/" className="rounded bg-[#00cc88] px-4 py-2 font-mono text-sm font-semibold text-black">Back to Home</a>
            <a href="/dashboard" className="rounded border border-white/10 px-4 py-2 font-mono text-sm text-zinc-300">Open Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  if (!clerkPubKey) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="w-[420px] max-w-full rounded-lg border border-white/10 bg-[#09090b] p-8 text-center text-white">
          <h1 className="text-xl font-semibold">Demo sign-up is not active</h1>
          <p className="mt-3 text-sm text-zinc-400">Use the landing page buttons to continue in demo mode or open the dashboard directly.</p>
          <div className="mt-6 flex flex-col gap-3">
            <a href="/" className="rounded bg-[#00cc88] px-4 py-2 font-mono text-sm font-semibold text-black">Back to Home</a>
            <a href="/dashboard" className="rounded border border-white/10 px-4 py-2 font-mono text-sm text-zinc-300">Open Dashboard</a>
          </div>
        </div>
      </div>
    );
  }

const searchParams = new URLSearchParams(window.location.search);
  const invitationToken = searchParams.get("invitation_token");

  if (invitationToken) {
    sessionStorage.setItem("lenderos_invitation_token", invitationToken);
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  if (!clerkPubKey) return null;
  return <ClerkQueryClientCacheInvalidatorInternal />;
}

function ClerkQueryClientCacheInvalidatorInternal() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkAuthTokenRegistrar() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      tokenRef.current = null;
      setAuthTokenGetter(() => null);
      return;
    }

    let cancelled = false;

    const updateToken = async () => {
      try {
        const token = await getToken();
        if (!cancelled) {
          tokenRef.current = token;
          setAuthTokenGetter(() => tokenRef.current);
        }
      } catch {
        if (!cancelled) {
          tokenRef.current = null;
          setAuthTokenGetter(() => null);
        }
      }
    };

    updateToken();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}

function AppRedirect() {
  return <LandingPage />;
}

function HomeRedirect() {
  return <LandingPage />;
}

function ClerkHomeRedirect() {
  return <LandingPage />;
}



function AcceptInvitationPage() {
  const params = useParams<{ token: string }>();
  const { isLoaded, isSignedIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(true);

  useEffect(() => {
    if (!params.token) {
      setError("Invalid invitation link");
      setAccepting(false);
      return;
    }

    const acceptInvitation = async () => {
      try {
        const response = await fetch(`/api/invitations/accept/${params.token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to accept invitation");
        }

        setAccepted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to accept invitation");
      } finally {
        setAccepting(false);
      }
    };

    acceptInvitation();
  }, [params.token]);

  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading...</div>;
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="w-[480px] max-w-full bg-[#09090b] border border-[#1e1e24] p-8 rounded-lg shadow-2xl text-white text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-xl font-bold font-mono tracking-tight mb-2">Already Signed In</h1>
          <p className="text-sm text-zinc-400 mb-6">You are already signed in. Redirecting to dashboard...</p>
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="w-[480px] max-w-full bg-[#09090b] border border-[#1e1e24] p-8 rounded-lg shadow-2xl text-white text-center">
          <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-zinc-400 font-mono">Validating invitation...</p>
        </div>
      </div>
    );
  }

  const handleSignUp = () => {
    if (!params.token) {
      setError("Invalid invitation link");
      return;
    }
    window.location.href = `/sign-up?invitation_token=${params.token}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <div className="w-[480px] max-w-full bg-[#09090b] border border-[#1e1e24] p-8 rounded-lg shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400">
            <span className="text-2xl">📨</span>
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono tracking-tight text-white">Accept Invitation</h1>
            <p className="text-xs text-zinc-400 font-mono">Join your organization on LenderOS</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-950/50 border border-red-500/30 rounded text-red-400 text-sm font-mono">
            {error}
          </div>
        )}

        {accepted && !error && (
          <div className="mb-6 p-4 bg-emerald-950/50 border border-emerald-500/30 rounded text-emerald-400 text-sm font-mono">
            ✓ Invitation accepted! Please create your account to continue.
          </div>
        )}

        <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-300">
          <p>You have been invited to join an organization on LenderOS.</p>
          <p className="mt-2">Click below to create your account and accept the invitation.</p>
        </div>

        <button
          onClick={handleSignUp}
          disabled={!params.token || !accepted}
          className="w-full py-3 bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold font-mono text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Account & Accept
        </button>

        <p className="mt-6 text-xs text-zinc-500 text-center">
          Already have an account?{" "}
          <a href="/sign-in" className="text-emerald-400 hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  );
}

function DashboardRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const { data: user, isLoading, isError } = useGetMe();

  // Wait for Clerk to load session before making API call
  if (!isLoaded) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading session...</div>;
  }

  // If not signed in, redirect to sign-in
  if (!isSignedIn) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Redirecting to sign in...</div>;
  }

  // If there's an auth error (e.g., 401), redirect to sign-in
  if (isError) {
    return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Session expired, redirecting...</div>;
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading Workspace...</div>;
  if (user?.role === 'super_admin' || user?.role === 'platform_admin') {
    return <SuperAdminDashboard user={user} />;
  }
  return <TenantDashboard user={user} />;
}



function AppRoutes() {
  return (
    <QueryClientProvider client={queryClient}>
      {!clerkPubKey && <DemoBanner />}
      <ClerkQueryClientCacheInvalidator />
<Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/accept-invitation/:token" component={AcceptInvitationPage} />
        <Route path="/dashboard" component={DashboardRoute} />
        <Route path="/tenants/new" component={NewTenantPage} />
        <Route path="/tenants/:tenantId/users" component={TenantUsersPage} />
        <Route path="/tenants/:tenantId" component={TenantDetailPage} />
        <Route path="/tenants" component={TenantsList} />
        <Route path="/applications/new" component={NewApplicationPage} />
        <Route path="/applications/:applicationId" component={ApplicationDetailPage} />
        <Route path="/applications" component={ApplicationsList} />
        <Route path="/customers/new" component={NewCustomerPage} />
        <Route path="/customers/:customerId" component={CustomerDetailPage} />
        <Route path="/customers" component={CustomersList} />
        <Route path="/offers/:applicationId" component={OffersList} />
        <Route path="/loans/:loanId" component={LoanDetailPage} />
        <Route path="/loans" component={LoansList} />
        <Route path="/collections/:collectionId" component={CollectionDetailPage} />
        <Route path="/collections" component={CollectionsList} />
        <Route path="/products/new" component={NewProductPage} />
        <Route path="/products/:productId/edit" component={EditProductPage} />
        <Route path="/products/:productId" component={ProductDetailPage} />
        <Route path="/products/*" component={ProductsList} />
        <Route path="/audit/*" component={AuditList} />
        <Route path="/settings/*" component={SettingsPage} />
        <Route path="/invitations" component={InvitationsList} />
        <Route path="/platform/analytics" component={PlatformAnalyticsPage} />
        <Route path="/platform/analytics/:tenantId" component={TenantAnalyticsPage} />
        <Route path="/apply" component={CustomerApply} />
        <Route path="/" component={HomeRedirect} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  if (!clerkPubKey) {
    return <AppRoutes />;
  }

  return (
<ClerkProvider
      publishableKey={clerkPubKey}
      {...(clerkProxyUrl ? { proxyUrl: clerkProxyUrl } : {})}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignInUrl={`${basePath}/dashboard`}
      afterSignUpUrl={`${basePath}/dashboard`}
      localization={{
        signIn: {
          start: {
            title: "Access Terminal",
            subtitle: "Enter credentials to initialize secure session",
          },
        },
        signUp: {
          start: {
            title: "Request Access",
            subtitle: "Initialize new terminal account",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkAuthTokenRegistrar />
      <AppRoutes />
    </ClerkProvider>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="lending-os-theme">
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <ClerkProviderWithRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;
