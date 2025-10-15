'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FaBrain } from 'react-icons/fa'

interface MinimalHeaderProps {
  email?: string | null
}

export default function MinimalHeader({ email }: MinimalHeaderProps) {
  const params = useParams()
  const lang = params.lang as string || 'es'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${lang}`} className="flex items-center gap-2 text-gray-900 hover:text-primary-600 transition">
              <FaBrain className="text-2xl text-primary-600" />
              <span className="text-xl font-bold">myIQ</span>
            </Link>
          </div>

          {/* Email display */}
          {email && (
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-700">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 text-xs font-medium">i</span>
              <span className="truncate">{email}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
