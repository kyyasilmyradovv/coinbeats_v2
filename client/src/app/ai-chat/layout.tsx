'use client'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chatSidebar'

export default function AIChat({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <ChatSidebar />
            {children}
        </SidebarProvider>
    )
}
