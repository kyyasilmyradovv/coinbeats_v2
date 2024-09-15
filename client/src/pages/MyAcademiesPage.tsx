import React, { useEffect, useState } from 'react'
import { Page, Button, Popover, List, ListButton, Notification, BlockTitle, Block, Card } from 'konsta/react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icon } from '@iconify/react'
import axios from '../api/axiosInstance'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import bunnyLogo from '../images/bunny-mascot.png'

interface Academy {
    id: number
    name: string
    createdAt: string
    status: string
    logoUrl: string
    coverPhotoUrl: string
}

const constructImageUrl = (url: string) => {
    return `https://subscribes.lt/${url}`
}

const MyAcademiesPage: React.FC = () => {
    const [academies, setAcademies] = useState<Academy[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [selectedAcademyId, setSelectedAcademyId] = useState<number | null>(null)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const fetchAcademies = async () => {
            try {
                const response = await axios.get('/api/academies/my')
                console.log('Academies:', response.data)
                setAcademies(response.data)
            } catch (error) {
                console.error('Error fetching academies:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAcademies()
    }, [])

    useEffect(() => {
        if (location.state?.notificationType) {
            setNotificationText(
                location.state.notificationType === 'basic'
                    ? 'Academy created successfully. Your academy is under review.'
                    : 'Your academy is under review. You will get a notification soon.'
            )
            setNotificationOpen(true)
            window.history.replaceState({}, document.title)
        }
    }, [location.state])

    // Open popover and set selected academy ID
    const openPopover = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('Opening popover for academy with ID:', id)
        setSelectedAcademyId(id) // Ensure the correct academy ID is selected
        setPopoverTarget(event.currentTarget)
        setPopoverOpen(true)
    }

    // Handle action click and ensure the right academy is used
    const handleActionClick = (action: () => void) => {
        if (selectedAcademyId !== null) {
            console.log('Executing action for academy with ID:', selectedAcademyId)
            action() // Execute the action associated with the selected academy
            setPopoverOpen(false)
        } else {
            console.log('No academy selected, unable to execute action')
        }
    }

    const handleDeleteAcademy = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
        console.log('Preparing to delete academy with ID:', id)
        setSelectedAcademyId(id)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteAcademy = async () => {
        if (selectedAcademyId !== null) {
            try {
                console.log('Deleting academy with ID:', selectedAcademyId)
                await axios.delete(`/api/academies/${selectedAcademyId}`)
                setAcademies(academies.filter((academy) => academy.id !== selectedAcademyId))
                setNotificationText('Academy deleted successfully.')
                setNotificationOpen(true)
            } catch (error) {
                console.error('Error deleting academy:', error)
                setNotificationText('Failed to delete academy.')
                setNotificationOpen(true)
            } finally {
                setConfirmDeleteOpen(false)
                setSelectedAcademyId(null)
            }
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-green-600'
            case 'rejected':
                return 'text-red-600'
            default:
                return 'text-yellow-600'
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center absolute top-8 !mb-18">
                <BlockTitle large>My Academies</BlockTitle>
            </div>

            <div className="mt-18">
                {loading ? (
                    <Spinner />
                ) : academies.length > 0 ? (
                    academies.map((academy) => (
                        <Block key={academy.id}>
                            <Card
                                className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600"
                                style={{
                                    backgroundImage: `url(${constructImageUrl(academy.coverPhotoUrl)})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {/* Background overlay for image */}
                                <div className="absolute inset-0 bg-white dark:bg-black opacity-50 rounded-xl z-0"></div>

                                {/* Content goes here, with a higher z-index to be above the overlay */}
                                <div className="relative z-10 p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2">{academy.name}</h3>
                                            <p className="text-sm">Created on: {new Date(academy.createdAt).toLocaleDateString()}</p>
                                            <p className={`text-sm mt-1 ${getStatusClass(academy.status)}`}>
                                                Status: {academy.status.charAt(0).toUpperCase() + academy.status.slice(1)}
                                            </p>
                                        </div>
                                        <img alt={academy.name} className="h-16 w-16 rounded-full" src={constructImageUrl(academy.logoUrl)} />
                                    </div>
                                </div>

                                {/* Button section, also above the overlay */}
                                <div className="flex justify-center w-full relative z-10">
                                    <Button
                                        key={`academy-${academy.id}`} // Unique key to ensure each button is unique
                                        className="rounded-full items-center justify-center"
                                        raised
                                        onClick={(e) => openPopover(academy.id, e)} // Ensure correct academy is passed
                                    >
                                        Academy Actions <Icon icon="mdi:menu-down" className="w-9 h-9 mb-1" />
                                    </Button>
                                </div>

                                <Popover
                                    opened={popoverOpen}
                                    target={popoverTarget}
                                    onBackdropClick={() => setPopoverOpen(false)}
                                    onClose={() => setPopoverOpen(false)}
                                    angle
                                >
                                    <div className="text-center">
                                        <List>
                                            <ListButton onClick={() => handleActionClick(() => navigate(`/edit-academy/${selectedAcademyId}`))}>
                                                <span className="text-primary text-lg">Edit Academy</span>
                                            </ListButton>
                                            <ListButton onClick={() => handleActionClick(() => navigate(`/add-video-lessons/${selectedAcademyId}`))}>
                                                <span className="text-primary text-lg">Add Video Lessons</span>
                                            </ListButton>
                                            <ListButton onClick={() => handleActionClick(() => navigate(`/add-raffles/${selectedAcademyId}`))}>
                                                <span className="text-primary text-lg">Add Raffles</span>
                                            </ListButton>
                                            <ListButton onClick={() => handleActionClick(() => navigate(`/add-tasks/${selectedAcademyId}`))}>
                                                <span className="text-primary text-lg">Add Tasks</span>
                                            </ListButton>
                                            <ListButton onClick={() => handleActionClick(() => navigate(`/allocate-xp/${selectedAcademyId}`))}>
                                                <span className="text-primary text-lg">Allocate XP</span>
                                            </ListButton>
                                            <ListButton
                                                className="!text-red-600"
                                                onClick={(e) => {
                                                    setPopoverOpen(false)
                                                    handleDeleteAcademy(selectedAcademyId!, e)
                                                }}
                                            >
                                                <span className="text-red-500 text-lg">Delete Academy</span>
                                            </ListButton>
                                        </List>
                                    </div>
                                </Popover>
                            </Card>
                        </Block>
                    ))
                ) : (
                    <p className="mx-4 text-center">No academies found. Start by creating an academy.</p>
                )}
            </div>

            <Notification
                className="fixed top-0 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Message from Coinbeats Bunny"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />

            <Popover
                opened={confirmDeleteOpen}
                target={popoverTarget}
                onBackdropClick={() => setConfirmDeleteOpen(false)}
                onClose={() => setConfirmDeleteOpen(false)}
                angle
            >
                <Block className="text-center">
                    <h3 className="text-lg font-bold mb-4">Delete Academy</h3>
                    <p className="mb-4">Are you sure you want to delete your academy? This action is irreversible!</p>
                    <div className="flex">
                        <Button onClick={confirmDeleteAcademy} className="bg-red-600 rounded-full mr-2 !text-xs">
                            Yes, I'm sure
                        </Button>
                        <Button onClick={() => setConfirmDeleteOpen(false)} className="bg-gray-400 rounded-full !text-xs">
                            No, cancel
                        </Button>
                    </div>
                </Block>
            </Popover>
        </Page>
    )
}

export default MyAcademiesPage
