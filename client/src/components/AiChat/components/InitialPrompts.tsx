// client/src/components/AiChat/components/InitialPrompts.tsx
import React from 'react'
import { IconCoinBitcoin, IconWallet, IconCreditCardPay } from '@tabler/icons-react'

interface InitialPromptsProps {
    onSelectPrompt: (promptText: string) => void
}

const InitialPrompts: React.FC<InitialPromptsProps> = ({ onSelectPrompt }) => {
    const prompts = [
        {
            text: 'What is crypto?',
            icon: <IconCoinBitcoin size={18} />
        },
        {
            text: 'How to setup wallet?',
            icon: <IconWallet size={18} />
        },
        {
            text: 'How to do transactions?',
            icon: <IconCreditCardPay size={18} />
        }
    ]

    return (
        <div className="grid text-sm sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-300">
            {prompts.map((e, index) => (
                <div key={index} className={`${index % 2 === 0 ? 'text-right' : 'text-left'} flex flex-col items-center`}>
                    <button
                        onClick={() => onSelectPrompt(e.text)}
                        className="w-full flex items-center justify-center p-2 border-[0.5px] rounded-lg  hover:bg-gradient-to-r from-[#ff0077] to-[#7700ff] hover:text-black hover:border-none"
                    >
                        <div className="mr-2">{e.icon}</div>
                        <span className="truncate" title={e.text}>
                            {e.text}
                        </span>
                    </button>
                </div>
            ))}
        </div>
    )
}

export default InitialPrompts
