import AppShell from "@/components/AppShell";
import { requireUser, getProfile, getMeusProdutos } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [profile, produtos] = await Promise.all([getProfile(), getMeusProdutos()]);

  return (
    <AppShell
      nome={profile?.nome ?? ""}
      email={user.email ?? ""}
      produtos={produtos}
    >
      {children}
    </AppShell>
  );
}
