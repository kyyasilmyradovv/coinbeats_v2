'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Separator } from './ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader, MoveLeft } from 'lucide-react'
import Image from 'next/image'
import { useAuthMutation, useSendCodeMutation } from '@/store/api/auth.api'
import { Toaster } from './ui/sonner'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { setLoginModalOpen, setSignUpModalOpen, setStep } from '@/store/general/generalSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: 'Your one-time password must be 6 characters.'
    })
})

type TSignInFields = {
    code: number
}

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
    }, [isSuccess, isError])

    const onSubmit = async (values: TSignInFields) => {
        const valuesToSend = values
        await sendCode(valuesToSend)
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
                            {isLoading ? <Loader size={30} className="animate-spin" /> : 'CREATE ACCOUNT'}
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
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: ''
        }
    })
    const [sendCode, { isSuccess, data, isError, error, isLoading, reset }] = useSendCodeMutation()

    useEffect(() => {
        if (isError) {
            dispatch(setStep(3))
        }
    }, [isSuccess, isError])

    const onSubmit = async (values: TSignInFields) => {
        const valuesToSend = values
        await sendCode(valuesToSend)
    }
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5">
                    <MoveLeft className="cursor-pointer" onClick={() => dispatch(setStep(1))} />
                    <p>Verify Your Email</p>
                </DialogTitle>
                <DialogDescription>
                    Enter the verification code that has been sent to your email address <span className="font-semibold">(didargayypow@gmail.com)</span>
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 pb-2 pt-0">
                    <FormField
                        control={form.control}
                        name="pin"
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
                            {isLoading ? <Loader size={30} className="animate-spin" /> : 'Verify'}
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    )
}
function Register() {
    return <DialogContent className="sm:max-w-[425px]">Register</DialogContent>
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
