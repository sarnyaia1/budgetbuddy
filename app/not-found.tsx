import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-white">?</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Az oldal nem található
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Sajnos a keresett oldal nem létezik vagy áthelyezésre került.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              Vissza a kezdőlapra
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
