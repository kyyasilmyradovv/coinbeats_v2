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

const ContentCreationPage: React.FC = () => {
    const navigate = useNavigate()

    // Pull state & actions from store
    const {
        contentType,
        setContentType,
        podcastData,
        educatorData,
        tutorialData,
        youtubeChannelData,
        telegramGroupData,
        setField,
        submitContent,
        resetContentData
    } = useContentStore()

    // Category & chain lists
    const { categories: categoryList = [], chains: chainList = [], fetchCategoriesAndChains } = useCategoryChainStore()

    // For notifications & popovers
    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [popoverOpen, setPopoverOpen] = useState(false)
    const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null)
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

    useEffect(() => {
        fetchCategoriesAndChains()
    }, [fetchCategoriesAndChains])

    // Helper to auto-resize textarea
    const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    // Helper to handle file input
    const handleFileChange = (field: string, file: File | null) => {
        setField(field, file)
    }

    // Show image preview
    const handleImagePreview = (file: File | null | string) => {
        if (file instanceof File) {
            return URL.createObjectURL(file)
        }
        if (typeof file === 'string') {
            // If your server returns just the partial path, adjust as needed
            return file
        }
        return null
    }

    // Load items from server
    const loadItems = async () => {
        if (!contentType) return
        setLoading(true)

        // Decide which endpoint to call
        let endpoint = ''
        switch (contentType) {
            case 'Podcast':
                endpoint = '/api/content/podcasts'
                break
            case 'Educator':
                endpoint = '/api/content/educators'
                break
            case 'Tutorial':
                endpoint = '/api/content/tutorials'
                break
            case 'YoutubeChannel':
                endpoint = '/api/content/youtube-channels'
                break
            case 'TelegramGroup':
                endpoint = '/api/content/telegram-groups'
                break
            default:
                endpoint = ''
                break
        }

        if (!endpoint) {
            setItems([])
            setLoading(false)
            return
        }

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
        loadItems()
    }, [contentType])

    // Submit form for create/update
    const handleSubmit = async () => {
        try {
            await submitContent(selectedItemId)
            setNotificationText(`${contentType} ${selectedItemId ? 'updated' : 'created'} successfully`)
            setNotificationOpen(true)
            setSelectedItemId(null)
            loadItems() // reload list
        } catch (error) {
            console.error(`Error ${selectedItemId ? 'updating' : 'creating'} ${contentType}:`, error)
            setNotificationText(`Failed to ${selectedItemId ? 'update' : 'create'} ${contentType}`)
            setNotificationOpen(true)
        }
    }

    // Remove a category from the array
    const removeCategory = (index: number) => {
        if (!contentType) return
        let arr: string[] = []
        switch (contentType) {
            case 'Podcast':
                arr = [...podcastData.categories]
                break
            case 'Educator':
                arr = [...educatorData.categories]
                break
            case 'Tutorial':
                arr = [...tutorialData.categories]
                break
            case 'YoutubeChannel':
                arr = [...youtubeChannelData.categories]
                break
            case 'TelegramGroup':
                arr = [...telegramGroupData.categories]
                break
            default:
                return
        }
        arr.splice(index, 1)
        setField('categories', arr)
    }

    // Remove a chain from the array
    const removeChain = (index: number) => {
        if (!contentType) return
        let arr: string[] = []
        switch (contentType) {
            case 'Podcast':
                arr = [...podcastData.chains]
                break
            case 'Educator':
                arr = [...educatorData.chains]
                break
            case 'Tutorial':
                arr = [...tutorialData.chains]
                break
            case 'YoutubeChannel':
                arr = [...youtubeChannelData.chains]
                break
            case 'TelegramGroup':
                arr = [...telegramGroupData.chains]
                break
            default:
                return
        }
        arr.splice(index, 1)
        setField('chains', arr)
    }

    // Fill form for editing
    const fillFormForEditing = (item: any) => {
        // Reset first
        resetContentData()

        // For now, we rely on contentType to decide which form to fill
        switch (contentType) {
            case 'Podcast':
                setField('name', item.name)
                setField('description', item.description || '')
                setField('spotifyUrl', item.spotifyUrl || '')
                setField('appleUrl', item.appleUrl || '')
                setField('youtubeUrl', item.youtubeUrl || '')
                setField('logo', item.logoUrl || null)
                setField('coverPhoto', item.coverPhotoUrl || null)
                setField('categories', item.categories?.map((c: any) => c.name) || [])
                setField('chains', item.chains?.map((c: any) => c.name) || [])
                break

            case 'Educator':
                setField('name', item.name)
                setField('bio', item.bio || '')
                setField('youtubeUrl', item.youtubeUrl || '')
                setField('twitterUrl', item.twitterUrl || '')
                setField('telegramUrl', item.telegramUrl || '')
                setField('discordUrl', item.discordUrl || '')
                setField('webpageUrl', item.webpageUrl || '')
                setField('substackUrl', item.substackUrl || '')
                setField('logo', item.logoUrl || null)
                setField('coverPhoto', item.coverPhotoUrl || null)
                setField('categories', item.categories?.map((c: any) => c.name) || [])
                setField('chains', item.chains?.map((c: any) => c.name) || [])
                break

            case 'Tutorial':
                setField('title', item.title || '')
                setField('description', item.description || '')
                setField('contentUrl', item.contentUrl || '')
                setField('type', item.type || '')
                setField('logo', item.logoUrl || null)
                setField('coverPhoto', item.coverPhotoUrl || null)
                setField('categories', item.categories?.map((c: any) => c.name) || [])
                setField('chains', item.chains?.map((c: any) => c.name) || [])
                break

            case 'YoutubeChannel':
                setField('name', item.name)
                setField('description', item.description || '')
                setField('youtubeUrl', item.youtubeUrl || '')
                setField('logo', item.logoUrl || null)
                setField('coverPhoto', item.coverPhotoUrl || null)
                setField('categories', item.categories?.map((c: any) => c.name) || [])
                setField('chains', item.chains?.map((c: any) => c.name) || [])
                break

            case 'TelegramGroup':
                setField('name', item.name)
                setField('description', item.description || '')
                setField('telegramUrl', item.telegramUrl || '')
                setField('logo', item.logoUrl || null)
                setField('coverPhoto', item.coverPhotoUrl || null)
                setField('categories', item.categories?.map((c: any) => c.name) || [])
                setField('chains', item.chains?.map((c: any) => c.name) || [])
                break

            default:
                break
        }
    }

    // Popover & item actions
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

    const handleAddTasks = () => {
        if (!selectedItemId || !contentType) return
        // Now we pass both contentType & selectedItemId in the route
        navigate(`/add-content-tasks/${contentType}/${selectedItemId}`)
    }

    const handleDeleteItem = async () => {
        if (!selectedItemId || !contentType) return

        let endpoint = ''
        switch (contentType) {
            case 'Podcast':
                endpoint = `/api/content/podcasts/${selectedItemId}`
                break
            case 'Educator':
                endpoint = `/api/content/educators/${selectedItemId}`
                break
            case 'Tutorial':
                endpoint = `/api/content/tutorials/${selectedItemId}`
                break
            case 'YoutubeChannel':
                endpoint = `/api/content/youtube-channels/${selectedItemId}`
                break
            case 'TelegramGroup':
                endpoint = `/api/content/telegram-groups/${selectedItemId}`
                break
            default:
                break
        }

        if (!endpoint) return

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

    // ========== FORMS ==========

    const renderPodcastForm = () => (
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Podcast' : 'Create Podcast'}</BlockTitle>
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

                {/* Category */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...podcastData.categories, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {podcastData.categories.map((category, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeCategory(idx)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chain */}
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...podcastData.chains, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {podcastData.chains.map((chain, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeChain(idx)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logo & Cover Photo */}
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
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Educator' : 'Create Educator'}</BlockTitle>
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
                <ListInput
                    label="Webpage URL"
                    type="url"
                    outline
                    placeholder="Enter Webpage URL"
                    value={educatorData.webpageUrl}
                    onChange={(e) => setField('webpageUrl', e.target.value)}
                />
                <ListInput
                    label="Substack URL"
                    type="url"
                    outline
                    placeholder="Enter Substack URL"
                    value={educatorData.substackUrl}
                    onChange={(e) => setField('substackUrl', e.target.value)}
                />

                {/* Category */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...educatorData.categories, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {educatorData.categories.map((category, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeCategory(idx)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chain */}
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...educatorData.chains, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {educatorData.chains.map((chain, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeChain(idx)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logo & Cover Photo */}
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
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
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
                >
                    <option value="">Select Type</option>
                    <option value="WALLET_SETUP">Wallet Setup</option>
                    <option value="CEX_TUTORIAL">CEX Tutorial</option>
                    <option value="APP_TUTORIAL">App Tutorial</option>
                    <option value="RESEARCH_TUTORIAL">Research Tutorial</option>
                    <option value="OTHER">Other</option>
                </ListInput>

                {/* Category */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...tutorialData.categories, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tutorialData.categories.map((category, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeCategory(idx)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chain */}
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...tutorialData.chains, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tutorialData.chains.map((chain, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeChain(idx)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logo & Cover Photo */}
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

    // NEW: YouTube Channel form
    const renderYoutubeChannelForm = () => (
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit YouTube Channel' : 'Create YouTube Channel'}</BlockTitle>
            <List>
                <ListInput
                    label="Name"
                    type="text"
                    outline
                    placeholder="Enter Channel Name"
                    value={youtubeChannelData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                />
                <ListInput
                    label="Description"
                    type="textarea"
                    outline
                    placeholder="Enter Description"
                    inputClassName="!resize-none"
                    value={youtubeChannelData.description}
                    onChange={(e) => {
                        setField('description', e.target.value)
                        autoresize(e)
                    }}
                />
                <ListInput
                    label="YouTube URL"
                    type="url"
                    outline
                    placeholder="Enter Channel URL"
                    value={youtubeChannelData.youtubeUrl}
                    onChange={(e) => setField('youtubeUrl', e.target.value)}
                />

                {/* Category */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...youtubeChannelData.categories, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {youtubeChannelData.categories.map((category, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeCategory(idx)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chain */}
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...youtubeChannelData.chains, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {youtubeChannelData.chains.map((chain, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeChain(idx)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logo & Cover Photo */}
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {youtubeChannelData.logo && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(youtubeChannelData.logo) ?? ''} alt="Logo Preview" className="w-32 h-32 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('logo', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {youtubeChannelData.coverPhoto && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(youtubeChannelData.coverPhoto) ?? ''} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
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
                    {selectedItemId ? 'Update YouTube Channel' : 'Submit YouTube Channel'}
                </Button>
            </div>
        </Card>
    )

    // NEW: Telegram Group form
    const renderTelegramGroupForm = () => (
        <Card className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle>{selectedItemId ? 'Edit Telegram Group' : 'Create Telegram Group'}</BlockTitle>
            <List>
                <ListInput
                    label="Name"
                    type="text"
                    outline
                    placeholder="Enter Group Name"
                    value={telegramGroupData.name}
                    onChange={(e) => setField('name', e.target.value)}
                    required
                />
                <ListInput
                    label="Description"
                    type="textarea"
                    outline
                    placeholder="Enter Description"
                    inputClassName="!resize-none"
                    value={telegramGroupData.description}
                    onChange={(e) => {
                        setField('description', e.target.value)
                        autoresize(e)
                    }}
                />
                <ListInput
                    label="Telegram URL"
                    type="url"
                    outline
                    placeholder="Enter Group URL"
                    value={telegramGroupData.telegramUrl}
                    onChange={(e) => setField('telegramUrl', e.target.value)}
                />

                {/* Category */}
                <ListInput
                    label="Add Category"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('categories', [...telegramGroupData.categories, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Category"
                >
                    <option value="">Select Category</option>
                    {(categoryList || []).map((c) => (
                        <option key={c.id} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {telegramGroupData.categories.map((category, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeCategory(idx)} className="dark:bg-blue-600 bg-blue-200 px-2 py-1 rounded-lg cursor-pointer">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Chain */}
                <ListInput
                    label="Add Chain"
                    type="select"
                    outline
                    onChange={(e) => {
                        if (e.target.value) {
                            setField('chains', [...telegramGroupData.chains, e.target.value])
                        }
                    }}
                    value=""
                    placeholder="Select Chain"
                >
                    <option value="">Select Chain</option>
                    {(chainList || []).map((chain) => (
                        <option key={chain.id} value={chain.name}>
                            {chain.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {telegramGroupData.chains.map((chain, idx) => (
                        <div key={idx}>
                            <span onClick={() => removeChain(idx)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                {chain}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Logo & Cover Photo */}
                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {telegramGroupData.logo && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(telegramGroupData.logo) ?? ''} alt="Logo Preview" className="w-32 h-32 object-cover" />
                            <button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => setField('logo', null)}>
                                &times;
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {telegramGroupData.coverPhoto && (
                        <div className="relative mt-2">
                            <img src={handleImagePreview(telegramGroupData.coverPhoto) ?? ''} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
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
                    {selectedItemId ? 'Update Telegram Group' : 'Submit Telegram Group'}
                </Button>
            </div>
        </Card>
    )

    // Renders whichever form matches current contentType
    const renderContentForm = () => {
        switch (contentType) {
            case 'Podcast':
                return renderPodcastForm()
            case 'Educator':
                return renderEducatorForm()
            case 'Tutorial':
                return renderTutorialForm()
            case 'YoutubeChannel':
                return renderYoutubeChannelForm()
            case 'TelegramGroup':
                return renderTelegramGroupForm()
            default:
                return null
        }
    }

    // Renders tabs for each content type
    const renderContentTypeTabs = () => (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
            <Button
                outline={contentType !== 'Podcast'}
                onClick={() => {
                    setContentType('Podcast')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/2 rounded-full ${contentType === 'Podcast' ? 'bg-brand-primary text-white' : ''}`}
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
                className={`w-1/2 rounded-full ${contentType === 'Educator' ? 'bg-brand-primary text-white' : ''}`}
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
                className={`w-1/2 rounded-full ${contentType === 'Tutorial' ? 'bg-brand-primary text-white' : ''}`}
            >
                Tutorial
            </Button>

            {/* NEW TABS */}
            <Button
                outline={contentType !== 'YoutubeChannel'}
                onClick={() => {
                    setContentType('YoutubeChannel')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/2 rounded-full ${contentType === 'YoutubeChannel' ? 'bg-brand-primary text-white' : ''}`}
            >
                YouTube Channel
            </Button>
            <Button
                outline={contentType !== 'TelegramGroup'}
                onClick={() => {
                    setContentType('TelegramGroup')
                    setSelectedItemId(null)
                    resetContentData()
                }}
                raised
                className={`w-1/2 rounded-full ${contentType === 'TelegramGroup' ? 'bg-brand-primary text-white' : ''}`}
            >
                Telegram Group
            </Button>
        </div>
    )

    // Render the existing items list
    const renderItemsList = () => {
        if (loading) {
            return <p className="text-center">Loading {contentType?.toLowerCase()}s...</p>
        }
        if (items.length === 0) {
            return <p className="text-center">No {contentType?.toLowerCase()}s found.</p>
        }

        return items.map((item) => {
            const titleForItem = item.title || item.name
            return (
                <Block key={item.id}>
                    <Card
                        className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-2 relative border border-gray-300 dark:border-gray-600"
                        style={{
                            backgroundImage: `url(${item.coverPhotoUrl || ''})`,
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
                                {item.logoUrl && <img alt={titleForItem || ''} className="h-16 w-16 rounded-full" src={item.logoUrl} />}
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

                {/* Action Popover */}
                <Popover opened={popoverOpen} target={popoverTarget} onBackdropClick={() => setPopoverOpen(false)} onClose={() => setPopoverOpen(false)} angle>
                    <div className="text-center">
                        <List>
                            <ListButton onClick={handleEditItem}>
                                <span className="text-primary text-lg">Edit {contentType}</span>
                            </ListButton>

                            {/* NEW: Add Tasks */}
                            <ListButton
                                onClick={() => {
                                    setPopoverOpen(false)
                                    handleAddTasks()
                                }}
                            >
                                <span className="text-green-600 text-lg">Add Tasks</span>
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

                {/* Delete Confirmation Popover */}
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
