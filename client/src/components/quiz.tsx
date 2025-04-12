'use client'
import * as React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Card, CardHeader, CardTitle } from './ui/card'
import { ChevronDown, Loader, Loader2, Sparkles } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQuizzesQuery, useSubmitQuizMutation } from '@/store/api/quiz.api'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { TQuiz } from '@/types/quiz'
import { useAppSelector } from '@/store/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

export function Quiz() {
    const params = useParams()
    const id = params.academyId
    const quizzes = useAppSelector((state) => state.quiz.quizzes)

    const [open, setOpen] = React.useState(true)
    const [currentQuiz, setCurrentQuiz] = React.useState(0)
    const [selected, setSelected] = React.useState<string | undefined>()
    const [seconds, setSeconds] = React.useState(45)
    const [xp, setXp] = React.useState(0)
    const [showSuccessModal, setShowSuccessModal] = React.useState(false)

    const { isLoading } = useQuizzesQuery({ academyId: id as string }, { skip: !id })

    const [checkAnswer, { isSuccess, data, isError, error, isLoading: checkIsLoading, reset }] = useSubmitQuizMutation()

    const handleCheck = async () => {
        if (!selected) return
        await checkAnswer({ choiceId: Number(selected), questionId: quizzes[currentQuiz].id, secondsLeft: seconds })
    }

    const handleNext = () => {
        reset()
        setSelected(undefined)
        setCurrentQuiz((prev) => prev + 1)
        setOpen(true)
        setSeconds(40)
        setShowSuccessModal(false)
    }

    const current = quizzes[currentQuiz]
    const totalQuestions = quizzes.length

    // Timer logic
    React.useEffect(() => {
        const answered = Object.keys(data ?? {})?.length > 0
        if (answered || !selected) return

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    handleCheck()
                    return 0
                }
                return prev - 1
            })
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

    // if (!quizzes?.length) return null

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
                    <div className="h-full bg-brand transition-all duration-300" style={{ width: `${((currentQuiz + 1) / totalQuestions) * 100}%` }} />
                </div>
                <div className="flex justify-end text-sm text-muted-foreground">
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
                                <span className="font-semibold">Question</span>
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

                                    return (
                                        <div key={opt.id}>
                                            <RadioGroupItem id={opt.id.toString()} value={opt.id.toString()} className="peer hidden" />
                                            <Label
                                                htmlFor={opt.id.toString()}
                                                className={cn('block w-full p-4 border rounded-xl cursor-pointer transition-all', 'hover:bg-muted/50', {
                                                    'border border-brand bg-brand/10 text-brand': isChecked && !answered,
                                                    'border-green-500 bg-green-100 text-green-700': answered && data?.isCorrect && isChecked,
                                                    'border-red-500 bg-red-100 text-red-700': answered && !data?.isCorrect && isChecked
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
                                    disabled={checkIsLoading || !selected}
                                    onClick={Object.keys(data ?? {})?.length ? handleNext : handleCheck}
                                    className="w-full"
                                >
                                    {checkIsLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : Object.keys(data ?? {})?.length ? (
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
                    <Button onClick={handleNext} className="mt-6 w-full">
                        Continue
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}
