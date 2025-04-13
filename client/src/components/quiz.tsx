'use client'
import * as React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { ArrowLeft, ArrowRight, ChevronDown, Loader, Loader2, Sparkles, Trophy, Star, CheckCircle, HelpCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useFinishQuizMutation, useQuizzesQuery, useSubmitQuizMutation } from '@/store/api/quiz.api'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { TQuiz, TQuizFinishResult } from '@/types/quiz'
import { useAppSelector } from '@/store/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import Link from 'next/link'
import { NAV_ITEMS, ROUTES } from '@/shared/links'

type TSteps = 'start' | 'quiz' | 'end'

export function Quiz() {
    const params = useParams()
    const id = params.academyId

    const [step, setStep] = React.useState<TSteps>('start')
    const [open, setOpen] = React.useState(true)
    const [currentQuiz, setCurrentQuiz] = React.useState(0)
    const [selected, setSelected] = React.useState<string | undefined>()
    const [seconds, setSeconds] = React.useState(45)
    const [xp, setXp] = React.useState(0)
    const [showSuccessModal, setShowSuccessModal] = React.useState(false)

    const quizzes = useAppSelector((state) => state.quiz.quizzes)

    const { isLoading } = useQuizzesQuery({ academyId: id as string }, { skip: !id, refetchOnMountOrArgChange: true })

    const [checkAnswer, { isSuccess, data, isError, error, isLoading: checkIsLoading, reset }] = useSubmitQuizMutation()

    const [
        finishQuiz,
        { isSuccess: finishIsSuccess, data: finishData, isError: finishIsError, error: finishError, isLoading: finishIsLoading, reset: finishReset }
    ] = useFinishQuizMutation()

    const handleCheck = async () => {
        if (!selected) return
        await checkAnswer({ choiceId: Number(selected), questionId: quizzes[currentQuiz].id, secondsLeft: seconds })
    }
    const handleSubmit = async () => {
        reset()
        setSelected(undefined)
        setCurrentQuiz(0)
        setOpen(true)
        setSeconds(45)
        setShowSuccessModal(false)
        setStep('end')
        await finishQuiz({ academyId: id as string })
    }

    const handleNext = () => {
        reset()
        setSelected(undefined)
        setCurrentQuiz((prev) => prev + 1)
        setOpen(true)
        setSeconds(45)
        setShowSuccessModal(false)
    }

    const handleStart = () => {
        reset()
        setSelected(undefined)
        setCurrentQuiz(0)
        setOpen(true)
        setSeconds(45)
        setShowSuccessModal(false)
        setStep('quiz')
    }

    const current = quizzes[currentQuiz]
    const totalQuestions = quizzes.length
    const haveAnswered = !!current?.choices?.map((choice) => Object.keys(choice.userResponses?.[0] ?? {})?.length)?.filter((e) => e > 0)?.length

    React.useEffect(() => {
        if (finishIsError) {
            let errorMessage = 'Something went wrong!'
            if ('data' in finishError! && typeof finishError.data === 'object' && finishError.data !== null && 'message' in finishError.data) {
                errorMessage = (finishError.data as { message?: string }).message ?? errorMessage
            }

            toast(errorMessage, {
                position: 'top-center'
            })
        }
    }, [finishIsSuccess, finishIsError])

    // Timer logic
    React.useEffect(() => {
        const interval = setInterval(() => {
            if (!haveAnswered) {
                setSeconds((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        return 0
                    }
                    return prev - 1
                })
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [currentQuiz, selected])

    // XP gain
    React.useEffect(() => {
        if (data?.pointsAwarded) {
            setXp((prev) => prev + data.pointsAwarded)
            if (data.isCorrect) {
                setShowSuccessModal(true)
            }
        }
    }, [data])

    React.useEffect(() => {
        if (haveAnswered) {
            setStep('quiz')
        }
    }, [quizzes])

    if (step === 'start') {
        return <StartQuiz onStart={handleStart} />
    }
    if (step === 'end') {
        return <EndedQuiz result={finishData} loading={finishIsLoading} />
    }

    return isLoading ? (
        <div className="w-full h-[40vh] flex items-center justify-center">
            <Loader size={40} className="animate-spin" />
        </div>
    ) : (
        <div className="space-y-4">
            {/* 🔝 Timer and Progress */}
            <div className="p-2 rounded-xl border bg-background/80 backdrop-blur-sm shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium text-muted-foreground">
                        Question {currentQuiz + 1} of {totalQuestions}
                    </div>
                    <div className="text-sm font-semibold text-brand">XP: {xp}</div>
                </div>
                <div className="w-full h-2 rounded-full bg-muted mb-2 overflow-hidden">
                    <div className="h-full background-brand transition-all duration-300" style={{ width: `${((currentQuiz + 1) / totalQuestions) * 100}%` }} />
                </div>
                <div
                    className={cn('flex justify-end text-sm text-muted-foreground', {
                        hidden: haveAnswered
                    })}
                >
                    ⏱️ Time Left: <span className={cn('ml-1 font-bold', seconds <= 10 ? 'text-red-500' : '')}>{seconds}s</span>
                </div>
            </div>

            {/* ℹ️ Info Panel */}
            <Collapsible className="w-full" open={open}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 card-gradient gap-1 p-4">
                    <CardHeader className="m-0 p-2">
                        <CollapsibleTrigger onClick={() => setOpen(!open)} className="w-full flex justify-between items-center group">
                            <CardTitle className="flex items-center text-xl gradient-text">
                                <span className="font-semibold">Information</span>
                            </CardTitle>
                            <ChevronDown className="h-8 w-8 transition-transform duration-300 group-data-[state=open]:rotate-180 mr-3 text-brand/70" />
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <p className="text-lg leading-relaxed">{current?.question}</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">{current?.answer}</p>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* ❓ Quiz Panel */}
            <Collapsible className="w-full" open={!open}>
                <Card className="backdrop-blur-sm bg-card/50 border-0 card-gradient gap-1 p-4">
                    <CardHeader className="m-0 p-2">
                        <CollapsibleTrigger onClick={() => setOpen(!open)} className="w-full flex justify-between items-center group">
                            <CardTitle className="flex items-center text-xl gradient-text">
                                <span className="font-semibold">Question?</span>
                            </CardTitle>
                            <ChevronDown className="h-8 w-8 transition-transform duration-300 group-data-[state=open]:rotate-180 mr-3 text-brand/70" />
                        </CollapsibleTrigger>
                    </CardHeader>
                    <CollapsibleContent>
                        <div>
                            <p className="text-lg leading-relaxed mb-4">{current?.quizQuestion}</p>
                            <RadioGroup value={selected} onValueChange={(e) => setSelected(e)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {current?.choices?.map((opt) => {
                                    const isChecked = selected === opt.id.toString()
                                    const answered = Object.keys(data ?? {})?.length > 0
                                    const isSelected = isChecked && !answered
                                    const isTrue =
                                        (Object.keys(opt?.userResponses?.[0] ?? {})?.length && opt?.userResponses?.[0]?.isCorrect) ||
                                        opt?.isCorrect ||
                                        data?.correctChoiceId === opt.id ||
                                        (isChecked && answered && data?.isCorrect)
                                    const isWrong =
                                        (Object.keys(opt?.userResponses?.[0] ?? {})?.length && !opt?.userResponses?.[0]?.isCorrect) ||
                                        (isChecked && answered && !data?.isCorrect)

                                    return (
                                        <div key={opt.id}>
                                            <RadioGroupItem id={opt.id.toString()} value={opt.id.toString()} className="peer hidden" />
                                            <Label
                                                htmlFor={opt.id.toString()}
                                                className={cn('block w-full p-4 border rounded-xl cursor-pointer transition-all', 'hover:bg-muted/50', {
                                                    'border border-brand bg-brand/10 text-brand': isSelected,
                                                    'border-green-500 bg-green-100 text-green-700': isTrue,
                                                    'border-red-500 bg-red-100 text-red-700': isWrong
                                                })}
                                            >
                                                {opt.text}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>

                            <div className="mt-4">
                                <Button
                                    disabled={(checkIsLoading || !selected) && !haveAnswered}
                                    onClick={() => {
                                        if (currentQuiz + 1 === quizzes?.length && (Object.keys(data ?? {})?.length || haveAnswered)) {
                                            handleSubmit()
                                        } else {
                                            if (Object.keys(data ?? {})?.length || haveAnswered) {
                                                handleNext()
                                            } else {
                                                handleCheck()
                                            }
                                        }
                                    }}
                                    className="w-full"
                                >
                                    {checkIsLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : currentQuiz + 1 === quizzes?.length && (Object.keys(data ?? {})?.length || haveAnswered) ? (
                                        'Submit Quiz'
                                    ) : Object.keys(data ?? {})?.length || haveAnswered ? (
                                        'Next Question'
                                    ) : (
                                        'Check Answer'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* 🎉 Success Modal */}
            <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                <DialogContent className="text-center">
                    <DialogHeader>
                        <DialogTitle className="text-green-600 text-2xl flex flex-col items-center">
                            🎉 Correct Answer!
                            <Sparkles className="h-8 w-8 mt-2 text-green-500" />
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-muted-foreground mt-2">You’ve earned</p>
                    <div className="text-4xl font-bold text-brand mt-1">+{data?.pointsAwarded ?? 0} XP</div>
                    <Button
                        onClick={() => {
                            if (currentQuiz + 1 === quizzes?.length && (Object.keys(data ?? {})?.length || haveAnswered)) {
                                handleSubmit()
                            } else {
                                handleNext()
                            }
                        }}
                        className="mt-6 w-full"
                    >
                        Continue
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface StartQuizProps {
    onStart: () => void
}

const StartQuiz: React.FC<StartQuizProps> = ({ onStart }) => {
    return (
        <motion.div
            className="flex items-center justify-center  p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-purple-700">Ready to Begin?</CardTitle>
                    <CardDescription className="mt-2">
                        You have <span className="font-semibold ">25 seconds</span> to read the content and answer. <br />
                        After that, points will gradually decrease over the next <span className="font-semibold">20 seconds</span>. <br />
                        If the bar runs out, you'll earn only <span className="text-red-500 font-semibold">25%</span> of the total possible points.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4 mt-1">
                    <p className="text-center text-lg font-medium">Are you ready?</p>

                    <div className="flex justify-center gap-4">
                        <Button onClick={onStart} className="gap-2 btn-gradient">
                            Start
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}

interface EndedQuizProps {
    result: TQuizFinishResult | undefined
    loading: boolean
}

const ResultItem = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value?: number; color: string }) => (
    <div className="flex items-center gap-4 bg-muted/50 rounded-xl p-4 w-full">
        <div className={`bg-${color}-100 text-${color}-600 p-2 rounded-full`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <motion.p
                className="text-lg font-semibold text-foreground"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {value}
            </motion.p>
        </div>
    </div>
)

const EndedQuiz: React.FC<EndedQuizProps> = ({ result, loading }) => {
    return (
        <motion.div className="flex items-center justify-center  p-4 " initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {loading ? (
                <div className="w-full h-[40vh] flex items-center justify-center">
                    <Loader size={40} className="animate-spin" />
                </div>
            ) : (
                <Card className="w-full max-w-xl rounded-2xl shadow-xl border-0">
                    <CardHeader className="text-center">
                        <Trophy className="w-10 h-10 mx-auto text-yellow-500" />
                        <CardTitle className="text-2xl font-bold mt-2 text-purple-700">Quiz Completed 🎉</CardTitle>
                        <p className="text-muted-foreground mt-1">Here’s how you did:</p>
                    </CardHeader>

                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                        <ResultItem icon={Star} label="Total Points" value={result?.totalPoints} color="yellow" />
                        <ResultItem icon={Trophy} label="Raffles Earned" value={result?.rafflesEarned} color="violet" />
                        <ResultItem icon={CheckCircle} label="Correct Answers" value={result?.correctAnswers} color="green" />
                        <ResultItem icon={HelpCircle} label="Total Questions" value={result?.totalQuestions} color="blue" />
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full cursor-pointer">EARN BY DOING QUESTS</Button>
                        <Link href={ROUTES.HOME} key={1} scroll={false} className="w-full">
                            <Button className="cursor-pointer w-full btn-gradient">EXPLORE MORE ACADEMIES</Button>
                        </Link>
                    </CardFooter>
                </Card>
            )}
        </motion.div>
    )
}
