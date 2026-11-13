import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { FileSearch, Mail, Moon, NotebookPen, ShieldCheck, Sun } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Email", icon: Mail },
  { to: "/research", label: "Research", icon: FileSearch },
  { to: "/meetings", label: "Meetings", icon: NotebookPen },
] as const;

export const DISCLAIMER = "AI can make mistakes. Review before use. Don't enter sensitive data. Nothing is saved.";

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-vermilion font-serif text-lg font-semibold text-vermilion-foreground">M</div>
      {!compact && (
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold">McFlow</p>
          <p className="text-[11px] opacity-70">Work smart, stay chilled.</p>
        </div>
      )}
    </div>
  );
}

function AppSidebar({ path }: { path: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3"><Brand compact={collapsed} /></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild isActive={path === n.to} tooltip={n.label}>
                    <Link to={n.to}><n.icon /><span>{n.label}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter className="p-3">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent p-3 text-xs leading-relaxed">
            <p className="mb-1 flex items-center gap-1.5 font-semibold"><ShieldCheck className="size-3.5 text-sidebar-primary" /> Responsible AI</p>
            <p className="opacity-80">{DISCLAIMER}</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => setShowDisclaimer(!sessionStorage.getItem("mcflow-ack")), []);
  useEffect(() => void document.documentElement.classList.toggle("dark", dark), [dark]);

  const acknowledge = () => {
    sessionStorage.setItem("mcflow-ack", "1");
    setShowDisclaimer(false);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar path={path} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur md:px-5">
            <SidebarTrigger className="hidden md:inline-flex" />
            <div className="md:hidden"><Brand /></div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setDark((d) => !d)} aria-label="Toggle theme">
              {dark ? <Sun /> : <Moon />}
            </Button>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">
            <p className="mb-5 rounded-lg border bg-muted px-3 py-2 text-xs text-muted-foreground md:hidden">{DISCLAIMER}</p>
            {children}
          </main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className={cn("relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground", path === n.to && "text-foreground")}>
            {path === n.to && <span className="absolute top-0 h-0.5 w-10 rounded-full bg-vermilion" />}
            <n.icon className="size-5" />
            {n.label}
          </Link>
        ))}
      </nav>

      <AlertDialog open={showDisclaimer}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl font-medium">Before you start</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>McFlow uses Lovable AI to draft emails, research summaries and meeting notes from what you type.</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>AI can make mistakes. Review every output before use.</li>
                  <li>Don't enter sensitive or confidential data.</li>
                  <li>Nothing is saved. Your work disappears when you close this tab.</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={acknowledge}>I understand</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
