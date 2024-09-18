import React, { useState, useEffect } from 'react'
import axios from '../api/axiosInstance'
import { Card, Button, List, ListInput, Page, BlockTitle, Block } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'

const AcademyTypePage = () => {
    interface AcademyType {
        id: string | number
        name: string
        description: string
        initialQuestions: { id: string | number; question: string }[]
    }

    const [academyTypes, setAcademyTypes] = useState<AcademyType[]>([])
    const [newAcademyType, setNewAcademyType] = useState<Pick<AcademyType, 'name' | 'description'>>({ name: '', description: '' })
    const [newQuestion, setNewQuestion] = useState('')
    const [selectedTypeId, setSelectedTypeId] = useState<string | number | null>(null)

    useEffect(() => {
        fetchAcademyTypes()
    }, [])

    const fetchAcademyTypes = async () => {
        console.log('Fetching academy types...')
        try {
            const response = await axios.get('/api/academy-types')
            console.log('Academy types fetched:', response.data)
            setAcademyTypes(response.data)
        } catch (error) {
            console.error('Error fetching academy types:', error)
        }
    }

    const handleCreateAcademyType = async () => {
        console.log('Creating academy type...')
        try {
            const response = await axios.post('/api/academy-types', newAcademyType)
            console.log('Academy type created:', response.data)
            fetchAcademyTypes()
            setNewAcademyType({ name: '', description: '' })
        } catch (error) {
            console.error('Error creating academy type:', error)
        }
    }

    const handleAddQuestion = async (typeId: string | number) => {
        console.log('Adding initial question to academy type ID:', typeId)
        try {
            const response = await axios.post(`/api/academy-types/${typeId}/questions`, { question: newQuestion })
            console.log('Initial question added:', response.data)
            fetchAcademyTypes()
            setNewQuestion('')
            setSelectedTypeId(null)
        } catch (error) {
            console.error('Error adding initial question:', error)
        }
    }

    const handleDeleteAcademyType = async (typeId: string | number) => {
        console.log('Deleting academy type ID:', typeId)
        try {
            await axios.delete(`/api/academy-types/${typeId}`)
            console.log('Academy type deleted')
            fetchAcademyTypes()
        } catch (error) {
            console.error('Error deleting academy type:', error)
        }
    }

    const handleDeleteQuestion = async (questionId: string | number) => {
        console.log('Deleting question ID:', questionId)
        try {
            await axios.delete(`/api/academy-types/questions/${questionId}`)
            console.log('Question deleted')
            fetchAcademyTypes()
        } catch (error) {
            console.error('Error deleting question:', error)
        }
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

            <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <h2 className="text-lg text-center">Create New Academy Type</h2>
                <List>
                    <ListInput
                        label="Name"
                        type="text"
                        outline
                        placeholder="Academy Type Name"
                        value={newAcademyType.name}
                        onChange={(e) => setNewAcademyType({ ...newAcademyType, name: e.target.value })}
                    />
                    <ListInput
                        label="Description"
                        type="text"
                        outline
                        placeholder="Description"
                        value={newAcademyType.description}
                        onChange={(e) => setNewAcademyType({ ...newAcademyType, description: e.target.value })}
                    />
                </List>
                <Button rounded onClick={handleCreateAcademyType}>
                    Create Academy Type
                </Button>
            </Card>

            {academyTypes.map((academyType) => (
                <Card className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600" key={academyType.id}>
                    <h2 className="text-lg mb-2">
                        Type Name: <strong>{academyType.name}</strong>
                    </h2>
                    <p>
                        Description: <strong>{academyType.description}</strong>
                    </p>

                    <h3 className="text-center font-bold mt-4">Initial Questions</h3>

                    {academyType.initialQuestions.map((question) => (
                        <List className="!m-0 !p-0" key={question.id}>
                            <div className="flex justify-between items-center">
                                <ListInput
                                    type="text"
                                    outline
                                    placeholder="Edit question"
                                    value={question.question}
                                    className="!m-0 !p-0"
                                    // Optionally, add an onChange handler to support editing
                                />
                                <div className="flex justify-center items-center">
                                    <Button className="text-xs" rounded onClick={() => handleDeleteQuestion(question.id)}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </List>
                    ))}

                    <List>
                        <ListInput
                            type="text"
                            outline
                            placeholder="Add a new question"
                            value={selectedTypeId === academyType.id ? newQuestion : ''}
                            onChange={(e) => {
                                setNewQuestion(e.target.value)
                                setSelectedTypeId(academyType.id)
                            }}
                        />
                    </List>
                    <div className="flex">
                        <Button className="!w-1/2 mr-2 text-xs" rounded onClick={() => handleAddQuestion(academyType.id)}>
                            Add Question
                        </Button>
                        <Button className="!w-1/2 ml-2 text-xs" outline rounded onClick={() => handleDeleteAcademyType(academyType.id)}>
                            Delete Type
                        </Button>
                    </div>
                </Card>
            ))}
        </Page>
    )
}

export default AcademyTypePage
