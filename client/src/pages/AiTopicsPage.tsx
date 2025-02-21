import { useEffect, useRef, useState } from 'react'
import { Page, Preloader, Card } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import axiosInstance from '../api/axiosInstance'
import SearchIcon from '@mui/icons-material/Search'
import NoDataFoundComponent from '~/components/common/NoDataFound'
import { IconArrowsMoveVertical, IconPlus, IconGripVertical } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ReactDOM from 'react-dom'

interface RowInterface {
    id: number
    title: string
    content: string
    order: number
    is_active: boolean
}

function SortableItem({ id, children, disabled }: { id: number; children: React.ReactNode; disabled: boolean }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id, disabled })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: disabled ? 'auto' : 'none'
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...(disabled ? {} : listeners)}>
            {children}
        </div>
    )
}

export default function AiTopicsPage() {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [rows, setRows] = useState<RowInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [offset, setOffset] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [showScrollToTopButton, setShowScrollToTopButton] = useState(false)
    const [reorderMode, setReorderMode] = useState(false)
    const [isFetchingMore, setIsFetchingMore] = useState(false)
    const [globalLoading, setGlobalLoading] = useState(false)
    const [reorderSuccess, setReorderSuccess] = useState(false)
    const [hasReorderChange, setHasReorderChange] = useState(false)

    const navigate = useNavigate()

    const fetchRows = async (reset = false) => {
        if (isFetchingMore || (!hasMore && !reset)) return
        setIsFetchingMore(true)

        try {
            const response = await axiosInstance.get(`/api/ai-topics?limit=20&offset=${reset ? 0 : offset}&keyword=${encodeURIComponent(searchKeyword)}`)
            const newRows = response?.data

            if (reset) {
                setRows(newRows)
                setOffset(newRows?.length)
                setHasMore(newRows?.length > 0)
            } else if (newRows?.length > 0) {
                setRows((prev) => [...prev, ...newRows])
                setOffset((prev) => prev + 20)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('Error fetching ai topics:', error)
        } finally {
            setIsFetchingMore(false)
        }
    }

    useEffect(() => {
        fetchRows(true)
    }, [])

    const handleScroll = () => {
        const container = containerRef.current
        if (!container) return

        const { scrollTop, scrollHeight, clientHeight } = container

        if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !isFetchingMore) {
            fetchRows()
        }

        setShowScrollToTopButton(scrollTop > 100)
    }

    useEffect(() => {
        const container = containerRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll)
            }
        }
    }, [hasMore, isFetchingMore])

    const handleSearch = () => {
        setHasMore(true)
        fetchRows(true)
    }

    const handleAddNew = () => {
        navigate('/ai-topics/add')
    }

    const handleEditTopic = (id: string) => {
        navigate(`/ai-topics/${id}`)
    }

    const handleReorder = async () => {
        setReorderMode(true)
        setLoading(true)
        // Reset any previous reorder change flag
        setHasReorderChange(false)
        try {
            const response = await axiosInstance.get('/api/ai-topics?limit=1000')
            setRows(response.data)
        } catch (error) {
            console.error('Error fetching ai topics for reorder:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveReorder = async () => {
        setGlobalLoading(true)
        try {
            const reorderedIds = rows.map((row) => row.id)
            await axiosInstance.patch('/api/ai-topics/reorder', { topicIds: reorderedIds })
            setReorderMode(false)
            setReorderSuccess(true)
            setHasReorderChange(false)
            fetchRows(true)
            setTimeout(() => {
                setReorderSuccess(false)
            }, 1500)
        } catch (error) {
            console.error('Error saving reordered topics:', error)
        } finally {
            setGlobalLoading(false)
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5 // start drag after the pointer moves 5px
            }
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event: { active: any; over: any }) => {
        const { active, over } = event

        if (active.id !== over.id) {
            setRows((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id)
                const newIndex = items.findIndex((item) => item.id === over.id)
                setHasReorderChange(true)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Main div */}
            <div
                className="relative min-h-screen overflow-y-auto"
                style={{ height: '100vh', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                ref={containerRef}
            >
                <div className="flex flex-col ml-4 mr-4 mt-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border dark:border-gray-600 mb-2">
                    {/* Search */}
                    <div className="flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search topics..."
                            className="flex-grow px-2 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch()
                                }
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            className="ml-4 px-4 py-2 bg-gradient-to-l from-pink-500 to-purple-500 text-white rounded-md shadow hover:opacity-90 disabled:opacity-50 focus:outline-none"
                        >
                            <SearchIcon />
                        </button>
                    </div>
                </div>

                {/* Cards */}
                <div className="relative min-h-screen bg-cosmos-bg bg-fixed bg-center bg-no-repeat bg-cover overflow-y-auto">
                    <div className="relative z-10">
                        {/* Map over rows to display all rows */}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={rows} strategy={verticalListSortingStrategy}>
                                {rows.map((row) => (
                                    <SortableItem key={row.id} id={row.id} disabled={!reorderMode}>
                                        <Card
                                            className="rounded-2xl shadow-lg border dark:border-gray-600 select-none"
                                            style={{ marginBottom: 0, overflow: 'hidden' }}
                                            onClick={() => !reorderMode && handleEditTopic(row.id.toString())}
                                        >
                                            <div className="flex justify-between gap-4">
                                                <div className="text-[14px] font-semibold flex items-center gap-2">
                                                    {reorderMode && <IconGripVertical size={22} />}
                                                    {row.title}
                                                </div>
                                                <div className="flex gap-1 items-center text-[14px] font-semibold">
                                                    <span className={`w-2 h-2 rounded-full ${row.is_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                    {row.is_active ? 'Active' : 'Passive'}
                                                </div>
                                            </div>
                                        </Card>
                                    </SortableItem>
                                ))}
                            </SortableContext>
                        </DndContext>

                        {/* Spinner */}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '20px' }}>
                                <Preloader />
                            </div>
                        )}

                        {/* Inline Spinner */}
                        {isFetchingMore && (
                            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '20px' }}>
                                <Preloader />
                            </div>
                        )}

                        {/* No data */}
                        {!loading && globalLoading && rows?.length === 0 && <NoDataFoundComponent />}
                    </div>
                </div>

                {/* Reorder & Add new buttons */}
                {!reorderMode ? (
                    <div className="flex items-center justify-center gap-4 fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                        <button
                            onClick={handleReorder}
                            className="w-12 h-12 flex items-center justify-center bg-gradient-to-l from-blue-500 to-blue-700 rounded-full shadow hover:opacity-90 focus:outline-none"
                        >
                            <IconArrowsMoveVertical />
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="w-12 h-12 flex items-center justify-center bg-gradient-to-l from-pink-500 to-purple-500 rounded-full shadow hover:opacity-90 focus:outline-none"
                        >
                            <IconPlus />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-4 fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
                        <button
                            onClick={() => setReorderMode(false)}
                            className="px-4 py-2 w-24 bg-gray-500 text-white rounded-full shadow hover:opacity-90 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveReorder}
                            disabled={!hasReorderChange}
                            className={`px-4 py-2 w-24 bg-gradient-to-l from-green-500 to-green-700 text-white rounded-full shadow hover:opacity-90 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            Save
                        </button>
                    </div>
                )}

                {/* Move to Top Button */}
                {showScrollToTopButton && (
                    <button
                        onClick={() => {
                            if (containerRef.current) {
                                containerRef.current.scrollTo({ top: 0, behavior: 'smooth' })
                            }
                        }}
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            backgroundColor: '#5d6670',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            cursor: 'pointer',
                            zIndex: 1000,
                            fontSize: '20px'
                        }}
                    >
                        ↑
                    </button>
                )}
            </div>

            {globalLoading ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <Preloader />
                </div>
            ) : loading ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <Preloader />
                </div>
            ) : null}

            {reorderSuccess &&
                ReactDOM.createPortal(
                    <>
                        <style>{`
                            @keyframes popUpCombined {
                                0% { transform: scale(0.8); opacity: 0; }
                                60% { transform: scale(1.1); opacity: 1; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                        `}</style>
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            <div
                                className="rounded-xl p-[1.5px] bg-gradient-to-r from-[#ff0077] to-[#7700ff] max-w-xs w-full shadow-lg"
                                style={{ animation: 'popUpCombined 0.5s ease-out forwards' }}
                            >
                                <div className="bg-gray-800 text-white p-6 rounded-xl text-center">
                                    <svg
                                        className="w-16 h-16 mx-auto"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12l5 5L20 7" />
                                    </svg>
                                    <p className="mt-4 text-center text-lg">Order updated successfully!</p>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
        </Page>
    )
}
