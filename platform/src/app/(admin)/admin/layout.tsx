import { requireBlogAutor, getProfile } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireBlogAutor();
  const profile = await getProfile();
  return <AdminShell nome={profile?.nome ?? "Admin"} papel={role}>{children}</AdminShell>;
}
