import Link from "next/link"
import { Phone, MessageCircle } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-4 border-t">
      <div className="container flex flex-col md:flex-row items-center justify-between px-4 mx-auto md:px-6 space-y-2 md:space-y-0">
        <div className="text-sm text-gray-500">© EmScripts 2024. All Right Reserved.</div>
        <div className="flex items-center gap-4">
         
          <Link 
            href="/emergency" 
            className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100"
            title="Emergency Contact"
          >
            <Phone className="w-5 h-5" />
          </Link>
          <Link 
            href="https://wa.me/+911234567890" 
            target="_blank"
            className="p-2 text-gray-600 hover:text-green-600 rounded-full hover:bg-gray-100"
            title="WhatsApp Support"
          >
            <MessageCircle className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

