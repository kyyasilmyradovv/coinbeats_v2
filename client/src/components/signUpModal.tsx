'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type EmailFormFields = { email: string }
type OtpFormFields = { otp: string }

export function SignUpModal() {
    const [step, setStep] = useState<'email' | 'otp'>('email')
    const [email, setEmail] = useState('')

    const emailForm = useForm<EmailFormFields>({ defaultValues: { email: '' } })
    const otpForm = useForm<OtpFormFields>({ defaultValues: { otp: '' } })

    const sendOtp = async (values: EmailFormFields) => {
        try {
            // Backend call to send OTP to email
            // await sendOtpToEmail(values.email)
            setEmail(values.email)
            toast('OTP Sent', { description: `Check your email: ${values.email}` })
            setStep('otp')
        } catch (error) {
            toast('Failed to send OTP', { description: 'Please try again later.' })
        }
    }

    const verifyOtp = async (values: OtpFormFields) => {
        try {
            // Backend call to verify OTP
            // await verifyOtpCode({ email, otp: values.otp })
            toast('OTP Verified', { description: 'Your account is ready!' })
        } catch (error) {
            toast('Invalid OTP', { description: 'Please check the code and try again.' })
        }
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
                    <DialogTitle>{step === 'email' ? 'Sign Up' : 'Verify Email'}</DialogTitle>
                    <DialogDescription>
                        {step === 'email' ? 'Enter your email to receive a verification code.' : `We've sent a 6-digit code to ${email}.`}
                    </DialogDescription>
                </DialogHeader>

                {step === 'email' ? (
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(sendOtp)} className="grid gap-4 py-4">
                            <FormField
                                control={emailForm.control}
                                name="email"
                                rules={{ required: 'Email is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    Send OTP
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(verifyOtp)} className="grid gap-4 py-4">
                            <FormField
                                control={otpForm.control}
                                name="otp"
                                rules={{ required: 'OTP is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OTP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter 6-digit code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" className="w-full">
                                    Verify
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    )
}
