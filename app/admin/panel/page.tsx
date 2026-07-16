import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { AdminPanelClient } from "@/components/admin/AdminPanelClient";

export default async function AdminPanelPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isValid = await verifyAdminSessionToken(token);

  if (!isValid) {
    redirect("/admin");
  }

  return <AdminPanelClient />;
}
