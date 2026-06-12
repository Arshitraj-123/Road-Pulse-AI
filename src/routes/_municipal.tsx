import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { MunicipalSidebar } from "@/components/layout/MunicipalSidebar";

export const Route = createFileRoute("/_municipal")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { isAuthenticated, role, isLoading } = useAuthStore.getState();

    // If session is still restoring, don't redirect yet
    if (isLoading) return;

    // Not logged in → send to login with context
    if (!isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { from: "/dashboard" },
      });
    }

    // Logged in but wrong role → send to unauthorized page
    if (role !== "municipal") {
      throw redirect({
        to: "/unauthorized",
        search: { required: "municipal", from: "/dashboard" },
      });
    }
  },
  component: MunicipalLayout,
});

function MunicipalLayout() {
  return (
    <div className="min-h-screen bg-surface dark:bg-[#0A1628]">
      <MunicipalSidebar />
      <main className="transition-all duration-300 md:pl-[60px] lg:pl-[240px] pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
