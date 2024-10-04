// src/pages/AcademyManagementPage.tsx

import React, { useEffect, useState, useRef } from 'react'
import axios from '../api/axiosInstance'
import { Page, Block, BlockTitle, Card, Button, List, Popover, Dialog } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import { MoreHoriz } from '@mui/icons-material'

const AcademyManagementPage: React.FC = () => {
    const [academies, setAcademies] = useState<any[]>([])
    const [showPopover, setShowPopover] = useState<{ [key: number]: boolean }>({})
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
        [key: number]: boolean
    }>({})
    const popoverTargetRef = useRef<HTMLElement | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchAcademies = async () => {
            try {
                const response = await axios.get('/api/academies')
                const data = Array.isArray(response.data) ? response.data : []
                setAcademies(data)
            } catch (error) {
                console.error('Error fetching academies:', error)
            }
        }

        fetchAcademies()
    }, [])

    const handleDeleteAcademy = async (academyId: number) => {
        try {
            await axios.delete(`/api/academies/${academyId}`)
            setAcademies(academies.filter((academy) => academy.id !== academyId))
        } catch (error) {
            console.error('Error deleting academy:', error)
        }
    }

    const handleEditAcademy = (academy: any) => {
        navigate(`/academy/${academy.id}`) // Use academy ID for navigation
    }

    const togglePopover = (academyId: number, ref: HTMLElement) => {
        popoverTargetRef.current = ref
        setShowPopover((prev) => ({ ...prev, [academyId]: !prev[academyId] }))
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center top-8 mb-10">
                <BlockTitle large className="text-3xl font-bold">
                    Academy Management
                </BlockTitle>
            </div>

            <Block>
                <List>
                    {academies.map((academy) => (
                        <div key={academy.id}>
                            <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                                <div className="cursor-pointer p-4" onClick={() => navigate(`/academy/${academy.id}`)}>
                                    <div className="font-bold text-lg mb-2">{academy.name}</div>
                                    <div className="space-y-1">
                                        <div>
                                            <span className="font-semibold">Creator:</span>{' '}
                                            <span
                                                className="font-bold text-blue-500 underline cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/user/${academy.creator.id}`)
                                                }}
                                            >
                                                {academy.creator.name} ({academy.creator.email})
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Status:</span> <span className="font-bold">{academy.status}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">XP:</span> <span className="font-bold">{academy.xp}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Created At:</span>{' '}
                                            <span className="font-bold">{new Date(academy.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Sponsored:</span>{' '}
                                            <span className="font-bold">{academy.sponsored ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Academy Type:</span>{' '}
                                            <span className="font-bold">{academy.academyType ? academy.academyType.name : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            togglePopover(academy.id, e.currentTarget)
                                        }}
                                        className="text-white p-1 rounded-full !w-8"
                                    >
                                        <MoreHoriz />
                                    </Button>
                                </div>
                                <Popover
                                    opened={showPopover[academy.id] || false}
                                    target={popoverTargetRef.current}
                                    onBackdropClick={() => togglePopover(academy.id, popoverTargetRef.current!)}
                                    angle={false}
                                    position="left"
                                    size="w-80"
                                    className="flex items-center justify-center"
                                >
                                    <div className="flex flex-col space-y-2 p-4">
                                        <Button onClick={() => handleEditAcademy(academy)} className="bg-blue-500 text-white rounded-full">
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowDeleteConfirmation((prev) => ({
                                                    ...prev,
                                                    [academy.id]: true
                                                }))
                                                setShowPopover((prev) => ({
                                                    ...prev,
                                                    [academy.id]: false
                                                }))
                                            }}
                                            className="bg-red-500 text-white rounded-full"
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await axios.post(`/api/academies/${academy.id}/approve`)
                                                    setAcademies((prev) => prev.map((a) => (a.id === academy.id ? { ...a, status: 'approved' } : a)))
                                                    setShowPopover((prev) => ({
                                                        ...prev,
                                                        [academy.id]: false
                                                    }))
                                                } catch (error) {
                                                    console.error('Error approving academy:', error)
                                                }
                                            }}
                                            className="bg-green-500 text-white rounded-full"
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </Popover>
                            </Card>
                            {/* Delete Confirmation Dialog */}
                            {showDeleteConfirmation[academy.id] && (
                                <Dialog
                                    opened={showDeleteConfirmation[academy.id]}
                                    onBackdropClick={() =>
                                        setShowDeleteConfirmation((prev) => ({
                                            ...prev,
                                            [academy.id]: false
                                        }))
                                    }
                                >
                                    <div className="text-center p-4">
                                        <p>Are you sure you want to delete the academy?</p>
                                        <div className="flex justify-around mt-4">
                                            <Button
                                                onClick={() =>
                                                    setShowDeleteConfirmation((prev) => ({
                                                        ...prev,
                                                        [academy.id]: false
                                                    }))
                                                }
                                                className="bg-gray-500 text-white rounded-full"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleDeleteAcademy(academy.id)
                                                    setShowDeleteConfirmation((prev) => ({
                                                        ...prev,
                                                        [academy.id]: false
                                                    }))
                                                }}
                                                className="bg-red-500 text-white rounded-full"
                                            >
                                                Confirm
                                            </Button>
                                        </div>
                                    </div>
                                </Dialog>
                            )}
                        </div>
                    ))}
                </List>
            </Block>
        </Page>
    )
}

export default AcademyManagementPage
