import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const buildUrlWithParams = (baseUrl: string, params: { [key: string]: any }): string => {
    const queryParams = new URLSearchParams()

    for (const key in params) {
        const value = params[key]
        if (Array.isArray(value)) {
            value.forEach((item) => queryParams.append(key, item))
        } else {
            queryParams.append(key, value)
        }
    }

    return `${baseUrl}?${queryParams.toString()}`
}

export const constructImageUrl = (url: string | undefined) => {
    return `http://45.76.162.32:5000/${url}`
}

export function removeEmpty(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null))
}
