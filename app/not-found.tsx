import { Metadata } from 'next'
import Link from 'next/link'
import { Command } from 'lucide-react'
import { useRouter } from 'next/navigation'

export const metadata: Metadata = {
  title: 'صفحه پیدا نشد | Cinema Plus | Page Not Found',
  description: 'The page you are looking for does not exist | صفحه مورد نظر شما یافت نشد',
  openGraph: {
    title: 'صفحه پیدا نشد | Cinema Plus | Page Not Found',
    description: 'The page you are looking for does not exist | صفحه مورد نظر شما یافت نشد',
  },
  twitter: {
    title: 'صفحه پیدا نشد | Cinema Plus | Page Not Found',
    description: 'The page you are looking for does not exist | صفحه مورد نظر شما یافت نشد',
  },
}

export default function NotFound() {
  const router = useRouter()
  
  const handleNavigateHome = () => {
    router.push('/')
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <button onClick={handleNavigateHome} className="flex items-center gap-2 group mb-8">
        <Command className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Cinema Plus
        </h1>
      </button>
      <h2 className="text-3xl font-bold mb-4">404 | صفحه پیدا نشد</h2>
      <p className="text-muted-foreground mb-8 text-center">
        The page you are looking for does not exist
        <br />
        صفحه مورد نظر شما یافت نشد
      </p>
      <button
        onClick={handleNavigateHome}
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition"
      >
        بازگشت به خانه | Return Home
      </button>
    </div>
  )
} 