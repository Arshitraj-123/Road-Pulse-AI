import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";

import appCss from "../styles.css?url";
import { ToastHost } from "@/components/rp/ToastHost";
import useThemeStore from "@/store/useThemeStore";
import { useAuthStore } from "@/store/useAuthStore";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 inline-flex size-20 items-center justify-center rounded-full bg-teal-light text-3xl">
          🛣️
        </div>
        <h1 className="font-display text-6xl font-bold text-foreground">404</h1>
        <h2 className="mt-3 font-display text-xl font-semibold text-foreground">
          Road not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This route hasn&apos;t been mapped yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-teal-mid px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">
          This page didn&apos;t load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-teal-mid px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "RoadPulse AI — Roads That Think Ahead" },
      {
        name: "description",
        content:
          "AI-powered road infrastructure intelligence for Indian municipalities. Detect damage, predict failure, route safely.",
      },
      { property: "og:title", content: "RoadPulse AI" },
      {
        property: "og:description",
        content: "AI infrastructure intelligence for Indian municipalities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
      {
        rel: "icon",
        href:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🛣️%3C/text%3E%3C/svg%3E",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface transition-colors dark:bg-[#0A1628]">
      <div className="text-center">
        {/* Logo */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-teal-mid shadow-lg shadow-teal-mid/20">
          <svg viewBox="0 0 24 24" fill="none" className="size-8">
            <path d="M4 20L12 4L20 20H4Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="mt-4 font-display text-xl font-bold text-foreground">RoadPulse AI</p>
        {/* Shimmer bar */}
        <div className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-teal-mid to-teal-light skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const initTheme = useThemeStore(s => s.initTheme);
  const restoreSession = useAuthStore(s => s.restoreSession);
  const isLoading = useAuthStore(s => s.isLoading);
  
  useEffect(() => {
    initTheme();
    restoreSession();
  }, [initTheme, restoreSession]);

  // Show splash while restoring session to prevent login flash
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <SplashScreen />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <ToastHost />
    </QueryClientProvider>
  );
}
