'use client'
import * as React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Card, CardHeader, CardTitle } from './ui/card'
import { ChevronDown, Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQuizzesQuery } from '@/store/api/quiz.api'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { TQuiz } from '@/types/quiz'

interface TQuizProps {}

export function Quiz({}: TQuizProps) {
    const params = useParams()
    const id = params.academyId
    const [open, setOpen] = React.useState(true)
    const { currentData: quizzes, isLoading, isFetching } = useQuizzesQuery({ academyId: id as string }, { skip: !id })

    const [selected, setSelected] = React.useState('')
    const [status, setStatus] = React.useState<'idle' | 'loading' | 'checked'>('idle')
    const [isCorrect, setIsCorrect] = React.useState(false)

    const correctAnswer = 'option-two'

    const options = [
        { value: 'option-one', label: 'Option One' },
        { value: 'option-two', label: 'Option Two' },
        { value: 'option-three', label: 'Option Three' },
        { value: 'option-four', label: 'Option Four' }
    ]

    const handleCheck = () => {
        if (!selected) return
        setStatus('loading')
        setTimeout(() => {
            setIsCorrect(selected === correctAnswer)
            setStatus('checked')
        }, 1500)
    }

    const handleNext = () => {
        setSelected('')
        setStatus('idle')
        setIsCorrect(false)
    }

    return (
        <div className="space-y-4">
            {/* Info */}
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
                        <p className="text-lg leading-relaxed">Moonshot is a Telegram sniping bot to snipe memecoin launches</p>
                        <p className="text-muted-foreground leading-relaxed mt-1">Moonshot is an app that simplifies buying and selling memecoins...</p>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Question */}
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
                            <p className="text-lg leading-relaxed mb-4">What does the protocol do?</p>
                            <RadioGroup
                                value={selected}
                                onValueChange={status === 'idle' ? setSelected : () => {}}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                                {options.map((opt) => {
                                    const isChecked = selected === opt.value
                                    const isCorrectAnswer = opt.value === correctAnswer
                                    const isWrongSelected = isChecked && !isCorrect && status === 'checked'
                                    const isRightSelected = isChecked && isCorrect && status === 'checked'
                                    const showCorrectBorder = status === 'checked' && isCorrectAnswer

                                    return (
                                        <div key={opt.value}>
                                            <RadioGroupItem id={opt.value} value={opt.value} className="peer hidden" />
                                            <Label
                                                htmlFor={opt.value}
                                                className={cn('block w-full p-4 border rounded-xl cursor-pointer transition-all', 'hover:bg-muted/50', {
                                                    // Show gradient only when selected and not yet checked
                                                    'border border-brand bg-brand/10 text-brand': selected === opt.value && status === 'idle',

                                                    // After checking
                                                    'border-green-500 bg-green-100 text-green-700': status === 'checked' && opt.value === correctAnswer,
                                                    'border-red-500 bg-red-100 text-red-700':
                                                        status === 'checked' && selected === opt.value && selected !== correctAnswer
                                                })}
                                            >
                                                {opt.label}
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>

                            <div className="mt-4">
                                <Button
                                    disabled={status === 'loading' || !selected}
                                    onClick={status === 'checked' ? handleNext : handleCheck}
                                    className="w-full"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Checking...
                                        </>
                                    ) : status === 'checked' ? (
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
        </div>
    )
}
