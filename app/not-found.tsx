import { Metadata } from 'next'
import { Command } from 'lucide-react'

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
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <a href="/" className="flex items-center gap-2 group mb-8">
        <img src="https://uploadkon.ir/uploads/59e123_25logo.png" alt="logo" className="h-9 w-9 text-primary transition-transform group-hover:rotate-12" />
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          سینما پلاس
        </h1>
      </a>
      <h2 className="text-3xl font-bold mb-4">404 | صفحه پیدا نشد</h2>
      <p className="text-muted-foreground mb-8 text-center">
        The page you are looking for does not exist
        <br />
        صفحه مورد نظر شما یافت نشد
      </p>
      <a
        href="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition"
      >
        بازگشت به خانه | Return Home
      </a>
    </div>
  )
} 