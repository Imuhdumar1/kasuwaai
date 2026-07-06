"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, LogOut, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { MAINTENANCE_MESSAGE } from "@/lib/maintenance";

export function MaintenanceScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <div className="mb-8">
        <Logo className="text-xl" />
      </div>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime/20 text-ink">
        <Wrench className="h-7 w-7" />
      </div>

      <h1 className="mt-6 font-display text-2xl font-extrabold sm:text-3xl">Under maintenance</h1>
      <p className="mt-3 max-w-md text-content-muted">{MAINTENANCE_MESSAGE}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => {
            setRefreshing(true);
            window.location.reload();
          }}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Check again
        </Button>
        <Button variant="outline" onClick={logout}>
          <LogOut className="h-4 w-4" /> Log out
        </Button>
      </div>
    </div>
  );
}
