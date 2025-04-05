'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useChainOptionsQuery } from '@/store/api/chain.api'

type Option = {
    label: string
    value: string
}

interface ChainFilterProps {
    onSelect: (value: Option | null) => void
    defaultValue?: Option
    className?: string
}

export function ChainFilter({ onSelect, defaultValue, className }: ChainFilterProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState<Option | undefined>(defaultValue)
    const [keyword, setKeyword] = React.useState('')
    const [params, setParams] = React.useState({ offset: 0, limit: 10, keyword: '' })

    const { currentData: chainOptions, isLoading, isFetching } = useChainOptionsQuery(params)

    React.useEffect(() => {
        const handler = setTimeout(() => {
            setParams((e) => ({ ...e, keyword: keyword, offset: 0 }))
        }, 500)

        return () => {
            clearTimeout(handler)
        }
    }, [keyword])

    const handleSelect = (chain: Option | null) => {
        setValue(chain ?? undefined)
        if (onSelect) onSelect(chain?.value)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className={cn('w-full md:w-[250px] justify-between', className)}>
                    {value?.label || 'Select chain...'}
                    {isLoading || isFetching ? (
                        <RefreshCw size={16} className="animate-spin ml-auto" />
                    ) : (
                        <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput value={keyword} onValueChange={setKeyword} placeholder="Search chain..." />
                    <CommandList
                        onScroll={(e) => {
                            const target = e.currentTarget
                            if (target.scrollTop + target.clientHeight === target.scrollHeight && chainOptions?.length === params.limit + params.offset) {
                                setParams((prev) => ({ ...prev, offset: prev.offset + prev.limit }))
                            }
                        }}
                    >
                        <CommandEmpty>No Chains found.</CommandEmpty>
                        <CommandGroup>
                            {chainOptions?.map((chain) => {
                                const chainValue = chain.value.toString()
                                const selected = value?.value === chainValue
                                return (
                                    <CommandItem
                                        key={chain.value}
                                        value={chainValue}
                                        onSelect={() => handleSelect(selected ? null : { label: chain.label, value: chainValue })}
                                    >
                                        <Check className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')} />
                                        {chain.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
