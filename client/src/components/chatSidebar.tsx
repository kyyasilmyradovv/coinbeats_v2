import { Check, MessageSquarePlus, MoreVertical, Pencil, SearchIcon, Trash2, X } from 'lucide-react'

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

import { useChatsQuery, useCreateChatMutation, useDeleteChatMutation, useEditChatMutation, useTopicQuery, useTopicsQuery } from '@/store/api/ai_chat.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { ROUTES } from '@/shared/links'
import Link from 'next/link'
import { setIsNewChat, setIsTopic, setMessages } from '@/store/ai-chat/ai_chatSlice'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import Loading from './loading'

// Skeleton component using Tailwind CSS
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded bg-muted ${className}`} />
}

export function ChatSidebar() {
    const dispatch = useAppDispatch()
    const { open } = useSidebar()
    const router = useRouter()
    const chatSendInfo = useAppSelector((state) => state.ai_chat.chatSendInfo)
    const chats = useAppSelector((state) => state.ai_chat.chats)
    const [editingChatID, setEditingChatID] = useState('')
    const [newTitle, setNewTitle] = useState('')
    const { currentData: _, isLoading, isFetching } = useChatsQuery(chatSendInfo)

    const { currentData: topics, isLoading: topicsIsLoading, isFetching: topicsIsFetching } = useTopicsQuery(null)

    const params = useParams()
    const id = params.chatId

    const [
        createChat,
        {
            isSuccess: createChatIsSuccess,
            data: createChatData,
            isError: createChatIsError,
            isLoading: createChatIsLoading,
            error: createChatError,
            reset: createChatReset
        }
    ] = useCreateChatMutation()

    const [
        deleteChat,
        {
            isSuccess: deleteChatIsSuccess,
            data: deleteChatData,
            isError: deleteChatIsError,
            isLoading: deleteChatIsLoading,
            error: deleteChatError,
            reset: deleteChatReset
        }
    ] = useDeleteChatMutation()

    const [
        editChat,
        { isSuccess: editChatIsSuccess, data: editChatData, isError: editChatIsError, isLoading: editChatIsLoading, error: editChatError, reset: editChatReset }
    ] = useEditChatMutation()

    const createChatHandler = async (prompt: string) => {
        await createChat({ prompt: prompt })
    }
    const handleDelete = async (id: string) => {
        await deleteChat(id)
    }
    const handleEdit = async (id: string) => {
        await editChat({ id: id, params: { title: newTitle } })
    }

    useEffect(() => {
        if (createChatIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }
        if (createChatIsSuccess) {
            dispatch(setIsNewChat(true))

            router.push('/ai-chat/' + createChatData.id)
        }

        if (deleteChatIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }
        if (deleteChatIsSuccess) {
            dispatch(setMessages([]))

            router.push('/ai-chat/')
        }
        if (editChatIsError) {
            toast('Error!', {
                description: 'Server error. Please try again later.',
                position: 'top-right'
            })
        }
        if (editChatIsSuccess) {
            toast('Success!', {
                description: 'Successfully changed',
                position: 'top-right'
            })
            setNewTitle('')
            setEditingChatID('')
        }
        createChatReset()
    }, [createChatIsSuccess, createChatIsError, deleteChatIsError, deleteChatIsSuccess, editChatIsError, editChatIsSuccess])

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
                                                  dispatch(setIsTopic(false))
                                                  dispatch(setMessages([]))
                                              }}
                                          >
                                              <SidebarMenuButton className="cursor-pointer flex items-center justify-between">
                                                  {editingChatID === chat.id.toString() ? (
                                                      <input
                                                          type="text"
                                                          value={newTitle}
                                                          onChange={(e) => setNewTitle(e.target.value)}
                                                          className="flex-1 rounded-md px-2 py-1.5 text-sm  focus:outline-none"
                                                          autoFocus
                                                      />
                                                  ) : (
                                                      <p
                                                          className={`flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate ${
                                                              id == chat.id.toString() ? 'btn-gradient text-white' : ''
                                                          }`}
                                                      >
                                                          {chat.title}
                                                      </p>
                                                  )}
                                                  {editingChatID === chat.id.toString() ? (
                                                      editChatIsLoading ? (
                                                          <Loading size={10} />
                                                      ) : (
                                                          <div className="flex items-center g-2">
                                                              <Check
                                                                  onClick={() => {
                                                                      handleEdit(chat?.id.toString())
                                                                  }}
                                                                  className="w-4 h-4 cursor-pointer opacity-100 text-green-500"
                                                              />
                                                              <X
                                                                  onClick={() => {
                                                                      setNewTitle('')
                                                                      setEditingChatID('')
                                                                  }}
                                                                  className="w-4 h-4 cursor-pointer opacity-100 text-red-500"
                                                              />
                                                          </div>
                                                      )
                                                  ) : (
                                                      <DropdownMenu>
                                                          <DropdownMenuTrigger asChild>
                                                              <MoreVertical className="w-4 h-4 cursor-pointer opacity-0 group-hover:opacity-100 transition" />
                                                          </DropdownMenuTrigger>
                                                          <DropdownMenuContent side="right" align="end">
                                                              <DropdownMenuItem
                                                                  onClick={(e) => {
                                                                      e.preventDefault()
                                                                      //   setIsEditing(true)
                                                                      setEditingChatID(chat.id.toString())
                                                                      setNewTitle(chat.title)
                                                                  }}
                                                              >
                                                                  <Pencil className="w-4 h-4 mr-2" />
                                                                  Rename
                                                              </DropdownMenuItem>
                                                              <DropdownMenuItem
                                                                  onClick={(e) => {
                                                                      e.preventDefault()
                                                                      handleDelete(chat?.id.toString())
                                                                  }}
                                                              >
                                                                  {deleteChatIsLoading ? (
                                                                      <Loading size={10} />
                                                                  ) : (
                                                                      <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                                                                  )}
                                                                  Delete
                                                              </DropdownMenuItem>
                                                          </DropdownMenuContent>
                                                      </DropdownMenu>
                                                  )}
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
                            {topicsIsLoading || topicsIsFetching
                                ? Array.from({ length: 6 }).map((_, index) => (
                                      <SidebarMenuItem key={index} className="mt-1">
                                          <SidebarMenuButton className="cursor-pointer">
                                              <Skeleton className="h-4 w-3/4 mx-2 my-2" />
                                          </SidebarMenuButton>
                                      </SidebarMenuItem>
                                  ))
                                : topics?.map((topic, index) => (
                                      <SidebarMenuItem key={index} className="mt-1">
                                          <SidebarMenuButton
                                              onClick={() => {
                                                  localStorage.setItem('topicId', topic.id.toString())
                                                  createChatHandler(topic.title)
                                                  dispatch(setMessages([]))
                                                  dispatch(setIsNewChat(true))
                                                  dispatch(setIsTopic(true))
                                              }}
                                              className="cursor-pointer"
                                          >
                                              <p className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate">
                                                  {topic?.title}
                                              </p>
                                          </SidebarMenuButton>
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
