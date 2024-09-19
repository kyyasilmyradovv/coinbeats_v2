// CategoryChainManagementPage.tsx

import React, { useState, useEffect } from 'react'
import axios from '../api/axiosInstance'
import { Card, Button, List, ListInput, Page, BlockTitle, Block, Notification, Popover } from 'konsta/react'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import bunnyLogo from '../images/bunny-mascot.png'

const CategoryChainManagementPage = () => {
    // State for categories
    interface Category {
        id: number
        name: string
    }

    interface Chain {
        id: number
        name: string
    }

    const [categories, setCategories] = useState<Category[]>([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

    // State for chains
    const [chains, setChains] = useState<Chain[]>([])
    const [newChainName, setNewChainName] = useState('')
    const [chainToEdit, setChainToEdit] = useState<Chain | null>(null)

    // Notifications
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')

    // Confirm delete popover
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const [confirmDeleteType, setConfirmDeleteType] = useState('') // 'category' or 'chain'
    const [itemToDeleteId, setItemToDeleteId] = useState(null)

    useEffect(() => {
        fetchCategories()
        fetchChains()
    }, [])

    // Fetch categories
    const fetchCategories = async () => {
        console.log('Fetching categories...')
        try {
            const response = await axios.get('/api/categories')
            console.log('Categories fetched:', response.data)
            setCategories(response.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
            setNotificationText('Error fetching categories.')
            setNotificationOpen(true)
        }
    }

    // Fetch chains
    const fetchChains = async () => {
        console.log('Fetching chains...')
        try {
            const response = await axios.get('/api/chains')
            console.log('Chains fetched:', response.data)
            setChains(response.data)
        } catch (error) {
            console.error('Error fetching chains:', error)
            setNotificationText('Error fetching chains.')
            setNotificationOpen(true)
        }
    }

    // Handlers for categories
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setNotificationText('Category name cannot be empty.')
            setNotificationOpen(true)
            return
        }
        console.log('Creating category...')
        try {
            const response = await axios.post('/api/categories', { name: newCategoryName })
            console.log('Category created:', response.data)
            setNotificationText('Category created successfully.')
            setNotificationOpen(true)
            fetchCategories()
            setNewCategoryName('')
        } catch (error) {
            console.error('Error creating category:', error)
            setNotificationText('Failed to create category.')
            setNotificationOpen(true)
        }
    }

    const handleEditCategory = (categoryId: number, newName: string) => {
        setCategories((prevCategories) => prevCategories.map((category) => (category.id === categoryId ? { ...category, name: newName } : category)))
    }

    const handleSaveCategory = async (categoryId: number, name: string) => {
        if (!name.trim()) {
            setNotificationText('Category name cannot be empty.')
            setNotificationOpen(true)
            return
        }
        console.log('Saving category...')
        try {
            const response = await axios.put(`/api/categories/${categoryId}`, { name })
            console.log('Category updated:', response.data)
            setNotificationText('Category updated successfully.')
            setNotificationOpen(true)
            fetchCategories()
        } catch (error) {
            console.error('Error updating category:', error)
            setNotificationText('Failed to update category.')
            setNotificationOpen(true)
        }
    }

    const handleDeleteCategory = (categoryId: number) => {
        console.log('Preparing to delete category ID:', categoryId)
        setConfirmDeleteType('category')
        setItemToDeleteId(categoryId)
        setConfirmDeleteOpen(true)
    }

    // Similar handlers for chains

    const handleCreateChain = async () => {
        if (!newChainName.trim()) {
            setNotificationText('Chain name cannot be empty.')
            setNotificationOpen(true)
            return
        }
        console.log('Creating chain...')
        try {
            const response = await axios.post('/api/chains', { name: newChainName })
            console.log('Chain created:', response.data)
            setNotificationText('Chain created successfully.')
            setNotificationOpen(true)
            fetchChains()
            setNewChainName('')
        } catch (error) {
            console.error('Error creating chain:', error)
            setNotificationText('Failed to create chain.')
            setNotificationOpen(true)
        }
    }

    const handleEditChain = (chainId: number, newName: string) => {
        setChains((prevChains) => prevChains.map((chain) => (chain.id === chainId ? { ...chain, name: newName } : chain)))
    }

    const handleSaveChain = async (chainId: number, name: string) => {
        if (!name.trim()) {
            setNotificationText('Chain name cannot be empty.')
            setNotificationOpen(true)
            return
        }
        console.log('Saving chain...')
        try {
            const response = await axios.put(`/api/chains/${chainId}`, { name })
            console.log('Chain updated:', response.data)
            setNotificationText('Chain updated successfully.')
            setNotificationOpen(true)
            fetchChains()
        } catch (error) {
            console.error('Error updating chain:', error)
            setNotificationText('Failed to update chain.')
            setNotificationOpen(true)
        }
    }

    const handleDeleteChain = (chainId: number) => {
        console.log('Preparing to delete chain ID:', chainId)
        setConfirmDeleteType('chain')
        setItemToDeleteId(chainId)
        setConfirmDeleteOpen(true)
    }

    // Confirm delete
    const confirmDeleteItem = async () => {
        if (itemToDeleteId !== null) {
            try {
                if (confirmDeleteType === 'category') {
                    console.log('Deleting category ID:', itemToDeleteId)
                    await axios.delete(`/api/categories/${itemToDeleteId}`)
                    setNotificationText('Category deleted successfully.')
                    fetchCategories()
                } else if (confirmDeleteType === 'chain') {
                    console.log('Deleting chain ID:', itemToDeleteId)
                    await axios.delete(`/api/chains/${itemToDeleteId}`)
                    setNotificationText('Chain deleted successfully.')
                    fetchChains()
                }
                setNotificationOpen(true)
            } catch (error) {
                console.error('Error deleting item:', error)
                setNotificationText('Failed to delete item.')
                setNotificationOpen(true)
            } finally {
                setConfirmDeleteOpen(false)
                setItemToDeleteId(null)
                setConfirmDeleteType('')
            }
        }
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />
            <div className="text-center flex w-full items-center justify-center !mt-6 !mb-4">
                <BlockTitle large className="!m-0">
                    Category and Chain Management
                </BlockTitle>
            </div>

            {/* Category Management Card */}
            <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <h2 className="text-lg text-center">Manage Categories</h2>
                {/* Create New Category */}
                <List className="!mb-4">
                    <ListInput
                        label="New Category Name"
                        type="text"
                        outline
                        placeholder="Enter category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="!m-0 !p-0"
                    />
                </List>
                <Button rounded onClick={handleCreateCategory}>
                    Create Category
                </Button>

                {/* List of Categories */}
                {categories.map((category) => (
                    <List className="!mt-4" key={category.id}>
                        <ListInput
                            label="Category Name"
                            type="text"
                            outline
                            value={category.name}
                            onChange={(e) => handleEditCategory(category.id, e.target.value)}
                            className="!m-0 !p-0"
                        />
                        <div className="flex mt-2">
                            <Button className="!w-1/2 mr-2 text-xs" rounded onClick={() => handleSaveCategory(category.id, category.name)}>
                                Save
                            </Button>
                            <Button className="!w-1/2 ml-2 text-xs" outline rounded onClick={() => handleDeleteCategory(category.id)}>
                                Delete
                            </Button>
                        </div>
                    </List>
                ))}
            </Card>

            {/* Chain Management Card */}
            <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
                <h2 className="text-lg text-center">Manage Chains</h2>
                {/* Create New Chain */}
                <List className="!mb-4">
                    <ListInput
                        label="New Chain Name"
                        type="text"
                        outline
                        placeholder="Enter chain name"
                        value={newChainName}
                        onChange={(e) => setNewChainName(e.target.value)}
                        className="!m-0 !p-0"
                    />
                </List>
                <Button rounded onClick={handleCreateChain}>
                    Create Chain
                </Button>

                {/* List of Chains */}
                {chains.map((chain) => (
                    <List className="!mt-4" key={chain.id}>
                        <ListInput
                            label="Chain Name"
                            type="text"
                            outline
                            value={chain.name}
                            onChange={(e) => handleEditChain(chain.id, e.target.value)}
                            className="!m-0 !p-0"
                        />
                        <div className="flex mt-2">
                            <Button className="!w-1/2 mr-2 text-xs" rounded onClick={() => handleSaveChain(chain.id, chain.name)}>
                                Save
                            </Button>
                            <Button className="!w-1/2 ml-2 text-xs" outline rounded onClick={() => handleDeleteChain(chain.id)}>
                                Delete
                            </Button>
                        </div>
                    </List>
                ))}
            </Card>

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
                    <h3 className="text-lg font-bold mb-4 text-center">Delete {confirmDeleteType === 'category' ? 'Category' : 'Chain'}</h3>
                    <p className="mb-4 text-center">Are you sure you want to delete this {confirmDeleteType}? This action is irreversible!</p>
                    <div className="flex justify-center">
                        <Button onClick={confirmDeleteItem} className="bg-red-600 rounded-full mr-2 !text-xs">
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

export default CategoryChainManagementPage
