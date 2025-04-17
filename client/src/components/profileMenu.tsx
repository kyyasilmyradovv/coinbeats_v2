import {
    Cloud,
    CreditCard,
    Github,
    Keyboard,
    LifeBuoy,
    LogOut,
    Mail,
    MessageSquare,
    Plus,
    PlusCircle,
    Settings,
    User,
    User2Icon,
    UserPlus,
    Users
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useProfileQuery } from '@/store/api/auth.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Skeleton } from './ui/skeleton'
import { setLoginModalOpen } from '@/store/general/generalSlice'
import { setIsProfilSheetOpen, setProfil } from '@/store/user/userSlice'

export function DropdownMenuProfil() {
    const dispatch = useAppDispatch()
    const { isLoading, isFetching } = useProfileQuery({})
    const profile = useAppSelector((state) => state.user.profile)
    const isProfileSheetOpen = useAppSelector((state) => state.user.isProfileSheetOpen)
    const loading = isLoading || isFetching

    const handleLogout = () => {
        localStorage.removeItem('coinbeatsAT')
        localStorage.removeItem('coinbeatsRT')
        dispatch(setProfil(undefined))
        dispatch(setIsProfilSheetOpen(false))
    }

    return (
        <DropdownMenu>
            <div className="p-1">
                {loading ? (
                    <ProfileButtonSkeleton />
                ) : profile?.id ? (
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                ) : (
                    <Button onClick={() => dispatch(setLoginModalOpen(true))} variant="outline">
                        <span className="gradient-text">Sign in</span>
                    </Button>
                )}
            </div>

            <DropdownMenuContent className="w-56">
                <div className="hidden md:block text-left">
                    <DropdownMenuLabel className="pb-1">{profile?.name}</DropdownMenuLabel>
                    {/* <DropdownMenuLabel>{profile?.email}</DropdownMenuLabel> */}
                    {/* <p className="text-sm font-semibold">{profile?.name}</p> */}
                    <p className="text-xs text-muted-foreground p-2 pt-0">{profile?.email}</p>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem>
                    <User2Icon />
                    <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard />
                    <span>Wallet</span>
                </DropdownMenuItem>

                <DropdownMenuItem>
                    <LifeBuoy />
                    <span>Support</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut />
                    <span>Log out</span>
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ProfileButtonSkeleton() {
    return (
        <Button variant="ghost" className="flex items-center gap-2" disabled>
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="hidden md:block space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </Button>
    )
}
