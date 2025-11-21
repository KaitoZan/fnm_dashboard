
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton"; 
import type { Database } from "@/types/supabase";

// (2) สร้าง Type ของ Profile
type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];

// (3) สร้าง Navigation Links
const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/approvals", label: "จัดการคำร้อง (Approvals)" },
  { href: "/reports", label: "จัดการรายงาน (Reports)" },
  { href: "/users", label: "จัดการผู้ใช้ (Users)" },
  { href: "/restaurants", label: "จัดการร้านค้า (Restaurants)" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // (4) ดึงข้อมูล User และ Profile (ใน Server Component)
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  if (error || !user) {
    return redirect("/login");
  }

  // ดึง Profile Admin เพื่อเอาชื่อมาแสดง
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_name")
    .eq("id", user.id)
    .single() as { data: Pick<Profile, 'user_name'> | null };

  return (
    <div className="flex min-h-screen">
      
      {/* ===== Sidebar (เมนูข้าง) ===== */}
      <nav className="w-[250px] bg-gray-800 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-700">
          <h3>FoodNearMe Admin</h3>
        </div>
        <ul className="list-none p-0 m-0">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link 
                href={link.href} 
                className="block py-4 px-6 text-gray-300 no-underline transition-colors hover:bg-gray-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* ===== พื้นที่เนื้อหาหลัก ===== */}
      <div className="flex-1 flex flex-col bg-gray-50">
        
        {/* ----- Header (ส่วนหัว) ----- */}
        <header className="flex justify-between items-center p-6 bg-white border-b border-gray-200">
          <div>
            {/* เราจะใส่ Breadcrumbs หรือ Title ตรงนี้ทีหลัง */}
          </div>
          <div className="flex items-center gap-4">
            <span>
              สวัสดี, <strong>{profile?.user_name || user.email}</strong>
            </span>
            {/* (5) ปุ่ม Logout (Client Component) */}
            <LogoutButton />
          </div>
        </header>

        {/* ----- เนื้อหาของแต่ละหน้า ----- */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children} 
        </main>
      </div>
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว