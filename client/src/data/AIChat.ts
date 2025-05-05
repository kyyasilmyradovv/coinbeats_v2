export type TAIChatInitial = {
    main: string
    secondary: string
    initialPrompts: string[]
}

export const AIChatInitial: TAIChatInitial = {
    main: 'What can I help with?',
    secondary: 'Chat with Coinbeats AI',
    initialPrompts: [
        'What is crypto?',
        'How to setup wallet?',
        'How to do transactions?',
        'Explain DeFi in simple terms',
        'What are NFTs?',
        'How to stay safe from crypto scams?',
        'What is Bitcoin halving?'
    ]
}
