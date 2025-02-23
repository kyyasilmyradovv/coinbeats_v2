import React, { useRef, useEffect } from 'react'
import Typewriter from 'typewriter-effect'

export interface TypeWriterProps {
    text: string
    speed?: number
    className?: string
    onStart?: () => void
    onDone?: () => void
}

const TypeWriter: React.FC<TypeWriterProps> = ({ text, speed = 1, className = '', onStart, onDone }) => {
    const typewriterRef = useRef<any>(null)

    return (
        <div className={className}>
            <Typewriter
                options={{
                    delay: speed,
                    cursor: '',
                    autoStart: true,
                    loop: false
                }}
                onInit={(typewriter) => {
                    typewriterRef.current = typewriter
                    typewriter
                        .callFunction(() => {
                            if (onStart) onStart()
                        })
                        .typeString(text)
                        .callFunction(() => {
                            if (onDone) onDone()
                        })
                        .start()
                }}
            />
        </div>
    )
}

export default TypeWriter
