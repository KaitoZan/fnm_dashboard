// app/(admin)/LogoutButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // เคลียร์ session ฝั่ง client
  }

  return (
    <button 
      onClick={handleLogout} 
      className="py-2 px-4 border border-gray-300 rounded bg-transparent text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
    >
      Logout
    </button>
  )
}

// ลบ const styles ที่ไม่ได้ใช้งานแล้ว