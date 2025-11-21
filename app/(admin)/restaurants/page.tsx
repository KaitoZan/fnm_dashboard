// app/(admin)/restaurants/page.tsx
import { createClient } from '@supabase/supabase-js'; 
import RestaurantActions from "./RestaurantActions"; 
import type { Database } from "@/types/supabase";

// (1) === แก้ไข Type (เพื่อให้ตรงกับ query ใหม่) ===
type RestaurantWithOwner = Pick<
  Database["public"]["Tables"]["restaurants"]["Row"],
  "id" | "res_name" | "res_img" | "status" | "owner_id"
> & {
  // (1.1) เราจะบังคับให้ข้อมูล join มาใน object ชื่อ user_profiles
  user_profiles: { user_name: string } | null; 
};

// (2) === แก้ไขฟังก์ชันนี้ (อีกครั้ง) ===
async function getRestaurants() {
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // (3) === แก้ไข Query: (1) ระบุ Columns, (2) Alias Join ===
  // เราจะตั้งชื่อเล่น (Alias) "user_profiles:" ให้กับข้อมูลที่ Join มา
  // เพื่อป้องกันการชนกันของ Column 'id'
  const { data, error } = await supabaseAdmin
    .from("restaurants")
    .select(`
      id, 
      res_name, 
      res_img, 
      status, 
      owner_id, 
      user_profiles:user_profiles!restaurants_owner_id_fkey ( user_name )
    `) //
    .order("created_at", { ascending: false });
  // ( === สิ้นสุดส่วนที่แก้ไข === )

  if (error) {
    console.error("Error fetching restaurants (Admin):", error.message);
    return [];
  }
  
  // (4) === แก้ไข: Type assertion (เพื่อให้ตรงกับ Type ใหม่) ===
  // (ข้อมูลที่ได้จาก Supabase จะมี user_profiles เป็น object หรือ null)
  return data.map(r => ({
    ...r,
    user_profiles: r.user_profiles || null 
  })) as RestaurantWithOwner[];
}

// (Component หลัก - เหมือนเดิม)
export default async function RestaurantsPage() {
  const restaurants = await getRestaurants();

  return (
    <div>
      <h1 style={styles.pageTitle}>จัดการร้านค้า (Restaurant Management)</h1>

      {restaurants.length === 0 ? (
        <p>ไม่พบข้อมูลร้านค้า</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Owner</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {restaurants.map((res) => (
              <tr key={res.id} style={styles.tr}>
                <td style={styles.td}>
                  {res.res_img && (
                    <img 
                      src={res.res_img} 
                      alt={res.res_name} 
                      style={styles.avatar} 
                    />
                  )}
                </td>
                <td style={styles.td}>{res.res_name}</td>
                <td style={styles.td}>{res.user_profiles?.user_name || "(ไม่มีเจ้าของ)"}</td>
                <td style={styles.td}>
                  {/* (5) === เพิ่ม: แสดงผล Status ให้ครบ === */}
                  <span style={
                    res.status === 'approved' ? styles.approvedBadge :
                    res.status === 'pending' ? styles.pendingBadge :
                    res.status === 'suspended' ? styles.rejectedBadge : // (เพิ่ม suspended)
                    styles.pendingBadge
                  }>
                    {res.status}
                  </span>
                </td>
                <td style={styles.td}>
                  {/* (6) ตอนนี้ res.id จะเป็น UUID ที่ถูกต้อง */}
                  <RestaurantActions restaurantId={res.id} /> 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// (CSS - เพิ่ม style.rejectedBadge)
const styles: { [key:string]: React.CSSProperties } = {
  pageTitle: { fontSize: "2rem", fontWeight: "bold", marginBottom: "1.5rem" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "0.75rem 1rem",
    backgroundColor: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: { borderBottom: "1px solid #e5e7eb" },
  td: { padding: "0.75rem 1rem", verticalAlign: "middle" },
  avatar: { 
    width: "60px", 
    height: "40px", 
    borderRadius: "4px", 
    objectFit: "cover" 
  },
  approvedBadge: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "99px",
    fontSize: "0.875rem",
  },
  pendingBadge: {
    backgroundColor: "#f59e0b",
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "99px",
    fontSize: "0.875rem",
  },
  // (7) === เพิ่ม: Badge สำหรับ Status อื่นๆ ===
  rejectedBadge: {
    backgroundColor: "#ef4444", // Red
    color: "white",
    padding: "0.25rem 0.5rem",
    borderRadius: "99px",
    fontSize: "0.875rem",
  },
};