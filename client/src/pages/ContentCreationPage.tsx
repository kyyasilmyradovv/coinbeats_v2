// src/pages/ContentCreationPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, List, ListInput, Button, Notification, Card, BlockTitle, Popover, Block, ListButton } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import useContentStore from '../store/useContentStore'
import bunnyLogo from '../images/bunny-mascot.png'
import useCategoryChainStore from '../store/useCategoryChainStore'
import { Icon } from '@iconify/react'
import axios from '../api/axiosInstance'

interface ContentItem {
    id: number
    name?: string // For Podcast/Educator
    title?: string // For Tutorial
    description?: string
    spotifyUrl?: string
    appleUrl?: string
    youtubeUrl?: string
    bio?: string
    telegramUrl?: string
    twitterUrl?: string
    discordUrl?: string
    contentUrl?: string
    type?: string
    logoUrl?: string
    coverPhotoUrl?: string
    categories?: string[]
    chains?: string[]
}

const constructImageUrl = (url: string | null | undefined) => {
    if (!url) return ''
    return `https://telegram.coinbeats.xyz/${url}`
}

const ContentCreationPage: React.FC = () => {
    const navigate = useNavigate()
    const { contentType, setContentType, podcastData, educatorData, tutorialData, setField, submitContent, resetContentData } = useContentStore()

    const { categories: categoryList = [], chains: chainList = [], fetchCategoriesAndChains } = useCategoryChainStore()

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)

    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    useEffect(() => {
        fetchCategoriesAndChains()
    }, [fetchCategoriesAndChains])

    const handleFileChange = (field: string, file: File | null) => {
        setField(field, file)
    }

    const handleImagePreview = (file: File | null | string) => {
        if (file instanceof File) {
            return URL.createObjectURL(file)
        }
        if (typeof file === 'string') {
            return constructImageUrl(file)
        }
        return null
    }

    const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    const loadItems = async () => {
        if (!contentType) return
        setLoading(true)

        let endpoint = ''
        if (contentType === 'Podcast') endpoint = '/api/content/podcasts'
        if (contentType === 'Educator') endpoint = '/api/content/educators'
        if (contentType === 'Tutorial') endpoint = '/api/content/tutorials'

        try {
            const response = await axios.get(endpoint)
            setItems(response.data)
        } catch (error) {
            console.error(`Error fetching ${contentType.toLowerCase()}s:`, error)
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Load items whenever contentType changes
        loadItems()
    }, [contentType])

    const handleSubmit = async () => {
        try {
            await submitContent(selectedItemId) // pass selectedItemId to handle update vs create
            resetContentData()
            setNotificationText(`${contentType} ${selectedItemId ? 'updated' : 'created'} successfully`)
            setNotificationOpen(true)
            setSelectedItemId(null)
            loadItems() // reload items to show updated list
        } catch (error) {
            console.error(`Error ${selectedItemId ? 'updating' : 'creating'} ${contentType?.toLowerCase()}:`, error)
            setNotificationText(`Failed to ${selectedItemId ? 'update' : 'create'} ${contentType}`)
            setNotificationOpen(true)
        }
    }

    const removeCategory = (index: number) => {
        let updatedCategories = []
        if (contentType === 'Tutorial') {
            updatedCategories = tutorialData.categories.filter((_, i) => i !== index)
        } else if (contentType === 'Podcast') {
            updatedCategories = podcastData.categories.filter((_, i) => i !== index)
        } else if (contentType === 'Educator') {
            updatedCategories = educatorData.categories.filter((_, i) => i !== index)
        }
        setField('categories', updatedCategories)
    }

    const removeChain = (index: number) => {
        let updatedChains = []
        if (contentType === 'Tutorial') {
            updatedChains = tutorialData.chains.filter((_, i) => i !== index)
        } else if (contentType === 'Podcast') {
            updatedChains = podcastData.chains.filter((_, i) => i !== index)
        } else if (contentType === 'Educator') {
            updatedChains = educatorData.chains.filter((_, i) => i !== index)
        }
        setField('chains', updatedChains)
    }

    const fillFormForEditing = (item: ContentItem) => {
        // Reset form first
        resetContentData()

        // Set fields according to the current contentType
        if (contentType === 'Podcast') {
            setField('name', item.name || '')
            setField('description', item.description || '')
            setField('spotifyUrl', item.spotifyUrl || '')
            setField('appleUrl', item.appleUrl || '')
            setField('youtubeUrl', item.youtubeUrl || '')
            setField('logo', item.logoUrl || null)
            setField('coverPhoto', item.coverPhotoUrl || null)
            setField('categories', item.categories || [])
            setField('chains', item.chains || [])
        } else if (contentType === 'Educator') {
            setField('name', item.name || '')
            setField('bio', item.bio || '')
            setField('youtubeUrl', item.youtubeUrl || '')
            setField('twitterUrl', item.twitterUrl || '')
            setField('telegramUrl', item.telegramUrl || '')
            setField('discordUrl', item.discordUrl || '')
            setField('logo', item.logoUrl || null)
            setField('coverPhoto', item.coverPhotoUrl || null)
            setField('categories', item.categories || [])
            setField('chains', item.chains || [])
        } else if (contentType === 'Tutorial') {
            setField('title', item.title || '')
            setField('description', item.description || '')
            setField('contentUrl', item.contentUrl || '')
            setField('type', item.type || '')
            setField('logo', item.logoUrl || null)
            setField('coverPhoto', item.coverPhotoUrl || null)
            setField('categories', item.categories || [])
            setField('chains', item.chains || [])
        }
    }

    const openPopoverForItem = (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedItemId(id)
        setPopoverTarget(event.currentTarget)
        setPopoverOpen(true)
    }

    const handleEditItem = () => {
        if (!selectedItemId || !contentType) return
        const item = items.find((i) => i.id === selectedItemId)
        if (!item) return
        fillFormForEditing(item)
        setPopoverOpen(false)
    }

    const handleDeleteItem = async () => {
        if (!selectedItemId || !contentType) return
        let endpoint = ''
        if (contentType === 'Podcast') endpoint = `/api/content/podcasts/${selectedItemId}`
        if (contentType === 'Educator') endpoint = `/api/content/educators/${selectedItemId}`
        if (contentType === 'Tutorial') endpoint = `/api/content/tutorials/${selectedItemId}`

        try {
            await axios.delete(endpoint)
            setNotificationText(`${contentType} deleted successfully.`)
            setNotificationOpen(true)
            setItems(items.filter((i) => i.id !== selectedItemId))
        } catch (error) {
            console.error(`Error deleting ${contentType.toLowerCase()}:`, error)
            setNotificationText(`Failed to delete ${contentType}.`)
            setNotificationOpen(true)
        } finally {
            setSelectedItemId(null)
            setPopoverOpen(false)
            setConfirmDeleteOpen(false)
        }
    }

    const renderPodcastForm = () => (
        <Card key="podcast-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Podcast' : 'Create Podcast'}</BlockTitle>
            {/* Podcast form inputs here (like in the original code, omitted for brevity) */}
            {/* ...Same fields as before... */}
            <List>
                <ListInput
                    label="Name"
                    type="text"
                    outline
                    placeholder="Enter Podcast Name"
                    value={podcastData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                />
                <ListInput
                    label="Description"
                    type="textarea"
                    outline
                    placeholder="Enter Description"
                    inputClassName="!resize-none"
                    value={podcastData.description}
                    onChange={(e) => {
                        setField('description', e.target.value)
                        autoresize(e)
                    }}
                />
                <ListInput
                    label="Spotify URL"
                    type="url"
                    outline
                    placeholder="Enter Spotify URL"
                    value={podcastData.spotifyUrl}
                    onChange={(e) => setField('spotifyUrl', e.target.value)}
                />
                <ListInput
                    label="Apple URL"
                    type="url"
                    outline
                    placeholder="Enter Apple URL"
                    value={podcastData.appleUrl}
                    onChange={(e) => setField('appleUrl', e.target.value)}
                />
                <ListInput
                    label="YouTube URL"
                    type="url"
                    outline
                    placeholder="Enter YouTube URL"
                    value={podcastData.youtubeUrl}
                    onChange={(e) => setField('youtubeUrl', e.target.value)}
                />
                {/* Category & Chain selection as before */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...(podcastData.categories || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(podcastData.categories || []).map((category, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeCategory(index)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...(podcastData.chains || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(podcastData.chains || []).map((chain, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeChain(index)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {podcastData.logo && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(podcastData.logo) ?? ''} alt="Logo Preview" className="w-32 h-32 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('logo', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {podcastData.coverPhoto && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(podcastData.coverPhoto) ?? ''} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('coverPhoto', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
            </List>
            <div className="flex justify-between">
                <Button
                    onClick={() => {
                        resetContentData()
                        setSelectedItemId(null)
                    }}
                    className="w-1/2 bg-gray-500 text-white rounded-full mr-2"
                    large
                    raised
                >
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    {selectedItemId ? 'Update Podcast' : 'Submit Podcast'}
                </Button>
            </div>
        </Card>
    )

    const renderEducatorForm = () => (
        <Card key="educator-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Educator' : 'Create Educator'}</BlockTitle>
            {/* Similar form inputs for Educator as before, omitted for brevity */}
            <List>
                <ListInput
                    label="Name"
                    type="text"
                    outline
                    placeholder="Enter Educator Name"
                    value={educatorData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                />
                <ListInput
                    label="Bio"
                    type="textarea"
                    outline
                    placeholder="Enter Bio"
                    inputClassName="!resize-none"
                    value={educatorData.bio}
                    onChange={(e) => {
                        setField('bio', e.target.value)
                        autoresize(e)
                    }}
                />
                <ListInput label="YouTube URL" type="url" outline value={educatorData.youtubeUrl} onChange={(e) => setField('youtubeUrl', e.target.value)} />
                <ListInput label="Twitter URL" type="url" outline value={educatorData.twitterUrl} onChange={(e) => setField('twitterUrl', e.target.value)} />
                <ListInput label="Telegram URL" type="url" outline value={educatorData.telegramUrl} onChange={(e) => setField('telegramUrl', e.target.value)} />
                <ListInput label="Discord URL" type="url" outline value={educatorData.discordUrl} onChange={(e) => setField('discordUrl', e.target.value)} />
                {/* Category & Chain selection as similar to Podcast */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...(educatorData.categories || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(educatorData.categories || []).map((category, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeCategory(index)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...(educatorData.chains || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(educatorData.chains || []).map((chain, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeChain(index)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {educatorData.logo && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(educatorData.logo) ?? ''} alt="Logo Preview" className="w-32 h-32 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('logo', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {educatorData.coverPhoto && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(educatorData.coverPhoto) ?? ''} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('coverPhoto', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
            </List>
            <div className="flex justify-between">
                <Button
                    onClick={() => {
                        resetContentData()
                        setSelectedItemId(null)
                    }}
                    className="w-1/2 bg-gray-500 text-white rounded-full mr-2"
                    large
                    raised
                >
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    {selectedItemId ? 'Update Educator' : 'Submit Educator'}
                </Button>
            </div>
        </Card>
    )

    const renderTutorialForm = () => (
        <Card key="tutorial-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Tutorial' : 'Create Tutorial'}</BlockTitle>
            <List>
                <ListInput
                    label="Title"
                    type="text"
                    outline
                    placeholder="Enter Tutorial Title"
                    value={tutorialData.title}
                    onChange={(e) => setField('title', e.target.value)}
                    required
                />
                <ListInput
                    label="Description"
                    type="textarea"
                    outline
                    placeholder="Enter Description"
                    inputClassName="!resize-none"
                    value={tutorialData.description}
                    onChange={(e) => {
                        setField('description', e.target.value)
                        autoresize(e)
                    }}
                />
                <ListInput
                    label="Content URL"
                    type="url"
                    outline
                    placeholder="Enter Content URL"
                    value={tutorialData.contentUrl}
                    onChange={(e) => setField('contentUrl', e.target.value)}
                />
                <ListInput
                    label="Type"
                    type="select"
                    placeholder="Select Type"
                    outline
                    value={tutorialData.type}
                    onChange={(e) => setField('type', e.target.value)}
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Type</option>
                    <option value="WALLET_SETUP">Wallet Setup</option>
                    <option value="CEX_TUTORIAL">CEX Tutorial</option>
                    <option value="APP_TUTORIAL">App Tutorial</option>
                    <option value="RESEARCH_TUTORIAL">Research Tutorial</option>
                    <option value="OTHER">Other</option>
                </ListInput>
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...(tutorialData.categories || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(tutorialData.categories || []).map((category, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeCategory(index)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...(tutorialData.chains || []), e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                    inputClassName="!bg-[#1c1c1d] !text-white !m-1 !pl-2"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(tutorialData.chains || []).map((chain, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeChain(index)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {tutorialData.logo && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(tutorialData.logo) ?? ''} alt="Logo Preview" className="w-32 h-32 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('logo', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {tutorialData.coverPhoto && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(tutorialData.coverPhoto) ?? ''} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('coverPhoto', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
            </List>
            <div className="flex justify-between">
                <Button
                    onClick={() => {
                        resetContentData()
                        setSelectedItemId(null)
                    }}
                    className="w-1/2 bg-gray-500 text-white rounded-full mr-2"
                    large
                    raised
                >
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    {selectedItemId ? 'Update Tutorial' : 'Submit Tutorial'}
                </Button>
            </div>
        </Card>
    )

    const renderContentForm = () => {
        switch (contentType) {
            case 'Podcast':
                return renderPodcastForm()
            case 'Educator':
                return renderEducatorForm()
            case 'Tutorial':
                return renderTutorialForm()
            default:
                return null
        }
    }

    const renderContentTypeTabs = () => (
        <div className="flex space-x-2 mb-4 justify-center">
            <Button
                outline={contentType !== 'Podcast'}
                onClick={() => {
                    setContentType('Podcast')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Podcast' ? 'bg-brand-primary text-white' : ''}`}
            >
                Podcast
            </Button>
            <Button
                outline={contentType !== 'Educator'}
                onClick={() => {
                    setContentType('Educator')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Educator' ? 'bg-brand-primary text-white' : ''}`}
            >
                Educator
            </Button>
            <Button
                outline={contentType !== 'Tutorial'}
                onClick={() => {
                    setContentType('Tutorial')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Tutorial' ? 'bg-brand-primary text-white' : ''}`}
            >
                Tutorial
            </Button>
        </div>
    )

    const renderItemsList = () => {
        if (loading) {
            return <p className="text-center">Loading {contentType?.toLowerCase()}s...</p>
        }

        if (items.length === 0) {
            return <p className="text-center">No {contentType?.toLowerCase()}s found.</p>
        }

        return items.map((item) => {
            const titleForItem = contentType === 'Tutorial' ? item.title : item.name
            return (
                <Block key={item.id}>
                    <Card
                        className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600"
                        style={{
                            backgroundImage: `url(${constructImageUrl(item.coverPhotoUrl)})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="absolute inset-0 bg-white dark:bg-black opacity-50 rounded-xl z-0"></div>

                        <div className="relative z-10 p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-xl mb-2">{titleForItem}</h3>
                                    {item.description && <p className="text-sm">{item.description}</p>}
                                </div>
                                {item.logoUrl && <img alt={titleForItem || ''} className="h-16 w-16 rounded-full" src={constructImageUrl(item.logoUrl)} />}
                            </div>
                        </div>

                        <div className="flex justify-center w-full relative z-10">
                            <Button className="rounded-full items-center justify-center" raised onClick={(e) => openPopoverForItem(item.id, e)}>
                                Actions <Icon icon="mdi:menu-down" className="w-9 h-9 mb-1" />
                            </Button>
                        </div>
                    </Card>
                </Block>
            )
        })
    }

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="p-4">
                {/* Content Type Tabs */}
                {renderContentTypeTabs()}

                {/* Content Forms */}
                {renderContentForm()}

                {/* Display Existing Items */}
                {contentType && <BlockTitle>{contentType} List</BlockTitle>}
                {contentType && renderItemsList()}

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

                <Popover opened={popoverOpen} target={popoverTarget} onBackdropClick={() => setPopoverOpen(false)} onClose={() => setPopoverOpen(false)} angle>
                    <div className="text-center">
                        <List>
                            <ListButton onClick={handleEditItem}>
                                <span className="text-primary text-lg">Edit {contentType}</span>
                            </ListButton>
                            <ListButton
                                className="!text-red-600"
                                onClick={() => {
                                    setPopoverOpen(false)
                                    setConfirmDeleteOpen(true)
                                }}
                            >
                                <span className="text-red-500 text-lg">Delete {contentType}</span>
                            </ListButton>
                        </List>
                    </div>
                </Popover>

                <Popover
                    opened={confirmDeleteOpen}
                    target={popoverTarget}
                    onBackdropClick={() => setConfirmDeleteOpen(false)}
                    onClose={() => setConfirmDeleteOpen(false)}
                    angle
                >
                    <Block className="text-center">
                        <h3 className="text-lg font-bold mb-4">Delete {contentType}</h3>
                        <p className="mb-4">Are you sure you want to delete this {contentType?.toLowerCase()}? This action is irreversible!</p>
                        <div className="flex">
                            <Button onClick={handleDeleteItem} className="bg-red-600 rounded-full mr-2 !text-xs">
                                Yes, Delete
                            </Button>
                            <Button onClick={() => setConfirmDeleteOpen(false)} className="bg-gray-400 rounded-full !text-xs">
                                Cancel
                            </Button>
                        </div>
                    </Block>
                </Popover>
            </div>
        </Page>
    )
}

export default ContentCreationPage
