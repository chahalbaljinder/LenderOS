import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useGetMe } from "@workspace/api-client-react";

import LandingPage from "@/pages/landing";
import SuperAdminDashboard from "@/pages/dashboard-super";
import TenantDashboard from "@/pages/dashboard-tenant";
import TenantsList from "@/pages/tenants/list";
import ApplicationsList from "@/pages/applications/list";
import CustomersList from "@/pages/customers/list";
import LoansList from "@/pages/loans/list";
import CollectionsList from "@/pages/collections/list";
import CustomerApply from "@/pages/apply";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
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
    colorPrimary: "hsl(160 100% 40%)",
    colorForeground: "hsl(0 0% 98%)",
    colorMutedForeground: "hsl(240 10% 60%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(240 10% 6%)",
    colorInput: "hsl(240 10% 12%)",
    colorInputForeground: "hsl(0 0% 98%)",
    colorNeutral: "hsl(240 10% 12%)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "0.25rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#09090b] rounded-md border border-[#1e1e24] w-[440px] max-w-full overflow-hidden",
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
    socialButtonsBlockButton: "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none",
    formButtonPrimary: "bg-[#00cc88] hover:bg-[#00ffaa] text-black font-semibold rounded-none border-none",
    formFieldInput: "bg-zinc-900 border-zinc-800 text-white rounded-none focus:ring-1 focus:ring-[#00cc88] font-mono placeholder:text-zinc-600",
    footerAction: "bg-zinc-950",
    dividerLine: "bg-zinc-800",
    alert: "border-red-900 bg-red-950/20",
    otpCodeFieldInput: "bg-zinc-900 border-zinc-800 text-white rounded-none font-mono",
    formFieldRow: "mb-4",
    main: "gap-6",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-black px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
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

function AppRedirect() {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-primary font-mono text-sm uppercase tracking-widest animate-pulse">Initializing Data Stream...</div>
    </div>
  );

  if (user?.role === 'super_admin' || user?.role === 'platform_admin') {
    return <Redirect to="/dashboard" />;
  }

  if (user?.role === 'customer') {
    return <Redirect to="/apply" />;
  }

  // default tenant
  return <Redirect to="/dashboard" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <AppRedirect />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function DashboardRoute() {
  const { data: user, isLoading } = useGetMe();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center font-mono text-primary animate-pulse">Loading Workspace...</div>;
  if (user?.role === 'super_admin' || user?.role === 'platform_admin') {
    return <SuperAdminDashboard />;
  }
  return <TenantDashboard />;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
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
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/dashboard" component={DashboardRoute} />
          <Route path="/tenants" component={TenantsList} />
          {/* <Route path="/tenants/new" component={TenantNew} />
          <Route path="/tenants/:id" component={TenantDetail} /> */}
          <Route path="/applications" component={ApplicationsList} />
          {/* <Route path="/applications/new" component={ApplicationNew} />
          <Route path="/applications/:id" component={ApplicationDetail} /> */}
          <Route path="/customers" component={CustomersList} />
          {/* <Route path="/customers/:id" component={CustomerDetail} /> */}
          <Route path="/loans" component={LoansList} />
          {/* <Route path="/loans/:id" component={LoanDetail} /> */}
          <Route path="/collections" component={CollectionsList} />
          {/* <Route path="/products" component={ProductsList} />
          <Route path="/analytics" component={TenantAnalytics} />
          <Route path="/audit" component={AuditLogViewer} />
          <Route path="/settings" component={TenantSettingsPage} /> */}
          <Route path="/apply" component={CustomerApply} />
          <Route component={NotFound} />
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="lending-os-theme">
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
