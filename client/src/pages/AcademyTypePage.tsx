// client/src/pages/AcademyTypePage.tsx

import React, { useState, useEffect } from 'react'
import axios from '../api/axiosInstance'
import { Card, Button, List, ListInput, Page, BlockTitle, Block, Notification, Popover, ListItem, Toggle } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import bunnyLogo from '../images/bunny-mascot.png' // Ensure this path is correct
import useAuthStore from '../store/useAuthStore' // Import your auth store to get access token

const AcademyTypePage = () => {
    interface User {
        id: number
        email: string
    }

    interface AcademyType {
        id: string | number
        name: string
        description: string
        restricted: boolean
        allowedUsers: User[]
        initialQuestions: { id: string | number; question: string }[]
    }

    interface NewAcademyType {
        name: string
        description: string
        restricted: boolean
        allowedUserEmails: string[]
    }

    const [academyTypes, setAcademyTypes] = useState<AcademyType[]>([])
    const [newAcademyType, setNewAcademyType] = useState<NewAcademyType>({
        name: '',
        description: '',
        restricted: false,
        allowedUserEmails: []
    })
    const [newQuestion, setNewQuestion] = useState('')
    const [selectedTypeId, setSelectedTypeId] = useState<string | number | null>(null)
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [confirmDeleteTypeId, setConfirmDeleteTypeId] = useState<string | number | null>(null)
    const [confirmDeleteQuestionId, setConfirmDeleteQuestionId] = useState<string | number | null>(null)
    const { accessToken } = useAuthStore() // Get access token from your auth store

    // New state to hold edited allowed user emails per academy type
    const [editedAllowedUserEmails, setEditedAllowedUserEmails] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        fetchAcademyTypes()
    }, [])

    const fetchAcademyTypes = async () => {
        console.log('Fetching academy types...')
        try {
            const response = await axios.get('/api/academy-types', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            console.log('Academy types fetched:', response.data)
            setAcademyTypes(response.data)
        } catch (error) {
            console.error('Error fetching academy types:', error)
            setNotificationText('Error fetching academy types.')
            setNotificationOpen(true)
        }
    }

    const handleCreateAcademyType = async () => {
        console.log('Creating academy type...')
        try {
            const response = await axios.post('/api/academy-types', newAcademyType, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            console.log('Academy type created:', response.data)
            setNotificationText('Academy type created successfully.')
            setNotificationOpen(true)
            fetchAcademyTypes()
            setNewAcademyType({
                name: '',
                description: '',
                restricted: false,
                allowedUserEmails: []
            })
        } catch (error) {
            console.error('Error creating academy type:', error)
            setNotificationText('Failed to create academy type.')
            setNotificationOpen(true)
        }
    }

    const handleAddQuestion = async (typeId: string | number) => {
        if (!newQuestion.trim()) {
            setNotificationText('Question cannot be empty.')
            setNotificationOpen(true)
            return
        }

        console.log('Adding initial question to academy type ID:', typeId)
        try {
            const response = await axios.post(
                `/api/academy-types/${typeId}/questions`,
                { question: newQuestion },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            )
            console.log('Initial question added:', response.data)
            setNotificationText('Question added successfully.')
            setNotificationOpen(true)
            fetchAcademyTypes()
            setNewQuestion('')
            setSelectedTypeId(null)
        } catch (error) {
            console.error('Error adding initial question:', error)
            setNotificationText('Failed to add question.')
            setNotificationOpen(true)
        }
    }

    const handleDeleteAcademyType = (typeId: string | number) => {
        console.log('Preparing to delete academy type ID:', typeId)
        setConfirmDeleteTypeId(typeId)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteAcademyType = async () => {
        if (confirmDeleteTypeId !== null) {
            try {
                console.log('Deleting academy type ID:', confirmDeleteTypeId)
                await axios.delete(`/api/academy-types/${confirmDeleteTypeId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                setNotificationText('Academy type deleted successfully.')
                setNotificationOpen(true)
                fetchAcademyTypes()
            } catch (error) {
                console.error('Error deleting academy type:', error)
                setNotificationText('Failed to delete academy type.')
                setNotificationOpen(true)
            } finally {
                setConfirmDeleteOpen(false)
                setConfirmDeleteTypeId(null)
            }
        }
    }

    const handleDeleteQuestion = (questionId: string | number) => {
        console.log('Preparing to delete question ID:', questionId)
        setConfirmDeleteQuestionId(questionId)
        setConfirmDeleteOpen(true)
    }

    const confirmDeleteQuestion = async () => {
        if (confirmDeleteQuestionId !== null) {
            try {
                console.log('Deleting question ID:', confirmDeleteQuestionId)
                await axios.delete(`/api/academy-types/questions/${confirmDeleteQuestionId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                })
                setNotificationText('Question deleted successfully.')
                setNotificationOpen(true)
                fetchAcademyTypes()
            } catch (error) {
                console.error('Error deleting question:', error)
                setNotificationText('Failed to delete question.')
                setNotificationOpen(true)
            } finally {
                setConfirmDeleteOpen(false)
                setConfirmDeleteQuestionId(null)
            }
        }
    }

    const handleEditQuestion = (typeId: string | number, questionId: string | number, value: string) => {
        setAcademyTypes((prev) =>
            prev.map((type) =>
                type.id === typeId
                    ? {
                          ...type,
                          initialQuestions: type.initialQuestions.map((q) => (q.id === questionId ? { ...q, question: value } : q))
                      }
                    : type
            )
        )
    }

    const handleSaveQuestion = async (typeId: string | number, questionId: string | number, updatedQuestion: string) => {
        if (!updatedQuestion.trim()) {
            setNotificationText('Question cannot be empty.')
            setNotificationOpen(true)
            return
        }

        try {
            await axios.put(
                `/api/academy-types/questions/${questionId}`,
                { question: updatedQuestion },
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            )
            setNotificationText('Question updated successfully.')
            setNotificationOpen(true)
            fetchAcademyTypes()
        } catch (error) {
            console.error('Error updating question:', error)
            setNotificationText('Failed to update question.')
            setNotificationOpen(true)
        }
    }

    const handleUpdateAcademyType = async (typeId: string | number, updates: Partial<AcademyType>) => {
        try {
            await axios.put(`/api/academy-types/${typeId}`, updates, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            setNotificationText('Academy type updated successfully.')
            setNotificationOpen(true)
            fetchAcademyTypes()

            // Clear the local edited emails for this type
            setEditedAllowedUserEmails((prev) => {
                const updated = { ...prev }
                delete updated[typeId]
                return updated
            })
        } catch (error) {
            console.error('Error updating academy type:', error)
            setNotificationText('Failed to update academy type.')
            setNotificationOpen(true)
        }
    }

    // Handler for the Apply button to update allowed user emails
    const handleApplyAllowedUserEmails = (typeId: string | number) => {
        const emails = editedAllowedUserEmails[typeId]
        if (emails !== undefined) {
            const allowedUserEmails = emails.split(',').map((email) => email.trim())
            handleUpdateAcademyType(typeId, { allowedUserEmails })
        }
    }

    // Helper function to auto-resize textareas
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="text-center flex w-full items-center justify-center !mt-6 !mb-4">
                <BlockTitle large className="!m-0">
                    Academy Type Management
                </BlockTitle>
            </div>

            {/* Create New Academy Type Card */}
            <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <h2 className="text-lg text-center">Create New Academy Type</h2>
                <List>
                    <ListInput
                        label="Name"
                        type="textarea"
                        outline
                        placeholder="Academy Type Name"
                        value={newAcademyType.name}
                        onChange={(e) => {
                            setNewAcademyType({ ...newAcademyType, name: e.target.value })
                            autoResize(e)
                        }}
                        inputClassName="!resize-none"
                        className="!m-0 !p-0"
                        onInput={autoResize}
                    />
                    <ListInput
                        label="Description"
                        type="textarea"
                        outline
                        placeholder="Description"
                        value={newAcademyType.description}
                        onChange={(e) => {
                            setNewAcademyType({
                                ...newAcademyType,
                                description: e.target.value
                            })
                            autoResize(e)
                        }}
                        inputClassName="!resize-none"
                        className="!m-0 !p-0"
                        onInput={autoResize}
                    />
                    {/* Toggle for Restrict Access */}
                    <ListItem
                        title="Restrict Access"
                        after={
                            <Toggle
                                checked={newAcademyType.restricted}
                                onChange={(e) =>
                                    setNewAcademyType({
                                        ...newAcademyType,
                                        restricted: e.target.checked
                                    })
                                }
                            />
                        }
                    />
                    {/* Input field for allowed user emails */}
                    {newAcademyType.restricted && (
                        <ListInput
                            label="Allowed User Emails"
                            type="textarea"
                            outline
                            placeholder="Enter emails separated by commas"
                            value={newAcademyType.allowedUserEmails.join(', ')}
                            onChange={(e) =>
                                setNewAcademyType({
                                    ...newAcademyType,
                                    allowedUserEmails: e.target.value.split(',').map((email) => email.trim())
                                })
                            }
                            inputClassName="!resize-none"
                            className="!m-0 !p-0"
                            onInput={autoResize}
                        />
                    )}
                </List>
                <Button rounded onClick={handleCreateAcademyType}>
                    Create Academy Type
                </Button>
            </Card>

            {/* List of Academy Types */}
            {academyTypes.map((academyType) => (
                <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600" key={academyType.id}>
                    <h2 className="text-lg mb-2">
                        Type Name: <strong>{academyType.name}</strong>
                    </h2>
                    <p>
                        Description: <strong>{academyType.description}</strong>
                    </p>

                    {/* Toggle for Restricted */}
                    <List className="!m-0 !p-0">
                        <ListItem
                            title="Restricted"
                            className="!m-0 !p-0"
                            after={
                                <Toggle
                                    checked={academyType.restricted}
                                    onChange={(e) =>
                                        handleUpdateAcademyType(academyType.id, {
                                            restricted: e.target.checked
                                        })
                                    }
                                />
                            }
                        />
                    </List>
                    {/* If restricted, show allowed user emails */}
                    {academyType.restricted && (
                        <List className="!m-0 !p-0">
                            <ListInput
                                label="Allowed User Emails"
                                type="textarea"
                                outline
                                placeholder="Enter emails separated by commas"
                                value={
                                    editedAllowedUserEmails[academyType.id] !== undefined
                                        ? editedAllowedUserEmails[academyType.id]
                                        : academyType.allowedUsers.map((user) => user.email).join(', ')
                                }
                                onChange={(e) =>
                                    setEditedAllowedUserEmails({
                                        ...editedAllowedUserEmails,
                                        [academyType.id]: e.target.value
                                    })
                                }
                                inputClassName="!resize-none"
                                className="!m-0 !p-0"
                                onInput={autoResize}
                            />
                            <Button className="text-xs mt-2" rounded onClick={() => handleApplyAllowedUserEmails(academyType.id)}>
                                Apply
                            </Button>
                        </List>
                    )}

                    <h3 className="text-center font-bold mt-4">Initial Questions</h3>

                    {academyType.initialQuestions.map((question) => (
                        <List className="!m-0 !p-0" key={question.id}>
                            <div className="flex flex-col mb-4">
                                {/* Expandable Input Field */}
                                <ListInput
                                    label="Edit Question"
                                    type="textarea"
                                    outline
                                    placeholder="Edit question"
                                    value={question.question}
                                    onChange={(e) => handleEditQuestion(academyType.id, question.id, e.target.value)}
                                    onInput={autoResize}
                                    inputClassName="!resize-none"
                                    className="!m-0 !p-0 mb-2"
                                    rows={1}
                                    style={{ overflow: 'hidden' }}
                                />
                                {/* Buttons */}
                                <div className="flex">
                                    <Button className="text-xs mr-2" rounded onClick={() => handleSaveQuestion(academyType.id, question.id, question.question)}>
                                        Save
                                    </Button>
                                    <Button className="text-xs ml-0" rounded onClick={() => handleDeleteQuestion(question.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </List>
                    ))}

                    {/* Add New Question */}
                    <List className="!mt-4 !p-0">
                        <ListInput
                            label="Add New Question"
                            type="textarea"
                            outline
                            placeholder="Add a new question"
                            value={selectedTypeId === academyType.id ? newQuestion : ''}
                            onChange={(e) => {
                                setNewQuestion(e.target.value)
                                setSelectedTypeId(academyType.id)
                            }}
                            onInput={autoResize}
                            inputClassName="!resize-none"
                            className="!m-0 !p-0"
                            rows={1}
                            style={{ overflow: 'hidden' }}
                        />
                    </List>
                    <div className="flex mt-2">
                        <Button className="!w-1/2 mr-2 text-xs" rounded onClick={() => handleAddQuestion(academyType.id)}>
                            Add Question
                        </Button>
                        <Button className="!w-1/2 ml-2 text-xs" outline rounded onClick={() => handleDeleteAcademyType(academyType.id)}>
                            Delete Type
                        </Button>
                    </div>
                </Card>
            ))}

            {/* Notification Component */}
            <Notification
                className="fixed top-0 left-0 z-50 border"
                opened={notificationOpen}
                icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
                title="Notification"
                text={notificationText}
                button={<Button onClick={() => setNotificationOpen(false)}>Close</Button>}
                onClose={() => setNotificationOpen(false)}
            />

            {/* Confirm Delete Popover */}
            <Popover
                opened={confirmDeleteOpen}
                onBackdropClick={() => setConfirmDeleteOpen(false)}
                angle
                className="fixed inset-0 flex items-center justify-center z-50"
            >
                <Block className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg max-w-sm w-full">
                    <h3 className="text-lg font-bold mb-4 text-center">{confirmDeleteTypeId ? 'Delete Academy Type' : 'Delete Question'}</h3>
                    <p className="mb-4 text-center">
                        {confirmDeleteTypeId
                            ? 'Are you sure you want to delete this academy type? This action is irreversible!'
                            : 'Are you sure you want to delete this question?'}
                    </p>
                    <div className="flex justify-center">
                        <Button
                            onClick={confirmDeleteTypeId ? confirmDeleteAcademyType : confirmDeleteQuestion}
                            className="bg-red-600 rounded-full mr-2 !text-xs"
                        >
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

export default AcademyTypePage
