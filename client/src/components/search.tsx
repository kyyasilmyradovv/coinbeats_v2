import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils' // if you're using className merging utility

interface SearchBarProps {
    onSearch: (value: string) => void
}
export function SearchBar({ onSearch }: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<string>('')

    useEffect(() => {
        const handler = setTimeout(() => {
            if (onSearch) onSearch(value)
        }, 500)

        return () => {
            clearTimeout(handler)
        }
    }, [value])

    // Focus input when shortcut is pressed
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC')
            if ((isMac && e.metaKey && e.key === 'k') || (!isMac && e.ctrlKey && e.key === 'k')) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
                onChange={(e) => {
                    setValue(e.target.value)
                }}
                value={value}
                ref={inputRef}
                // type="search"
                placeholder="Search..."
                className={cn('pl-10 pr-20')} // Adjust padding for icon + shortcut
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">⌘ K</kbd>
        </div>
    )
}
