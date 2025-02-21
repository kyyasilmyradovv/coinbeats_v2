import { useEffect, useRef, useState } from 'react'
import { Page, Preloader } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '~/api/axiosInstance'

interface Academy {
    id: number
    name: string
}

export default function AddAiTopicPage() {
    const [title, setTitle] = useState('')
    const [context, setContext] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchAcademies, setSearchAcademies] = useState('')
    const [academies, setAcademies] = useState<Academy[]>([])
    const [selectedAcademies, setSelectedAcademies] = useState<Academy[]>([])
    const attachAcademiesRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (searchAcademies.trim() === '') {
            setAcademies([])
            return
        }
        const delayDebounceFn = setTimeout(() => {
            axiosInstance
                .get(`/api/ai-topics/academies?keyword=${encodeURIComponent(searchAcademies)}&limit=6`)
                .then((response) => {
                    setAcademies(response.data)
                })
                .catch((error) => console.error('Error searching academies', error))
        }, 500)
        return () => clearTimeout(delayDebounceFn)
    }, [searchAcademies])

    // Close dropdown if clicked outside attached academies container
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (attachAcademiesRef.current && !attachAcademiesRef.current.contains(e.target as Node)) {
                setAcademies([])
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSelectAcademy = (academy: Academy) => {
        if (!selectedAcademies.find((a) => a.id === academy.id)) {
            setSelectedAcademies((prev) => [...prev, academy])
        }
        setSearchAcademies('')
        setAcademies([])
    }

    const handleRemoveAcademy = (id: number) => {
        setSelectedAcademies((prev) => prev.filter((a) => a.id !== id))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            await axiosInstance.post('/api/ai-topics', {
                title,
                context,
                is_active: isActive,
                academyIds: selectedAcademies.map((academy) => academy.id)
            })
            navigate('/ai-topics') // Redirect to ai-topics page after successful creation
        } catch (err) {
            console.error('Error adding topic:', err)
            setError('Error adding topic. Please try again.')
            setTimeout(() => setError(''), 4000)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Page style={{ scrollbarColor: '#555 #333', scrollbarWidth: 'thin' }}>
            <Navbar />
            <Sidebar />
            <div className="p-4 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2 text-center">Add New AI Topic</h1>
                {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded text-center">{error}</div>}
                {2 > 2 && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded text-center">Topic added successfully!</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter topic title"
                            className="bg-transparent w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Context <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Enter topic context"
                            className="bg-transparent w-full px-3 py-2 min-h-[280px] border rounded focus:outline-none focus:ring"
                            style={{ scrollbarColor: '#555 #333', scrollbarWidth: 'thin' }}
                            required
                        />
                    </div>
                    {/* Attach Academies Input */}
                    <div ref={attachAcademiesRef} className="relative">
                        <label className="block text-sm font-medium mb-1">Attached Academies</label>
                        <div className="flex flex-wrap gap-2 border rounded p-2">
                            {selectedAcademies.map((academy) => (
                                <div key={academy.id} className="flex items-center gap-1 px-2 py-1 border border-gray-400 rounded">
                                    <span className="text-sm">{academy.name}</span>
                                    <button type="button" onClick={() => handleRemoveAcademy(academy.id)} className="text-xs text-red-500">
                                        &times;
                                    </button>
                                </div>
                            ))}
                            <input
                                type="text"
                                value={searchAcademies}
                                onChange={(e) => setSearchAcademies(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && searchAcademies === '' && selectedAcademies.length > 0) {
                                        setSelectedAcademies((prev) => prev.slice(0, prev.length - 1))
                                    }
                                }}
                                placeholder="Search academies..."
                                className="bg-transparent flex-grow outline-none"
                            />
                        </div>
                        {/* Dropdown results */}
                        {academies.length > 0 && (
                            <div className="bg-black border border-gray-300 rounded mt-1 absolute left-0 right-0 z-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                                {academies.map((academy) => (
                                    <div key={academy.id} onClick={() => handleSelectAcademy(academy)} className="px-3 py-2 hover:bg-gray-500 cursor-pointer">
                                        {academy.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="activeCheckbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="mr-2 w-4 h-4 "
                        />
                        <label htmlFor="activeCheckbox">Active</label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-l from-pink-500 to-purple-500 text-white rounded-full shadow hover:opacity-90 focus:outline-none"
                    >
                        Add Topic
                    </button>
                </form>
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <Preloader />
                </div>
            )}
        </Page>
    )
}
