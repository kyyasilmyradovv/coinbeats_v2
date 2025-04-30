import { Calendar, Home, Inbox, MessageSquarePlus, Plus, Search, SearchCheck, SearchIcon, Settings } from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar'
import { useChatsQuery } from '@/store/api/ai_chat.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/links'
import Link from 'next/link'
import { setIsNewChat, setMessages } from '@/store/ai-chat/ai_chatSlice'

// Skeleton component using Tailwind CSS
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export function ChatSidebar() {
    const dispatch = useAppDispatch()
    const { open } = useSidebar()
    const chatSendInfo = useAppSelector((state) => state.ai_chat.chatSendInfo)
    const chats = useAppSelector((state) => state.ai_chat.chats)
    const { currentData: _, isLoading, isFetching } = useChatsQuery(chatSendInfo)

    return (
        <Sidebar className="h-[calc(100vh-56px)] mt-[56px]">
            <SidebarHeader>
                <SidebarGroupLabel>{open && <SidebarTrigger />}</SidebarGroupLabel>

                <SidebarGroupAction title="Add Project" className="mr-6">
                    <div className="flex gap-2 items-center">
                        <SearchIcon className="cursor-pointer h-5" />
                        <Link href={'/ai-chat'} key={1} scroll={false} className="flex-1">
                            <MessageSquarePlus className="cursor-pointer h-5 w-5" />
                        </Link>
                    </div>
                </SidebarGroupAction>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isLoading || isFetching
                                ? Array.from({ length: 10 }).map((_, index) => (
                                      <SidebarMenuItem key={index} className="mt-1">
                                          <SidebarMenuButton className="cursor-pointer">
                                              <Skeleton className="h-4 w-3/4 mx-2 my-2" />
                                          </SidebarMenuButton>
                                      </SidebarMenuItem>
                                  ))
                                : chats?.map((chat) => (
                                      <SidebarMenuItem key={chat.id} className="mt-1">
                                          <Link
                                              href={ROUTES.getMessages(chat.id)}
                                              className="block"
                                              onClick={() => {
                                                  dispatch(setIsNewChat(false))
                                                  dispatch(setMessages([]))
                                              }}
                                          >
                                              <SidebarMenuButton className="cursor-pointer">
                                                  <p className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate">
                                                      {chat.title}
                                                  </p>
                                              </SidebarMenuButton>
                                          </Link>
                                      </SidebarMenuItem>
                                  ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <p className="text-xs">Conbeats AI</p>
            </SidebarFooter>
        </Sidebar>
    )
}
