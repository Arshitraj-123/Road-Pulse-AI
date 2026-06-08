import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { MunicipalSidebar } from "@/components/layout/MunicipalSidebar";

export const Route = createFileRoute("/_municipal")({
  ssr: false,
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    const { role } = useAuthStore.getState();
    if (role !== "municipal") {
      throw redirect({ to: "/login" });
    }
  },
  component: MunicipalLayout,
});

function MunicipalLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <MunicipalSidebar />
      <main className="md:pl-60">
        <Outlet />
      </main>
    </div>
  );
}
