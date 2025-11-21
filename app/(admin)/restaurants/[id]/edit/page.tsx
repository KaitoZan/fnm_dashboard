// app/(admin)/restaurants/[id]/edit/page.tsx
import { createClient } from '@supabase/supabase-js';
import { notFound } from "next/navigation";
// เปลี่ยนชื่อ Import
import ViewRestaurantDetail from "./ViewRestaurantDetail"; 
import type { Database } from "@/types/supabase";
import RestaurantPreview from "@/app/(admin)/approvals/RestaurantPreview"; // <<< IMPORT: Phone Preview Component

// (Type definitions - เหมือนเดิม)
type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"];
type MenuItem = Database["public"]["Tables"]["menus"]["Row"];

// (ฟังก์ชันดึงข้อมูล - เหมือนเดิม)
async function getRestaurantData(id: string) {
  // (โค้ดนี้จาก Task 21 ถูกต้องแล้ว)
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: restaurant, error: resError } = await supabaseAdmin
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (resError || !restaurant) {
    console.error("Error fetching restaurant (Admin):", resError?.message);
    return null;
  }

  const { data: menus, error: menuError } = await supabaseAdmin
    .from("menus")
    .select("*")
    .eq("res_id", id);
  
  if (menuError) {
    console.error("Error fetching menus (Admin):", menuError.message);
  }
  
  return { restaurant, menus: menus || [] };
}


// (1) === แก้ไข Component หลัก ===
export default async function EditRestaurantPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  
  const params = await paramsPromise;

  const data = await getRestaurantData(params.id);

  if (!data) {
    notFound(); 
  }

  const { restaurant, menus } = data;
  
  // (3) สร้าง Data Object สำหรับ RestaurantPreview
  // เราใช้ as any เพื่อให้เข้ากันได้กับ ProposedData type ที่ไม่ได้ถูก Export มาโดยตรง
  const previewData = {
    ...restaurant,
    menus: menus, // เมนูอยู่ในรูปแบบที่ถูกต้องแล้ว
    // Gallery/Promo URL มักถูกเก็บในคอลัมน์ของตารางร้านค้าโดยตรง
    gallery_imgs_urls: (restaurant as any).gallery_imgs_urls || [],
    promo_imgs_urls: (restaurant as any).promo_imgs_urls || [],
    is_open: restaurant.status === 'approved', // กำหนดสถานะเปิด/ปิดสำหรับ Preview
  } as any; 


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        View Restaurant: <span className="text-blue-500">{restaurant.res_name}</span>
      </h1>
      
      {/* Container for Side-by-Side View */}
      <div className="flex gap-8">
          
          {/* (1) Left Column: The View-Only Form */}
          <div className="w-full lg:w-1/2">
              {/* เปลี่ยนชื่อ Component Tag */}
              <ViewRestaurantDetail 
                  restaurant={restaurant} 
                  initialMenus={menus} 
              />
          </div>

          {/* (2) Right Column: The Phone Preview */}
          <div className="hidden lg:block lg:w-1/2">
              <RestaurantPreview data={previewData} />
          </div>

      </div>
    </div>
  );
}