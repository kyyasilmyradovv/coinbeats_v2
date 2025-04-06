'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from './ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader } from 'lucide-react'
import Image from 'next/image'
import { useAuthMutation } from '@/store/api/auth.api'
import { Toaster } from './ui/sonner'
import { toast } from 'sonner'

type TSignInFields = {
    email: string
}

export function SignUpModal() {
    const form = useForm({
        defaultValues: {
            email: ''
        }
    })

    const onSubmit = async (values: TSignInFields) => {
        console.log('values', values)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <p className="text-sm text-muted-foreground text-center mt-2">
                    Don&apos;t have an account? <span className="text-primary hover:underline cursor-pointer">Sign up</span>
                </p>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign UP</DialogTitle>
                    <DialogDescription>Welcome to our platform!</DialogDescription>
                </DialogHeader>

                <Button variant="outline" className="cursor-pointer flex gap-2 items-center" type="button">
                    <div className="relative w-[20px] h-[20px]">
                        <Image src="google-icon-logo-svgrepo-com.svg" alt="google" fill className="object-contain" />
                    </div>
                    <p>Continue with Google</p>
                </Button>

                <Separator className="my-2" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pb-2 pt-0">
                        {/* Email */}
                        <FormField
                            control={form.control}
                            name="email"
                            rules={{ required: 'Email is required' }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="you@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                {false ? <Loader size={30} className="animate-spin" /> : 'CREATE ACCOUNT'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
