import { requireAdmin, getProfile } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const profile = await getProfile();
  return <AdminShell nome={profile?.nome ?? "Admin"}>{children}</AdminShell>;
}
