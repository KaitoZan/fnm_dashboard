// app/(admin)/approvals/ApprovalCard.tsx
'use client'

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EditRequestWithProfile } from "./page"; 
import RequestDetailModal from "./RequestDetailModal"; 
import { approveRequest, rejectRequest } from "./actions"; 
import RestaurantPreview from "./RestaurantPreview"; 

// (Type ProposedData - เหมือนเดิม)
type ProposedData = {
  res_name?: string;
  description?: string;
  detail?: string | null;
  phone_no?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  food_type?: string | null;
  res_img?: string | null;
  gallery_imgs_urls?: any; 
  promo_imgs_urls?: any;   
  menus?: { name: string, price: number }[] | null;
  has_delivery?: boolean;
  has_dine_in?: boolean;
  is_open?: boolean;
  // เพิ่ม opening_hours และ rating เพื่อให้โค้ดส่วน PreviewDescription ไม่ Error
  opening_hours?: string | null;
  rating?: number | null; 
};

export default function ApprovalCard({ request }: { request: EditRequestWithProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'data'>('preview');

  const proposedData = (request.proposed_data as ProposedData) || {};

  const getRequestDisplayTitle = (type: string) => {
    switch(type) {
      case 'new_restaurant':
        return 'คำขอเพิ่มร้านใหม่';
      case 'update_location':
        return 'คำขอแก้ไขตำแหน่ง';
      case 'reapproval_from_suspended': 
        return 'คำขออนุมัติซ้ำ (ร้านถูกระงับ)';
      default:
        return 'คำขอจัดการข้อมูล';
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการ 'อนุมัติ' คำขอนี้?")) return;

    startTransition(async () => {
      setError(null);
      const result = await approveRequest(request.id);
      if (result.error) {
        setError(result.error);
        alert("เกิดข้อผิดพลาดในการอนุมัติ: " + result.error);
      } else {
        alert("อนุมัติคำขอเรียบร้อยแล้ว");
        setIsModalOpen(false);
        router.refresh();
      }
    });
  };

  const handleReject = async () => {
    const reason = window.prompt("กรุณาระบุเหตุผลในการปฏิเสธ (จะแสดงให้ผู้ใช้เห็น):");
    if (!reason || reason.trim() === "") return;

    startTransition(async () => {
      setError(null);
      const result = await rejectRequest(request.id, reason.trim());
      if (result.error) {
        setError(result.error);
        alert("เกิดข้อผิดพลาดในการปฏิเสธ: " + result.error);
      } else {
        alert("ปฏิเสธคำขอเรียบร้อยแล้ว");
        setIsModalOpen(false);
        router.refresh();
      }
    });
  };

  // แก้ไข: ลดขนาด Modal (800 -> 640, 420 -> 336)
  const modalMaxWidth = viewMode === 'preview' ? '336px' : '640px'; 

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {getRequestDisplayTitle(request.edit_type)}
          </h3>
          <p><strong>ชื่อร้าน:</strong> {proposedData?.res_name || "N/A"}</p>
          <p><strong>ผู้ส่ง:</strong> {request.user_profiles?.user_name || "N/A"}</p>
        </div>

        {/* (1) === โครงสร้าง Action Group === */}
        <div className="flex flex-col items-stretch min-w-[220px] text-white"> 
          {error && <p className="text-red-600 mb-4">{error}</p>}
          
          {/* 1.1 ปุ่ม ดูรายละเอียด (สีน้ำเงิน) */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold text-white bg-blue-500 mb-2 hover:bg-blue-600 transition-colors"
          >
            ดูรายละเอียด
          </button>
          
          {/* 1.2 ปุ่ม Approve/Reject (เรียงแนวนอน) */}
          <div className="flex flex-row gap-1 w-full">
              <button 
                  onClick={handleApprove} 
                  disabled={isPending} 
                  className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold flex-1 min-w-[80px] bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                  {isPending ? "..." : "อนุมัติ"}
              </button>
              <button 
                  onClick={handleReject} 
                  disabled={isPending} 
                  className="py-2 px-4 border-none rounded-md cursor-pointer font-semibold flex-1 min-w-[80px] bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                  {isPending ? "..." : "ปฏิเสธ"}
              </button>
          </div>
        </div>
      </div>

      <RequestDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`รายละเอียดคำขอ: ${proposedData?.res_name || ""}`}
        maxWidth={modalMaxWidth}
      >
        <div className="flex border-b border-gray-200">
          <button 
            className={viewMode === 'preview' 
              ? 'py-3 px-4 bg-transparent border-none border-b-2 border-blue-500 cursor-pointer text-blue-500 font-semibold'
              : 'py-3 px-4 bg-transparent border-none border-b-2 border-transparent cursor-pointer text-gray-500 font-medium hover:text-blue-400'}
            onClick={() => setViewMode('preview')}
          >
            จำลองหน้าแอป (Preview)
          </button>
          <button 
            className={viewMode === 'data' 
              ? 'py-3 px-4 bg-transparent border-none border-b-2 border-blue-500 cursor-pointer text-blue-500 font-semibold'
              : 'py-3 px-4 bg-transparent border-none border-b-2 border-transparent cursor-pointer text-gray-500 font-medium hover:text-blue-400'}
            onClick={() => setViewMode('data')}
          >
            ข้อมูลดิบ (Raw Data)
          </button>
        </div>

        {viewMode === 'preview' ? (
          <RestaurantPreview data={{
              ...proposedData,
              gallery_imgs_urls: Array.isArray(proposedData.gallery_imgs_urls) ? proposedData.gallery_imgs_urls : [],
              promo_imgs_urls: Array.isArray(proposedData.promo_imgs_urls) ? proposedData.promo_imgs_urls : [],
          } as any} />
        ) : (
          // Raw Data View
          <div className="flex flex-col gap-4"> 
            <RenderField label="ชื่อร้าน" value={proposedData.res_name} />
            <RenderField label="คำอธิบาย" value={proposedData.description} />
            <RenderField label="รายละเอียด (ในร้าน)" value={proposedData.detail} />
            <RenderField label="เบอร์โทร" value={proposedData.phone_no} />
            <RenderField label="ที่ตั้ง (ข้อความ)" value={proposedData.location} />
            <RenderField label="Latitude" value={proposedData.latitude} />
            <RenderField label="Longitude" value={proposedData.longitude} />
            <RenderField label="ประเภทอาหาร" value={proposedData.food_type} />
            <RenderField label="มี Delivery" value={proposedData.has_delivery ? "ใช่" : "ไม่"} />
            <RenderField label="ทานที่ร้านได้" value={proposedData.has_dine_in ? "ใช่" : "ไม่"} />
            <RenderField label="สถานะ (ค่าเริ่มต้น)" value={proposedData.is_open ? "เปิด" : "ปิด"} />
            
            <RenderImage label="รูปหน้าปก (res_img)" imageUrl={proposedData.res_img ?? null} /> {/* <-- แก้ไขตรงนี้ */}
            <RenderImageArray 
                label="แกลเลอรี (gallery_imgs_urls)" 
                images={Array.isArray(proposedData.gallery_imgs_urls) ? proposedData.gallery_imgs_urls as string[] : []} 
            />
            <RenderPromotion 
                label="โปรโมชัน (promo_imgs_urls)" 
                items={Array.isArray(proposedData.promo_imgs_urls) ? proposedData.promo_imgs_urls as string[] : []} 
            />
            
            <RenderMenu label="รายการเมนู (menus)" menus={proposedData.menus ?? null} /> {/* <-- แก้ไขตรงนี้ */}
            
            {error && <p className="text-red-600">{error}</p>}
          </div>
        )}
      </RequestDetailModal>
    </>
  );
}

// === Helper Components (ใช้ Tailwind Classes) ===

function RenderField({ label, value }: { label: string, value: any }) { 
    return <p><strong>{label}:</strong> {value?.toString() || <span className="text-gray-400"> (ไม่มีข้อมูล)</span>}</p> 
};
function RenderImage({ label, imageUrl }: { label: string, imageUrl: string | null }) { 
    return (
        <div className="border-b border-gray-100 pb-4">
            <strong>{label}:</strong>
            {imageUrl ? 
              <img src={imageUrl} alt={label} className="h-[100px] w-[100px] object-cover rounded border border-gray-200" /> 
              : <p className="text-gray-400"> (ไม่มีรูป)</p>}
        </div>
    ); 
};


// Helper Component สำหรับแสดง Array ของรูปภาพ (Gallery)
function RenderImageArray({ label, images }: { label: string, images: string[] | null }) { 
    return (
        <div className="border-b border-gray-100 pb-4">
            <strong>{label}:</strong>
            {images && images.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                    {images.map((url, index) => 
                      <img key={index} src={url} alt={`${label} ${index}`} className="h-[100px] w-[100px] object-cover rounded border border-gray-200" />
                    )}
                </div>
            ) : <p className="text-gray-400"> (ไม่มีรูป)</p>}
        </div>
    ); 
};

// Helper Component - RenderPromotion
function RenderPromotion({ label, items }: { label: string, items: string[] | null }) { 
    if (!items || items.length === 0) {
        return <p><strong>{label}:</strong> <span className="text-gray-400"> (ไม่มีข้อมูล)</span></p>;
    }
    
    // ตรวจสอบว่าเป็น Image (URL) หรือไม่
    const isImageBanner = items.some(item => item.startsWith('http'));

    if (isImageBanner) {
        return (
            <div className="border-b border-gray-100 pb-4">
                <strong>{label} (รูปภาพ):</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                    {items.map((url, index) => 
                      <img key={index} src={url} alt={`${label} ${index}`} className="h-[100px] w-[100px] object-cover rounded border border-gray-200" />
                    )}
                </div>
            </div>
        ); 
    } else {
        return (
            <div className="border-b border-gray-100 pb-4">
                <strong>{label} (ข้อความ):</strong>
                <ul className="pl-6 mt-2 list-disc">
                    {items.map((text, index) => <li key={index}>{text}</li>)}
                </ul>
            </div>
        );
    }
};


function RenderMenu({ label, menus }: { label: string, menus: { name: string, price: number }[] | null }) { 
    return (
        <div className="border-b border-gray-100 pb-4">
            <strong>{label}:</strong>
            {menus && menus.length > 0 ? (
                <ul className="pl-6 mt-2">
                    {menus.map((menu, index) => <li key={index}>{menu.name} - {menu.price} บาท</li>)}
                </ul>
            ) : <p className="text-gray-400"> (ไม่มีเมนู)</p>}
        </div>
    ); 
};

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว
