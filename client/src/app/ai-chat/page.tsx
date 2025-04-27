'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { ChatSidebar } from '@/components/chatSidebar'
import Chat from './chat'

export default function AIChat() {
    return (
        <SidebarProvider>
            <ChatSidebar />
            <Chat />
        </SidebarProvider>
    )
}
