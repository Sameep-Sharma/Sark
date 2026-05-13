import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "SARK quiz admin login.",
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return <AdminLogin />;
}
