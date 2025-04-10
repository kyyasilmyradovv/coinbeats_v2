'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from './ui/separator'
import { Eye, EyeOff, Loader, MoveLeft } from 'lucide-react'
import Image from 'next/image'
import { useCreateProfileMutation, useSendCodeMutation, useVerifyMutation } from '@/store/api/auth.api'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { setLoginModalOpen, setNewMail, setSignUpModalOpen, setStep } from '@/store/general/generalSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { setProfil } from '@/store/user/userSlice'

const FormSchema = z.object({
    code: z.string().min(6, {
        message: 'Your one-time password must be 6 characters.'
    })
})

function SendCode() {
    const dispatch = useAppDispatch()
    const form = useForm({
        defaultValues: {
            email: ''
        }
    })
    const [sendCode, { isSuccess, data, isError, error, isLoading, reset }] = useSendCodeMutation()

    useEffect(() => {
        if (isSuccess) {
            dispatch(setStep(2))
        }
        if (isError) {
            let errorMessage = 'Something went wrong!'
            if ('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
                errorMessage = (error.data as { message?: string }).message ?? errorMessage
            }

            toast(errorMessage, {
                position: 'top-center'
            })
        }
    }, [isSuccess, isError])

    const onSubmit = async (values: { email: string }) => {
        const valuesToSend = values
        await sendCode(valuesToSend)
        dispatch(setNewMail(valuesToSend.email))
    }
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Sign UP</DialogTitle>
                <DialogDescription>Welcome to our platform!</DialogDescription>
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

                    <DialogFooter>
                        <Button type="submit" className="w-full">
                            {isLoading ? <Loader size={30} className="animate-scode" /> : 'CREATE ACCOUNT'}
                        </Button>
                    </DialogFooter>
                    <p
                        onClick={() => {
                            dispatch(setSignUpModalOpen(false))
                            dispatch(setLoginModalOpen(true))
                        }}
                        className="text-sm text-muted-foreground text-center mt-2"
                    >
                        Already have an account? <span className="text-primary hover:underline cursor-pointer">Sign in</span>
                    </p>
                </form>
            </Form>
        </DialogContent>
    )
}
function Verify() {
    const dispatch = useAppDispatch()
    const newMail = useAppSelector((state) => state.general.newMail)
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            code: ''
        }
    })
    const [verify, { isSuccess, data, isError, error, isLoading, reset }] = useVerifyMutation()

    useEffect(() => {
        if (isSuccess) {
            localStorage.setItem('coinbeatsAT', data.accessToken)
            localStorage.setItem('coinbeatsRT', data.refreshToken)
            dispatch(setProfil(data))
            dispatch(setStep(3))
        }
        if (isError) {
            let errorMessage = 'Something went wrong!'
            if ('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
                errorMessage = (error.data as { message?: string }).message ?? errorMessage
            }

            toast(errorMessage, {
                position: 'top-center'
            })
        }
    }, [isSuccess, isError])

    const onSubmit = async (values: { code: string }) => {
        const valuesToSend = { ...values, email: newMail }
        await verify(valuesToSend)
    }

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5">
                    <MoveLeft className="cursor-pointer" onClick={() => dispatch(setStep(1))} />
                    <p>Verify Your Email</p>
                </DialogTitle>
                <DialogDescription>
                    Enter the verification code that has been sent to your email address <span className="font-semibold">({newMail})</span>
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pb-2 pt-0">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <InputOTP maxLength={6} {...field}>
                                        <InputOTPGroup className="w-full">
                                            <InputOTPSlot index={0} className="flex-1" />
                                            <InputOTPSlot index={1} className="flex-1" />
                                            <InputOTPSlot index={2} className="flex-1" />
                                            <InputOTPSlot index={3} className="flex-1" />
                                            <InputOTPSlot index={4} className="flex-1" />
                                            <InputOTPSlot index={5} className="flex-1" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <DialogFooter>
                        <Button type="submit" className="w-full">
                            {isLoading ? <Loader size={30} className="animate-scode" /> : 'Verify'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}
function Register() {
    const dispatch = useAppDispatch()
    const newMail = useAppSelector((state) => state.general.newMail)
    const profile = useAppSelector((state) => state.user.profile)
    const form = useForm({
        defaultValues: {
            name: profile?.name || '', // Ensure name is always a string
            password: ''
        }
    })
    const [showPassword, setShowPassword] = useState(false)
    const [createProfile, { isSuccess, data, isError, error, isLoading, reset }] = useCreateProfileMutation()

    useEffect(() => {
        if (isSuccess) {
            localStorage.setItem('coinbeatsAT', data.accessToken)
            localStorage.setItem('coinbeatsRT', data.refreshToken)
            dispatch(setProfil(data))
            dispatch(setStep(1))
            dispatch(setSignUpModalOpen(false))
        }
        if (isError) {
            let errorMessage = 'Something went wrong!'
            if ('data' in error && typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
                errorMessage = (error.data as { message?: string }).message ?? errorMessage
            }

            toast(errorMessage, {
                position: 'top-center'
            })
        }
    }, [isSuccess, isError])

    const onSubmit = async (values: { name: string; password: string }) => {
        const valuesToSend = { ...values }
        await createProfile(valuesToSend)
    }

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5">
                    <p>Finish your sign up</p>
                </DialogTitle>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pb-2 pt-0">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="you" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    <FormField
                        control={form.control}
                        name="password"
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 5,
                                message: 'Password must be at least 5 characters'
                            }
                        }}
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

                    <DialogFooter>
                        <Button type="submit" className="w-full">
                            {isLoading ? <Loader size={30} className="animate-spin" /> : 'FINISH'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}

export function SignUpModal() {
    const dispatch = useAppDispatch()
    const signUpModal = useAppSelector((state) => state.general.signUpModalOpen)
    const step = useAppSelector((state) => state.general.step)

    return (
        <Dialog
            open={signUpModal}
            onOpenChange={() => {
                dispatch(setSignUpModalOpen(!signUpModal))
                dispatch(setLoginModalOpen(false))
                dispatch(setStep(1))
            }}
        >
            {step === 1 && <SendCode />}
            {step === 2 && <Verify />}
            {step === 3 && <Register />}
        </Dialog>
    )
}
