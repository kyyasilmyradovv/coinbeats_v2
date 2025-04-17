'use client'

import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { useProfileQuery } from '@/store/api/auth.api'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'
import { setLoginModalOpen } from '@/store/general/generalSlice'
import { LogOut, User } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from './ui/separator'
import { setIsProfilSheetOpen, setProfil } from '@/store/user/userSlice'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useTheme } from 'next-themes'

export function ProfileSheet() {
    const dispatch = useAppDispatch()
    const { theme = 'dark' } = useTheme()
    const { isLoading, isFetching } = useProfileQuery({})
    const profile = useAppSelector((state) => state.user.profile)
    const isProfileSheetOpen = useAppSelector((state) => state.user.isProfileSheetOpen)
    const loading = isLoading || isFetching

    const [username, setUsername] = useState(profile?.name ?? '')
    const [password, setPassword] = useState('')

    const handleLogout = () => {
        localStorage.removeItem('coinbeatsAT')
        localStorage.removeItem('coinbeatsRT')
        dispatch(setProfil(undefined))
        dispatch(setIsProfilSheetOpen(false))
    }

    const handleSave = () => {
        console.log('Saving username:', username)
        console.log('Saving password:', password)
        // TODO: Dispatch update mutation here
    }

    const onOpenChange = () => {
        dispatch(setIsProfilSheetOpen(!isProfileSheetOpen))
    }

    return (
        <Sheet open={isProfileSheetOpen} onOpenChange={onOpenChange}>
            <div className="p-1">
                {loading ? (
                    <ProfileButtonSkeleton />
                ) : profile?.id ? (
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold">{profile?.name}</p>
                                <p className="text-xs text-muted-foreground">{profile?.email}</p>
                            </div>
                        </Button>
                    </SheetTrigger>
                ) : (
                    <Button onClick={() => dispatch(setLoginModalOpen(true))} variant="outline">
                        <span className="gradient-text">Sign in</span>
                    </Button>
                )}
            </div>

            <SheetContent className="w-full max-w-md p-6 space-y-6">
                <SheetHeader className="text-center">
                    <SheetTitle className="text-2xl font-bold">Your Profile</SheetTitle>
                </SheetHeader>

                {/* Display Info */}
                <div className="text-center space-y-1">
                    <p className="text-lg font-semibold text-primary">{profile?.name}</p>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>

                <Separator />

                {/* Editable Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter new username" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" />
                    </div>

                    <Button className="w-full mt-2" onClick={handleSave}>
                        Save Changes
                    </Button>
                </div>

                <Separator />

                <SheetFooter>
                    <Button onClick={handleLogout} variant="destructive" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
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
