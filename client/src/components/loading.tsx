import React, { ReactNode } from 'react'
import { Card, CardHeader, CardFooter, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { cn, constructImageUrl } from '@/lib/utils'
import { Button } from './ui/button'
import { BellRing, Bookmark, Check, CheckCheck, Flag, Loader, Save, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import Link from 'next/link'
import { ROUTES } from '@/shared/links'
import { TAcademy } from '@/types/academy'

export interface LoadingProps {
    size: number
}

function Loading({ size = 50 }: LoadingProps) {
    return <Loader size={size} className="animate-spin" />
}

export default Loading
