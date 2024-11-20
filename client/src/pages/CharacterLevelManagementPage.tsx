import React, { useState, useEffect } from 'react'
import { Page, Block, List, ListInput, Button, Notification, Card } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import axiosInstance from '../api/axiosInstance'
import bunnyLogo from '../images/bunny-mascot.png'

const CharacterLevelManagementPage: React.FC = () => {
    const [levels, setLevels] = useState<Level[]>([])
    const [levelForm, setLevelForm] = useState<{
        id: number | null
        levelName: string
        minPoints: string
        maxPoints: string
        rewardPoints: string
        image: File | null
    }>({
        id: null,
        levelName: '',
        minPoints: '',
        maxPoints: '',
        rewardPoints: '',
        image: null
    })
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const navigate = useNavigate()

    // Fetch character levels on mount
    useEffect(() => {
        fetchCharacterLevels()
    }, [])

    const fetchCharacterLevels = async () => {
        try {
            const response = await axiosInstance.get('/api/character-levels')
            setLevels(response.data)
        } catch (error) {
            console.error('Error fetching character levels:', error)
        }
    }

    const handleSubmitLevel = async () => {
        try {
            const formData = new FormData()
            formData.append('levelName', levelForm.levelName)
            formData.append('minPoints', levelForm.minPoints)
            formData.append('maxPoints', levelForm.maxPoints)
            formData.append('rewardPoints', levelForm.rewardPoints)
            if (levelForm.image) {
                formData.append('lottie', levelForm.image)
            }

            if (levelForm.id) {
                // Update existing level
                await axiosInstance.put(`/api/character-levels/${levelForm.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                setNotificationText('Level updated successfully')
            } else {
                // Create new level
                await axiosInstance.post('/api/character-levels', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })
                setNotificationText('Level created successfully')
            }

            setNotificationOpen(true)
            resetForm()
            fetchCharacterLevels()
        } catch (error) {
            console.error('Error submitting level:', error)
            setNotificationText('Failed to submit level')
            setNotificationOpen(true)
        }
    }

    // Handle editing a level
    interface Level {
        id: number
        levelName: string
        minPoints: number
        maxPoints: number
        rewardPoints: number
        imageUrl: string
    }

    const handleEditLevel = (level: Level) => {
        setLevelForm({
            id: level.id,
            levelName: level.levelName,
            minPoints: level.minPoints.toString(),
            maxPoints: level.maxPoints.toString(),
            rewardPoints: level.rewardPoints.toString(),
            image: null // Image will be replaced if a new one is uploaded
        })
    }

    // Handle deleting a level
    const handleDeleteLevel = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this level?')) {
            try {
                await axiosInstance.delete(`/api/character-levels/${id}`)
                setNotificationText('Level deleted successfully')
                setNotificationOpen(true)
                fetchCharacterLevels()
            } catch (error) {
                console.error('Error deleting level:', error)
                setNotificationText('Failed to delete level')
                setNotificationOpen(true)
            }
        }
    }

    // Reset the form
    const resetForm = () => {
        setLevelForm({
            id: null,
            levelName: '',
            minPoints: '',
            maxPoints: '',
            rewardPoints: '',
            image: null
        })
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            {/* Character Levels List */}
            <Block>
                <h2 className="text-xl font-bold mb-4">Character Levels</h2>
                {levels.map((level) => (
                    <Card key={level.id} className="mb-4">
                        <div className="flex items-center">
                            <img src={level.imageUrl} alt={level.levelName} className="w-16 h-16 object-cover mr-4" />
                            <div>
                                <h3 className="font-bold">{level.levelName}</h3>
                                <p>
                                    Points Range: {level.minPoints} - {level.maxPoints}
                                </p>
                                <p>Reward Points: {level.rewardPoints}</p>
                            </div>
                        </div>
                        <div className="flex mt-2">
                            <Button onClick={() => handleEditLevel(level)} className="mr-2" outline>
                                Edit
                            </Button>
                            <Button onClick={() => handleDeleteLevel(level.id)} className="bg-red-500 text-white">
                                Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </Block>

            {/* Level Form */}
            <Block>
                <h2 className="text-xl font-bold mb-4">{levelForm.id ? 'Edit Level' : 'Add New Level'}</h2>
                <List>
                    <ListInput
                        label="Level Name"
                        type="text"
                        outline
                        placeholder="Enter level name"
                        value={levelForm.levelName}
                        onChange={(e) => setLevelForm({ ...levelForm, levelName: e.target.value })}
                    />
                    <ListInput
                        label="Min Points"
                        type="number"
                        outline
                        placeholder="Enter minimum points"
                        value={levelForm.minPoints}
                        onChange={(e) => setLevelForm({ ...levelForm, minPoints: e.target.value })}
                    />
                    <ListInput
                        label="Max Points"
                        type="number"
                        outline
                        placeholder="Enter maximum points"
                        value={levelForm.maxPoints}
                        onChange={(e) => setLevelForm({ ...levelForm, maxPoints: e.target.value })}
                    />
                    <ListInput
                        label="Reward Points"
                        type="number"
                        outline
                        placeholder="Enter reward points"
                        value={levelForm.rewardPoints}
                        onChange={(e) => setLevelForm({ ...levelForm, rewardPoints: e.target.value })}
                    />
                    <div className="mb-4">
                        <label className="block font-medium mb-2">Upload Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setLevelForm({
                                    ...levelForm,
                                    image: e.target.files ? e.target.files[0] : null
                                })
                            }
                        />
                        {levelForm.image && (
                            <div className="mt-2">
                                <img src={URL.createObjectURL(levelForm.image)} alt="Preview" className="w-32 h-32 object-cover" />
                            </div>
                        )}
                    </div>
                </List>
                <Button onClick={handleSubmitLevel} className="w-full bg-brand-primary text-white mt-4" large raised>
                    {levelForm.id ? 'Update Level' : 'Add Level'}
                </Button>
                {levelForm.id && (
                    <Button onClick={resetForm} className="w-full bg-gray-500 text-white mt-2" large raised>
                        Cancel
                    </Button>
                )}
            </Block>

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
        </Page>
    )
}

export default CharacterLevelManagementPage
