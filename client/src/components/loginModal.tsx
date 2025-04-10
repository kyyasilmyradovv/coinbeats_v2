'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from './ui/separator'
import { Eye, EyeOff, Loader } from 'lucide-react'
import Image from 'next/image'
import { useAuthMutation } from '@/store/api/auth.api'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setLoginModalOpen, setSignUpModalOpen } from '@/store/general/generalSlice'
import { setProfil } from '@/store/user/userSlice'

type TSignInFields = {
    email: string
    password: string
}

export function LoginModal() {
    const dispatch = useAppDispatch()
    const loginModalOpen = useAppSelector((state) => state.general.loginModalOpen)
    const [showPassword, setShowPassword] = useState(false)

    const [auth, { isSuccess, data, isError, error, isLoading, reset }] = useAuthMutation()

    useEffect(() => {
        if (isError) {
            toast('Error!', {
                description: 'Something went wrong. Please check your credentials and try again.',
                position: 'top-right'
            })
        }
        if (isSuccess) {
            localStorage.setItem('coinbeatsAT', data.accessToken)
            localStorage.setItem('coinbeatsRT', data.refreshToken)
            dispatch(setProfil(data))
            toast('Successfully signed in!', {
                description: 'Welcome back! You have successfully logged into your account.',
                position: 'top-right'
            })
            dispatch(setLoginModalOpen(false))
        }
        reset()
    }, [isSuccess, isError])

    const form = useForm<TSignInFields>({
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = async (values: TSignInFields) => {
        const valuesToSend = values
        // delete valuesToSend.remember
        await auth(valuesToSend)
    }

    return (
        <Dialog
            open={loginModalOpen}
            onOpenChange={() => {
                dispatch(setLoginModalOpen(!loginModalOpen))
            }}
        >
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign In</DialogTitle>
                    <DialogDescription>Welcome back, please sign in to continue.</DialogDescription>
                </DialogHeader>

                <Button variant="outline" className="cursor-pointer flex gap-2 items-center" type="button" onClick={() => signIn('google')}>
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

                        {/* Password */}
                        <FormField
                            control={form.control}
                            name="password"
                            rules={{ required: 'Password is required' }}
                            render={({ field }) => (
                                <FormItem className="relative">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="pr-10" {...field} />
                                    </FormControl>
                                    <div
                                        className="absolute right-3 top-[30px] cursor-pointer text-muted-foreground"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Remember me */}
                        {/* <FormField
                            control={form.control}
                            name="remember"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox id="remember" checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel htmlFor="remember" className="mb-0">
                                        Remember me
                                    </FormLabel>
                                </FormItem>
                            )}
                        /> */}

                        <DialogFooter>
                            <Button type="submit" className="w-full">
                                {isLoading ? <Loader size={30} className="animate-spin" /> : 'SIGN IN'}
                            </Button>
                        </DialogFooter>

                        <p
                            onClick={() => {
                                dispatch(setSignUpModalOpen(true))
                                dispatch(setLoginModalOpen(false))
                            }}
                            className="text-sm text-muted-foreground text-center mt-2"
                        >
                            Don&apos;t have an account? <span className="text-primary hover:underline cursor-pointer">Sign up</span>
                        </p>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
