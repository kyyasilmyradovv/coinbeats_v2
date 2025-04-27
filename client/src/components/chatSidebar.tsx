import { Calendar, Home, Inbox, Plus, Search, SearchCheck, SearchIcon, Settings } from 'lucide-react'

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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar'

const sidebarData = [
    {
        title: 'What is Yield Farming in Crypto?',
        url: '#'
    },
    {
        title: 'Best Crypto Wallets',
        url: '#'
    },
    {
        title: "How to Buy Bitcoin: A Beginner's Guide",
        url: '#'
    },
    {
        title: 'What is Decentralized Finance (DeFi)?',
        url: '#'
    },
    {
        title: 'Understanding Non-Fungible Tokens (NFTs)',
        url: '#'
    },
    {
        title: 'Top 5 Crypto Exchanges for 2025',
        url: '#'
    },
    {
        title: 'How to Secure Your Cryptocurrency',
        url: '#'
    },
    {
        title: 'The Future of Blockchain Technology',
        url: '#'
    },
    {
        title: 'Crypto Regulations: What You Need to Know',
        url: '#'
    },
    {
        title: 'Staking Cryptocurrencies: Pros and Cons',
        url: '#'
    },
    {
        title: 'What is a Smart Contract?',
        url: '#'
    },
    {
        title: 'Crypto Trading Strategies for 2025',
        url: '#'
    },
    {
        title: 'Understanding Gas Fees in Ethereum',
        url: '#'
    },
    {
        title: 'How to Protect Your Crypto from Scams',
        url: '#'
    }
]

const footerData = [
    {
        title: 'Yeah buddy',
        url: '#'
    },
    {
        title: 'AI taking over jobs?',
        url: '#'
    }
]

export function ChatSidebar() {
    const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar()

    return (
        <Sidebar className="bg-red-600 h-[calc(100vh-56px)] mt-[56px] ">
            <SidebarHeader>
                <SidebarGroupLabel>{open && <SidebarTrigger />}</SidebarGroupLabel>

                <SidebarGroupAction title="Add Project" className="mr-6">
                    <div className="flex gap-2 items-center">
                        <SearchIcon className=" cursor-pointer h-5" />
                        <Plus className=" cursor-pointer" />
                    </div>
                </SidebarGroupAction>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {sidebarData.map((group, idx) => (
                                <SidebarMenuItem key={idx} className="mt-1">
                                    <SidebarMenuButton>
                                        <p className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted/50 transition-colors truncate">
                                            {group.title}
                                        </p>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <p className="text-xs ">Conbeats AI</p>
            </SidebarFooter>
        </Sidebar>
    )
}
