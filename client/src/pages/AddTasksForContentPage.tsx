// src/pages/AddTasksForContentPage.tsx

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Page, Button, ListInput, List, BlockTitle, Card, Notification, Popover, Preloader } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axios from '../api/axiosInstance'
import bunnyLogo from '../images/bunny-mascot.png'
import { Icon } from '@iconify/react'

interface VerificationTask {
    id: number
    name: string
    description?: string
    intervalType: string
    repeatInterval?: number | null
    displayLocation: string
    platform: string
    verificationMethod: string
    xp: number
    shortCircuit: boolean
    shortCircuitTimer?: number | null
    parameters?: { [key: string]: string }
}

const AddTasksForContentPage: React.FC = () => {
    const { contentType, contentId } = useParams<{ contentType: string; contentId: string }>()
    const navigate = useNavigate()

    // Main form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        intervalType: 'ONETIME',
        repeatInterval: '',
        displayLocation: 'CONTENT_PAGE', // we want tasks to appear on content detail pages
        platform: 'NONE',
        verificationMethod: 'SHORT_CIRCUIT',
        xp: '',
        shortCircuit: false,
        shortCircuitTimer: '',
        parameters: {} as { [key: string]: string }
    })

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [tasks, setTasks] = useState<VerificationTask[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    const [editingTask, setEditingTask] = useState<VerificationTask | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

    // Fetch existing tasks for this content item
    useEffect(() => {
        const fetchTasks = async () => {
            if (!contentId || !contentType) return
            setLoading(true)

            try {
                // e.g. GET /api/verification-tasks/content/Educator/123
                const response = await axios.get(`/api/verification-tasks/content/${contentType}/${contentId}`)
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks for content:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchTasks()
    }, [contentType, contentId])

    // Helper to handle form changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement
        const checked = (e.target as HTMLInputElement).checked

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // Helper for parameter fields
    const handleParameterChange = (key: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [key]: value
            }
        }))
    }

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            intervalType: 'ONETIME',
            repeatInterval: '',
            displayLocation: 'CONTENT_PAGE',
            platform: 'NONE',
            verificationMethod: 'SHORT_CIRCUIT',
            xp: '',
            shortCircuit: false,
            shortCircuitTimer: '',
            parameters: {}
        })
        setEditingTask(null)
    }

    const handleSubmit = async () => {
        if (!contentId || !contentType) {
            setNotificationText('Missing contentId or contentType in route')
            setNotificationOpen(true)
            return
        }

        try {
            // Prepare data
            const dataToSend = {
                ...formData,
                taskType: 'CONTENT_SPECIFIC',
                // parse numeric fields
                xp: formData.xp ? parseInt(formData.xp, 10) : 0,
                repeatInterval: formData.intervalType === 'REPEATED' ? parseInt(formData.repeatInterval || '0', 10) : null,
                shortCircuitTimer: formData.shortCircuit ? parseInt(formData.shortCircuitTimer || '0', 10) : null,

                // We pass the correct foreign key based on contentType
                educatorId: contentType === 'Educator' ? parseInt(contentId, 10) : undefined,
                podcastId: contentType === 'Podcast' ? parseInt(contentId, 10) : undefined,
                tutorialId: contentType === 'Tutorial' ? parseInt(contentId, 10) : undefined,
                youtubeChannelId: contentType === 'YoutubeChannel' ? parseInt(contentId, 10) : undefined,
                telegramGroupId: contentType === 'TelegramGroup' ? parseInt(contentId, 10) : undefined
            }

            let endpoint = '/api/verification-tasks/content'
            // If editing, we use PUT to update an existing task
            if (editingTask) {
                const taskId = editingTask.id
                await axios.put(`/api/verification-tasks/${taskId}`, dataToSend)
                setNotificationText('Task updated successfully.')
                // update local tasks array
                setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...dataToSend, id: taskId } : t)))
            } else {
                // create new
                const response = await axios.post(endpoint, dataToSend)
                setNotificationText('Task created successfully.')
                setTasks((prev) => [...prev, response.data])
            }

            setNotificationOpen(true)
            resetForm()
        } catch (error: any) {
            console.error('Error creating/updating task:', error)
            const errMsg = error.response?.data?.message || 'Failed to create/update task'
            setNotificationText(errMsg)
            setNotificationOpen(true)
        }
    }

    // Edit an existing task => fill form
    const handleEdit = (task: VerificationTask) => {
        setEditingTask(task)
        setFormData({
            name: task.name,
            description: task.description || '',
            intervalType: task.intervalType,
            repeatInterval: task.repeatInterval ? task.repeatInterval.toString() : '',
            displayLocation: task.displayLocation,
            platform: task.platform || 'NONE',
            verificationMethod: task.verificationMethod || 'SHORT_CIRCUIT',
            xp: task.xp.toString(),
            shortCircuit: task.shortCircuit,
            shortCircuitTimer: task.shortCircuitTimer ? task.shortCircuitTimer.toString() : '',
            parameters: task.parameters || {}
        })
        window.scrollTo(0, 0)
    }

    // Show popover for actions
    const openPopoverForTask = (taskId: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedTaskId(taskId)
        setPopoverTarget(event.currentTarget)
        setPopoverOpen(true)
    }

    // Confirm deletion => open popover
    const handleDelete = (taskId: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedTaskId(taskId)
        setPopoverTarget(event.currentTarget)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteTask = async () => {
        if (!selectedTaskId) return
        try {
            await axios.delete(`/api/verification-tasks/${selectedTaskId}`)
            // remove from local list
            setTasks(tasks.filter((t) => t.id !== selectedTaskId))
            setNotificationText('Task deleted successfully.')
            setNotificationOpen(true)
        } catch (error) {
            console.error('Error deleting task:', error)
            setNotificationText('Failed to delete task.')
            setNotificationOpen(true)
        } finally {
            setConfirmDeleteOpen(false)
            setSelectedTaskId(null)
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center mt-2">
                <BlockTitle large>{editingTask ? `Edit ${contentType} Task` : `Add Tasks to ${contentType}`}</BlockTitle>
            </div>

            {/* FORM for Creating/Editing */}
            <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                <List>
                    <ListInput
                        label="Task Name"
                        type="text"
                        name="name"
                        outline
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter task name"
                        clearButton
                    />
                    <ListInput
                        label="Description"
                        type="textarea"
                        name="description"
                        outline
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter task description"
                        clearButton
                        className="!resize-none"
                    />
                    {/* Interval Type */}
                    <ListInput outline label="Interval Type" type="select" name="intervalType" value={formData.intervalType} onChange={handleChange}>
                        <option value="ONETIME">One-Time</option>
                        <option value="REPEATED">Repeated</option>
                    </ListInput>

                    {formData.intervalType === 'REPEATED' && (
                        <ListInput
                            label="Repeat Interval (Days)"
                            type="number"
                            name="repeatInterval"
                            outline
                            value={formData.repeatInterval}
                            onChange={handleChange}
                            placeholder="Enter repeat interval in days"
                            clearButton
                        />
                    )}

                    {/* Display Location - fixed to CONTENT_PAGE */}
                    <ListInput
                        outline
                        label="Display Location"
                        type="select"
                        name="displayLocation"
                        value={formData.displayLocation}
                        onChange={handleChange}
                        disabled
                    >
                        <option value="CONTENT_PAGE">Content Page</option>
                    </ListInput>

                    {/* Platform */}
                    <ListInput outline label="Platform" type="select" name="platform" value={formData.platform} onChange={handleChange}>
                        <option value="NONE">None</option>
                        <option value="X">X/Twitter</option>
                        <option value="TELEGRAM">Telegram</option>
                        <option value="YOUTUBE">YouTube</option>
                        <option value="INSTAGRAM">Instagram</option>
                        <option value="DISCORD">Discord</option>
                        <option value="EMAIL">Email</option>
                        <option value="LINKEDIN">LinkedIn</option>
                    </ListInput>

                    {/* Verification Method */}
                    <ListInput
                        label="Verification Method"
                        type="select"
                        outline
                        name="verificationMethod"
                        value={formData.verificationMethod}
                        onChange={handleChange}
                    >
                        <option value="SHORT_CIRCUIT">Short Circuit</option>
                        <option value="FOLLOW_USER">Follow User</option>
                        <option value="TWEET">Tweet</option>
                        <option value="RETWEET">Retweet</option>
                        <option value="LIKE_TWEET">Like Tweet</option>
                        <option value="COMMENT_ON_TWEET">Comment on Tweet</option>
                        <option value="JOIN_TELEGRAM_CHANNEL">Join Telegram Channel</option>
                        <option value="INVITE_TELEGRAM_FRIEND">Invite Telegram Friend</option>
                        <option value="INVITE_WITH_REFERRAL">Invite with Referral</option>
                        <option value="SUBSCRIBE_YOUTUBE_CHANNEL">Subscribe YT Channel</option>
                        <option value="WATCH_YOUTUBE_VIDEO">Watch YT Video</option>
                        <option value="FOLLOW_INSTAGRAM_USER">Follow IG User</option>
                        <option value="FOLLOW_LINKEDIN_USER">Follow LinkedIn User</option>
                        <option value="JOIN_DISCORD_CHANNEL">Join Discord Channel</option>
                        <option value="PROVIDE_EMAIL">Provide Email</option>
                        <option value="LEAVE_FEEDBACK">Leave Feedback</option>
                        <option value="MEME_TWEET">Tweet Meme</option>
                    </ListInput>

                    {/* Conditional Parameter Fields */}
                    {['FOLLOW_USER', 'FOLLOW_INSTAGRAM_USER', 'FOLLOW_LINKEDIN_USER'].includes(formData.verificationMethod) && (
                        <ListInput
                            label="Username/Link"
                            type="text"
                            outline
                            value={formData.parameters.username || ''}
                            onChange={(e) => handleParameterChange('username', e.target.value)}
                            placeholder="Enter username or link"
                            clearButton
                        />
                    )}
                    {['RETWEET', 'LIKE_TWEET', 'COMMENT_ON_TWEET'].includes(formData.verificationMethod) && (
                        <ListInput
                            label="Tweet ID"
                            type="text"
                            outline
                            value={formData.parameters.tweetId || ''}
                            onChange={(e) => handleParameterChange('tweetId', e.target.value)}
                            placeholder="Enter Tweet ID"
                            clearButton
                        />
                    )}
                    {formData.verificationMethod === 'JOIN_TELEGRAM_CHANNEL' && (
                        <ListInput
                            label="Channel Link"
                            type="text"
                            outline
                            value={formData.parameters.channelLink || ''}
                            onChange={(e) => handleParameterChange('channelLink', e.target.value)}
                            placeholder="Enter Telegram Channel Link"
                            clearButton
                        />
                    )}
                    {formData.verificationMethod === 'SUBSCRIBE_YOUTUBE_CHANNEL' && (
                        <ListInput
                            label="Channel URL"
                            type="text"
                            outline
                            value={formData.parameters.channelUrl || ''}
                            onChange={(e) => handleParameterChange('channelUrl', e.target.value)}
                            placeholder="Enter YouTube Channel URL"
                            clearButton
                        />
                    )}
                    {formData.verificationMethod === 'WATCH_YOUTUBE_VIDEO' && (
                        <ListInput
                            label="Video URL"
                            type="text"
                            outline
                            value={formData.parameters.videoUrl || ''}
                            onChange={(e) => handleParameterChange('videoUrl', e.target.value)}
                            placeholder="Enter YouTube Video URL"
                            clearButton
                        />
                    )}
                    {formData.verificationMethod === 'JOIN_DISCORD_CHANNEL' && (
                        <ListInput
                            label="Invite Link"
                            type="text"
                            outline
                            value={formData.parameters.inviteLink || ''}
                            onChange={(e) => handleParameterChange('inviteLink', e.target.value)}
                            placeholder="Enter Discord Invite Link"
                            clearButton
                        />
                    )}
                    {formData.verificationMethod === 'TWEET' && (
                        <ListInput
                            label="Tweet Text"
                            type="text"
                            outline
                            value={formData.parameters.tweetText || ''}
                            onChange={(e) => handleParameterChange('tweetText', e.target.value)}
                            placeholder="Enter tweet text"
                            clearButton
                        />
                    )}

                    <ListInput
                        label="XP Allocation"
                        type="number"
                        name="xp"
                        outline
                        value={formData.xp}
                        onChange={handleChange}
                        placeholder="Enter XP to allocate"
                        clearButton
                    />

                    <div className="list-input">
                        <label className="item-checkbox item-content">
                            <input type="checkbox" name="shortCircuit" checked={formData.shortCircuit} onChange={handleChange} />
                            <i className="icon icon-checkbox"></i>
                            <div className="item-inner">
                                <div className="item-title">Short Circuit</div>
                            </div>
                        </label>
                    </div>

                    {formData.shortCircuit && (
                        <ListInput
                            label="Short Circuit Timer (Seconds)"
                            type="number"
                            outline
                            name="shortCircuitTimer"
                            value={formData.shortCircuitTimer}
                            onChange={handleChange}
                            placeholder="Enter short circuit timer in seconds"
                            clearButton
                        />
                    )}
                </List>

                <Button large rounded raised onClick={handleSubmit} className="w-full mt-4 bg-brand-primary text-white">
                    {editingTask ? 'Update Task' : 'Create Task'}
                </Button>
                {editingTask && (
                    <Button large rounded onClick={resetForm} className="w-full mt-2 bg-gray-500 text-white">
                        Cancel Edit
                    </Button>
                )}
            </Card>

            <BlockTitle large className="text-center">
                Existing Tasks for {contentType}
            </BlockTitle>

            {loading ? (
                <div className="flex justify-center items-center">
                    <Preloader size="w-12 h-12" />
                </div>
            ) : tasks.length > 0 ? (
                tasks.map((task) => (
                    <Card key={task.id} className="!mb-2 !p-4 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg mb-2">{task.name}</h3>
                                {task.description && <p className="text-sm">{task.description}</p>}
                                <p className="text-sm mt-1">
                                    XP: {task.xp} | Platform: {task.platform} | Method: {task.verificationMethod}
                                </p>
                                {task.parameters && Object.keys(task.parameters).length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-semibold">Parameters:</p>
                                        <ul className="list-disc list-inside">
                                            {Object.entries(task.parameters).map(([key, val]) => (
                                                <li key={key} className="break-all whitespace-normal">
                                                    {key}: {val}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-end">
                                <Button onClick={() => handleEdit(task)} className="!m-0 !p-0 bg-transparent">
                                    <Icon icon="mdi:pencil" className="w-6 h-6 text-blue-500" />
                                </Button>
                                <Button onClick={(e) => handleDelete(task.id, e)} className="!m-0 !p-0 bg-transparent">
                                    <Icon icon="mdi:delete" className="w-6 h-6 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))
            ) : (
                <p className="mx-4 text-center">No tasks found. Create one above!</p>
            )}

            {/* Notification */}
            <Notification
                className="fixed top-0 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Message from Coinbeats Bunny"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />

            {/* Delete Confirmation Popover */}
            <Popover
                opened={confirmDeleteOpen}
                target={popoverTarget}
                onBackdropClick={() => setConfirmDeleteOpen(false)}
                onClose={() => setConfirmDeleteOpen(false)}
                angle
            >
                <div className="p-4 text-center">
                    <h3 className="text-lg font-bold mb-4">Delete Task</h3>
                    <p className="mb-4">Are you sure you want to delete this task? This action is irreversible!</p>
                    <div className="flex justify-center">
                        <Button onClick={confirmDeleteTask} className="bg-red-600 rounded-full mr-2 !text-xs">
                            Yes, Delete
                        </Button>
                        <Button onClick={() => setConfirmDeleteOpen(false)} className="bg-gray-400 rounded-full !text-xs">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Popover>
        </Page>
    )
}

export default AddTasksForContentPage
