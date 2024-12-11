// client/src/pages/AddPlatformTasksPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, List, ListInput, ListItem, Button, BlockTitle, Block, Card, Notification, Toggle, Popover, Preloader } from 'konsta/react'
import { Icon } from '@iconify/react'
import axios from '../api/axiosInstance'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import bunnyLogo from '../images/bunny-mascot.png'
import { VerificationTask } from '../types'

const AddPlatformTasksPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        intervalType: 'ONETIME',
        repeatInterval: '',
        displayLocation: 'QUEST_TAB',
        platform: 'NONE',
        verificationMethod: 'SHORT_CIRCUIT',
        xp: '',
        shortCircuit: false,
        shortCircuitTimer: '',
        parameters: {} // Added parameters field
    })
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [tasks, setTasks] = useState<VerificationTask[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [editingTask, setEditingTask] = useState<VerificationTask | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)

    // Fetch tasks when component mounts
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('/api/verification-tasks/platform')
                setTasks(response.data)
            } catch (error) {
                console.error('Error fetching tasks:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTasks()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement
        const checked = (e.target as HTMLInputElement).checked
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'radio' ? checked : value
        }))
    }

    const handleParameterChange = (key: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            parameters: {
                ...prev.parameters,
                [key]: value
            }
        }))
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            intervalType: 'ONETIME',
            repeatInterval: '',
            displayLocation: 'QUEST_TAB',
            platform: 'NONE',
            verificationMethod: 'SHORT_CIRCUIT',
            xp: '',
            shortCircuit: false,
            shortCircuitTimer: '',
            parameters: {} // Reset parameters
        })
        setEditingTask(null)
    }

    const handleSubmit = async () => {
        try {
            const taskData = {
                ...formData,
                taskType: 'PLATFORM_SPECIFIC',
                xp: formData.xp ? parseInt(formData.xp.toString(), 10) : 0,
                repeatInterval: formData.repeatInterval ? parseInt(formData.repeatInterval.toString(), 10) : null,
                shortCircuitTimer: formData.shortCircuitTimer ? parseInt(formData.shortCircuitTimer.toString(), 10) : null,
                shortCircuit: formData.shortCircuit,
                parameters: formData.parameters || {} // Include parameters
            }

            if (editingTask) {
                // Update existing task
                await axios.put(`/api/verification-tasks/${editingTask.id}`, taskData)
                setNotificationText('Task updated successfully.')
                setTasks((prevTasks) => prevTasks.map((task) => (task.id === editingTask.id ? { ...task, ...taskData } : task)))
            } else {
                // Create new task
                const response = await axios.post('/api/verification-tasks/platform', taskData)
                setNotificationText('Task created successfully.')
                setTasks((prevTasks) => [...prevTasks, response.data])
            }
            setNotificationOpen(true)
            resetForm()
        } catch (error) {
            console.error('Error creating/updating task:', error)
            setNotificationText('Failed to create/update task.')
            setNotificationOpen(true)
        }
    }

    const handleEdit = (task: VerificationTask) => {
        setEditingTask(task)
        setFormData({
            name: task.name,
            description: task.description || '',
            intervalType: task.intervalType,
            repeatInterval: task.repeatInterval?.toString() || '',
            displayLocation: task.displayLocation,
            platform: task.platform || 'NONE',
            verificationMethod: task.verificationMethod || 'SHORT_CIRCUIT',
            xp: task.xp.toString(),
            shortCircuit: task.shortCircuit,
            shortCircuitTimer: task.shortCircuitTimer?.toString() || '',
            parameters: task.parameters || {} // Set parameters
        })
        window.scrollTo(0, 0)
    }

    const handleDelete = (taskId: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedTaskId(taskId)
        setPopoverTarget(event.currentTarget)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteTask = async () => {
        if (selectedTaskId !== null) {
            try {
                await axios.delete(`/api/verification-tasks/${selectedTaskId}`)
                setTasks(tasks.filter((task) => task.id !== selectedTaskId))
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
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="text-center flex w-full items-center justify-center absolute top-8 !mb-18">
                <BlockTitle large>{editingTask ? 'Edit Task' : 'Add Platform Task'}</BlockTitle>
            </div>

            <div className="mt-18">
                <Block>
                    <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600">
                        <List strong inset className="!m-0 !p-0">
                            <ListInput
                                label="Name"
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
                            />
                            <ListInput
                                outline
                                label="Interval Type"
                                type="select"
                                name="intervalType"
                                inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                                value={formData.intervalType}
                                onChange={handleChange}
                            >
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
                            <ListInput
                                outline
                                label="Display Location"
                                type="select"
                                name="displayLocation"
                                value={formData.displayLocation}
                                onChange={handleChange}
                                inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                            >
                                <option value="QUEST_TAB">Quest Tab</option>
                                <option value="END_OF_ACADEMY">End of Academy</option>
                                <option value="GAMES_PAGE">Games Page</option>
                                <option value="HOME_PAGE">Home Page</option>
                                <option value="POINTS_PAGE">Points Page</option>
                                <option value="OTHER">Other</option>
                            </ListInput>
                            <ListInput
                                outline
                                label="Platform"
                                type="select"
                                inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                                name="platform"
                                value={formData.platform}
                                onChange={handleChange}
                            >
                                <option value="NONE">None</option>
                                <option value="X">X</option>
                                <option value="TELEGRAM">Telegram</option>
                                <option value="YOUTUBE">YouTube</option>
                                <option value="INSTAGRAM">Instagram</option>
                                <option value="DISCORD">Discord</option>
                                <option value="EMAIL">Email</option>
                            </ListInput>
                            <ListInput
                                label="Verification Method"
                                type="select"
                                outline
                                name="verificationMethod"
                                value={formData.verificationMethod}
                                onChange={handleChange}
                                inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                            >
                                <option value="FOLLOW_USER">Follow User</option>
                                <option value="TWEET">Tweet</option>
                                <option value="RETWEET">Retweet</option>
                                <option value="LIKE_TWEET">Like Tweet</option>
                                <option value="COMMENT_ON_TWEET">Comment on tweet</option>
                                <option value="ADD_TO_BIO">Add to Bio</option>
                                <option value="JOIN_TELEGRAM_CHANNEL">Join Telegram Channel</option>
                                <option value="INVITE_TELEGRAM_FRIEND">Invite Telegram Friend</option>
                                <option value="INVITE_WITH_REFERRAL">Invite with Referral</option>
                                <option value="SUBSCRIBE_YOUTUBE_CHANNEL">Subscribe YouTube Channel</option>
                                <option value="WATCH_YOUTUBE_VIDEO">Watch YouTube Video</option>
                                <option value="FOLLOW_INSTAGRAM_USER">Follow Instagram User</option>
                                <option value="FOLLOW_LINKEDIN_USER">Follow LinkedIn User</option>
                                <option value="JOIN_DISCORD_CHANNEL">Join Discord Channel</option>
                                <option value="PROVIDE_EMAIL">Provide Email</option>
                                <option value="SHORT_CIRCUIT">Short Circuit</option>
                                <option value="LEAVE_FEEDBACK">Leave Feedback</option>
                                <option value="MEME_TWEET">Tweet Meme</option>
                            </ListInput>

                            {/* Conditional Parameters Input Fields */}

                            {/* For FOLLOW_USER */}
                            {formData.verificationMethod === 'FOLLOW_USER' && (
                                <ListInput
                                    label="Username"
                                    type="text"
                                    name="username"
                                    outline
                                    value={formData.parameters.username || ''}
                                    onChange={(e) => handleParameterChange('username', e.target.value)}
                                    placeholder="Enter username"
                                    clearButton
                                />
                            )}
                            {/* For RETWEET, LIKE_TWEET, COMMENT_ON_TWEET */}
                            {['RETWEET', 'LIKE_TWEET', 'COMMENT_ON_TWEET'].includes(formData.verificationMethod) && (
                                <ListInput
                                    label="Tweet ID"
                                    type="text"
                                    name="tweetId"
                                    outline
                                    value={formData.parameters.tweetId || ''}
                                    onChange={(e) => handleParameterChange('tweetId', e.target.value)}
                                    placeholder="Enter Tweet ID"
                                    clearButton
                                />
                            )}
                            {/* For JOIN_TELEGRAM_CHANNEL */}
                            {formData.verificationMethod === 'JOIN_TELEGRAM_CHANNEL' && (
                                <ListInput
                                    label="Channel Link"
                                    type="text"
                                    name="channelLink"
                                    outline
                                    value={formData.parameters.channelLink || ''}
                                    onChange={(e) => handleParameterChange('channelLink', e.target.value)}
                                    placeholder="Enter Telegram Channel Link"
                                    clearButton
                                />
                            )}
                            {/* For SUBSCRIBE_YOUTUBE_CHANNEL */}
                            {formData.verificationMethod === 'SUBSCRIBE_YOUTUBE_CHANNEL' && (
                                <ListInput
                                    label="Channel URL"
                                    type="text"
                                    name="channelUrl"
                                    outline
                                    value={formData.parameters.channelUrl || ''}
                                    onChange={(e) => handleParameterChange('channelUrl', e.target.value)}
                                    placeholder="Enter YouTube Channel URL"
                                    clearButton
                                />
                            )}
                            {/* For WATCH_YOUTUBE_VIDEO */}
                            {formData.verificationMethod === 'WATCH_YOUTUBE_VIDEO' && (
                                <ListInput
                                    label="Video URL"
                                    type="text"
                                    name="videoUrl"
                                    outline
                                    value={formData.parameters.videoUrl || ''}
                                    onChange={(e) => handleParameterChange('videoUrl', e.target.value)}
                                    placeholder="Enter YouTube Video URL"
                                    clearButton
                                />
                            )}
                            {/* For FOLLOW_INSTAGRAM_USER */}
                            {formData.verificationMethod === 'FOLLOW_INSTAGRAM_USER' && (
                                <ListInput
                                    label="Username"
                                    type="text"
                                    name="username"
                                    outline
                                    value={formData.parameters.username || ''}
                                    onChange={(e) => handleParameterChange('username', e.target.value)}
                                    placeholder="Enter Instagram Username"
                                    clearButton
                                />
                            )}
                            {/* For FOLLOW_LINKEDIN_USER */}
                            {formData.verificationMethod === 'FOLLOW_LINKEDIN_USER' && (
                                <ListInput
                                    label="LinkedIn Profile URL"
                                    type="text"
                                    name="username"
                                    outline
                                    value={formData.parameters.username || ''}
                                    onChange={(e) => handleParameterChange('username', e.target.value)}
                                    placeholder="Enter LinkedIn Profile URL"
                                    clearButton
                                />
                            )}
                            {/* For JOIN_DISCORD_CHANNEL */}
                            {formData.verificationMethod === 'JOIN_DISCORD_CHANNEL' && (
                                <ListInput
                                    label="Invite Link"
                                    type="text"
                                    name="inviteLink"
                                    outline
                                    value={formData.parameters.inviteLink || ''}
                                    onChange={(e) => handleParameterChange('inviteLink', e.target.value)}
                                    placeholder="Enter Discord Invite Link"
                                    clearButton
                                />
                            )}
                            {/* For TWEET */}
                            {formData.verificationMethod === 'TWEET' && (
                                <ListInput
                                    label="Tweet Text"
                                    type="text"
                                    name="tweetText"
                                    outline
                                    value={formData.parameters.tweetText || ''}
                                    onChange={(e) => handleParameterChange('tweetText', e.target.value)}
                                    placeholder="Enter Tweet Text"
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
                            <ListItem
                                title="Short Circuit"
                                after={
                                    <Toggle
                                        checked={formData.shortCircuit}
                                        onChange={(e) => setFormData({ ...formData, shortCircuit: e.target.checked })}
                                        name="shortCircuit"
                                    />
                                }
                            />
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

                        <Button large rounded raised onClick={handleSubmit} className="w-full mt-4">
                            {editingTask ? 'Update Task' : 'Create Task'}
                        </Button>
                        {editingTask && (
                            <Button large rounded onClick={resetForm} className="w-full mt-2 bg-gray-500 text-white">
                                Cancel Edit
                            </Button>
                        )}
                    </Card>
                </Block>

                <BlockTitle large className="text-center">
                    Existing Platform Tasks
                </BlockTitle>

                {loading ? (
                    <div className="flex justify-center items-center">
                        <Preloader size="w-12 h-12" />
                    </div>
                ) : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <Block key={task.id}>
                            <Card
                                className="!mb-2 !p-4 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600"
                                style={{
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold text-xl mb-2">{task.name}</h3>
                                        <p className="text-sm">{task.description}</p>
                                        <p className="text-sm mt-1">
                                            XP: {task.xp} | Platform: {task.platform} | Method: {task.verificationMethod}
                                        </p>
                                        {/* Display parameters */}
                                        {task.parameters && (
                                            <div className="mt-2">
                                                <p className="text-sm font-semibold">Parameters:</p>
                                                <ul className="list-disc list-inside">
                                                    {Object.entries(task.parameters).map(([key, value]) => (
                                                        <li key={key}>
                                                            {key}: {value as string}
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
                        </Block>
                    ))
                ) : (
                    <p className="mx-4 text-center mt-10">No platform tasks found. Start by creating a task.</p>
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
                </Block>
            </Popover>
        </Page>
    )
}

export default AddPlatformTasksPage
