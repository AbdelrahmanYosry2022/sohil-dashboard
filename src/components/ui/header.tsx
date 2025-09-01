import React from 'react'

// Header copied exactly from the source project's Home page header
// Source structure reference: src/app/page.tsx (Next.js project)
export function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الرسوم المتحركة</h1>
        <p className="mt-2 text-gray-600">إدارة وتطوير مشاريع الرسوم المتحركة</p>
      </div>
    </header>
  )
}
