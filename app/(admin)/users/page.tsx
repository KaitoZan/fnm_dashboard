// app/(admin)/users/page.tsx
import { createClient } from "@/lib/supabase/server";
import UserActions from "./UserActions"; // (4) Import Client Component
import type { Database } from "@/types/supabase";

// (1) สร้าง Type สำหรับ Profile
type Profile = Database["public"]["Tables"]["user_profiles"]["Row"];

// (2) ฟังก์ชันดึงข้อมูลผู้ใช้ทั้งหมด
async function getUsers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error.message);
    return [];
  }
  return data;
}

// (3) หน้าหลักสำหรับ Users
export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">จัดการผู้ใช้ (User Management)</h1>

      {users.length === 0 ? (
        <p>ไม่พบข้อมูลผู้ใช้</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left py-3 px-4 bg-gray-100 border-b border-gray-200">Avatar</th>
              <th className="text-left py-3 px-4 bg-gray-100 border-b border-gray-200">Username</th>
              <th className="text-left py-3 px-4 bg-gray-100 border-b border-gray-200">Phone</th>
              <th className="text-left py-3 px-4 bg-gray-100 border-b border-gray-200">Role</th>
              <th className="text-left py-3 px-4 bg-gray-100 border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-200">
                <td className="py-3 px-4 align-middle">
                  {user.avatar_url && (
                    <img 
                      src={user.avatar_url} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full" 
                    />
                  )}
                </td>
                <td className="py-3 px-4 align-middle">{user.user_name}</td>
                <td className="py-3 px-4 align-middle">{user.phone_no}</td>
                <td className="py-3 px-4 align-middle">
                  <span 
                    className={user.role === 'admin' 
                      ? 'bg-red-500 text-white py-1 px-2 rounded-full text-sm' 
                      : 'bg-gray-500 text-white py-1 px-2 rounded-full text-sm'
                    }
                  >
                    {user.role || 'user'}
                  </span>
                </td>
                <td className="py-3 px-4 align-middle">
                  {/* (4) ปุ่ม Actions (Client Component) */}
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว