import { useEffect, useRef, useState } from 'react'
import { Page, Preloader } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '~/api/axiosInstance'
import ReactDOM from 'react-dom'

interface Academy {
    id: number
    name: string
}

export default function EditAiTopicPage() {
    const [title, setTitle] = useState('')
    const [context, setContext] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchAcademies, setSearchAcademies] = useState('')
    const [academies, setAcademies] = useState<Academy[]>([])
    const [selectedAcademies, setSelectedAcademies] = useState<Academy[]>([])
    const [createdAt, setCreatedAt] = useState('')
    const [updatedAt, setUpdatedAt] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
    const attachAcademiesRef = useRef<HTMLDivElement>(null)
    const modalRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const topicId = parseInt(window.location.pathname.split('/').pop() || '', 10)
        if (topicId) {
            setLoading(true)
            axiosInstance
                .get(`/api/ai-topics/${topicId}`)
                .then((response) => {
                    const data = response.data
                    setTitle(data.title)
                    setContext(data.context)
                    setIsActive(data.is_active)
                    setSelectedAcademies(data.academies)
                    setCreatedAt(data.created_at)
                    setUpdatedAt(data.updated_at)
                })
                .catch((error) => {
                    console.error('Error fetching topic:', error)
                    setError('Error fetching topic. Please try again.')
                })
                .finally(() => {
                    setLoading(false)
                })
        }
    }, [])

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

    useEffect(() => {
        if (showDeleteModal) {
            const handleClickOutside = (event: MouseEvent) => {
                if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                    setShowDeleteModal(false)
                }
            }
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDeleteModal])

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const topicId = parseInt(window.location.pathname.split('/').pop() || '', 10)
            await axiosInstance.put(`/api/ai-topics/${topicId}`, {
                title,
                context,
                is_active: isActive,
                academyIds: selectedAcademies.map((academy) => academy.id)
            })
            navigate('/ai-topics')
        } catch (err) {
            console.error('Error updating topic:', err)
            setError('Error updating topic. Please try again.')
            setTimeout(() => setError(''), 4000)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        const topicId = parseInt(window.location.pathname.split('/').pop() || '', 10)
        try {
            await axiosInstance.delete(`/api/ai-topics/${topicId}`)
            setShowDeleteSuccess(true)
            setTimeout(() => {
                setShowDeleteSuccess(false)
                navigate('/ai-topics')
            }, 1000)
        } catch (err) {
            console.error('Error deleting topic:', err)
            setError('Error deleting topic. Please try again.')
            setTimeout(() => setError(''), 4000)
        }
    }

    return (
        <Page style={{ scrollbarColor: '#555 #333', scrollbarWidth: 'thin' }}>
            <Navbar />
            <Sidebar />

            <div className="p-4 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-2 text-center">Edit AI Topic</h1>
                {error && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded text-center">{error}</div>}
                <form onSubmit={handleSave} className="flex flex-col gap-4">
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

                    <div className="flex gap-3 items-center justify-between">
                        <span className="text-md truncate">
                            Created: {new Date(createdAt).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
                        </span>
                        <span className="text-md truncate">
                            Updated: {new Date(updatedAt).toLocaleDateString(undefined, { year: '2-digit', month: '2-digit', day: '2-digit' })}
                        </span>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="activeCheckbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="mr-2 w-4 h-4"
                            />
                            <label htmlFor="activeCheckbox">Active</label>
                        </div>
                    </div>

                    <div className="flex gap-[5%]">
                        <button
                            type="button"
                            className="w-[30%] px-4 py-2 bg-red-500 rounded-full shadow hover:opacity-90 focus:outline-none"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            Delete
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[30%] px-4 py-2 bg-gradient-to-l from-pink-500 to-purple-500 rounded-full shadow hover:opacity-90 focus:outline-none"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-[30%] px-4 py-2 bg-gray-500 rounded-full shadow hover:opacity-90 focus:outline-none"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                        <div ref={modalRef} className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg">
                            <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                <p className="mb-4">Once deleted, the topic can't be restored. Are you sure you want to delete?</p>
                                <div className="flex justify-center gap-4">
                                    <button className="px-4 py-2 rounded hover:bg-gray-300 text-gray-800 bg-gray-200" onClick={() => setShowDeleteModal(false)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={async () => {
                                            setShowDeleteModal(false)
                                            setLoading(true)
                                            await handleDelete()
                                            setLoading(false)
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* Delete Success Modal */}
            {showDeleteSuccess &&
                ReactDOM.createPortal(
                    <>
                        <style>{`@keyframes trashPop {
                            0% { transform: scale(0); opacity: 0; }
                            50% { transform: scale(1.2); opacity: 1; }
                            100% { transform: scale(1); opacity: 1; }
                        }`}</style>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg">
                                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                    <svg
                                        className="w-20 h-20 mx-auto stroke-red-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ animation: 'trashPop 0.5s ease-out forwards' }}
                                    >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v6" />
                                        <path d="M14 11v6" />
                                        <path d="M9 6V4h6v2" />
                                    </svg>
                                    <span className="mt-4 block text-lg font-bold">Topic deleted!</span>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <Preloader />
                </div>
            )}
        </Page>
    )
}
