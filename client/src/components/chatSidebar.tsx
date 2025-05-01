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
import { useParams } from 'next/navigation'
import Image from 'next/image'

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
    const params = useParams()
    const id = params.chatId

    const recommendedTopics = ['Tech News', 'Health Tips', 'Learning English', 'Marketing Ideas', 'Startup Advice']

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

            <SidebarContent className="flex flex-col flex-grow overflow-hidden">
                <SidebarGroup className="flex-1 flex flex-col overflow-hidden">
                    <SidebarGroupContent className="flex-1 overflow-y-auto pr-1">
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
                                                  <p
                                                      className={`flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate ${
                                                          id == chat.id.toString() ? 'btn-gradient text-white' : ''
                                                      }`}
                                                  >
                                                      {chat.title}
                                                  </p>
                                              </SidebarMenuButton>
                                          </Link>
                                      </SidebarMenuItem>
                                  ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                    {/* Recommended Topics: stays fixed below scrollable chats */}
                    <div className="bg-background pt-2 pb-4">
                        <div className="flex items-center my-4">
                            <div className="flex-grow border-t border-muted" />
                            <span className="mx-2 text-xs text-muted-foreground">Trending Topics</span>
                            <div className="flex-grow border-t border-muted" />
                        </div>
                        <SidebarMenu>
                            {recommendedTopics.map((topic, index) => (
                                <SidebarMenuItem key={index} className="mt-1">
                                    <Link href={`/ai-chat/topic/${encodeURIComponent(topic)}`}>
                                        <SidebarMenuButton className="cursor-pointer">
                                            <p className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate">
                                                {topic}
                                            </p>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </div>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center gap-2 justify-center">
                    <div className="relative w-[20px] h-[20px]">
                        <Image src={'/coinbeats-l.svg'} alt="Coin-Beats" fill className="object-contain" />
                    </div>
                    <p className="text-xs">Conbeats AI</p>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
