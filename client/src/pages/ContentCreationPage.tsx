// src/pages/ContentCreationPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, List, ListInput, Button, Notification, Card, BlockTitle } from 'konsta/react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import useContentStore from '../store/useContentStore'
import bunnyLogo from '../images/bunny-mascot.png'
import useCategoryChainStore from '../store/useCategoryChainStore'

const ContentCreationPage: React.FC = () => {
    const navigate = useNavigate()
    const { contentType, setContentType, podcastData, educatorData, tutorialData, setField, submitContent, resetContentData } = useContentStore()

    const { categories: categoryList = [], chains: chainList = [], fetchCategoriesAndChains } = useCategoryChainStore()

    const [notificationOpen, setNotificationOpen] = useState(false)
    const [notificationText, setNotificationText] = useState('')

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
            return file
        }
        return null
    }

    const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const target = e.target as HTMLTextAreaElement
        target.style.height = 'auto'
        target.style.height = `${target.scrollHeight}px`
    }

    const handleSubmit = async () => {
        try {
            await submitContent()
            resetContentData()
            setNotificationText(`${contentType} created successfully`)
            setNotificationOpen(true)
            navigate('/content-list', { state: { notificationType: 'create' } })
        } catch (error) {
            console.error(`Error creating ${contentType.toLowerCase()}:`, error)
            setNotificationText(`Failed to create ${contentType}`)
            setNotificationOpen(true)
        }
    }

    // Function to remove a category
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

    // Function to remove a chain
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

    const renderPodcastForm = () => (
        <Card key="podcast-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle> Create Podcast </BlockTitle>
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
                {/* Category Selection */}
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
                {/* Chain Selection */}
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
                <Button onClick={() => setContentType(null)} className="w-1/2 bg-gray-500 text-white rounded-full mr-2" large raised>
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    Submit Podcast
                </Button>
            </div>
        </Card>
    )

    const renderEducatorForm = () => (
        <Card key="educator-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle> Create Educator </BlockTitle>
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
                <ListInput
                    label="YouTube URL"
                    type="url"
                    outline
                    placeholder="Enter YouTube URL"
                    value={educatorData.youtubeUrl}
                    onChange={(e) => setField('youtubeUrl', e.target.value)}
                />
                <ListInput
                    label="Twitter URL"
                    type="url"
                    outline
                    placeholder="Enter Twitter URL"
                    value={educatorData.twitterUrl}
                    onChange={(e) => setField('twitterUrl', e.target.value)}
                />
                <ListInput
                    label="Telegram URL"
                    type="url"
                    outline
                    placeholder="Enter Telegram URL"
                    value={educatorData.telegramUrl}
                    onChange={(e) => setField('telegramUrl', e.target.value)}
                />
                <ListInput
                    label="Discord URL"
                    type="url"
                    outline
                    placeholder="Enter Discord URL"
                    value={educatorData.discordUrl}
                    onChange={(e) => setField('discordUrl', e.target.value)}
                />
                {/* Category Selection */}
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
                {/* Chain Selection */}
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
                <Button onClick={() => setContentType(null)} className="w-1/2 bg-gray-500 text-white rounded-full mr-2" large raised>
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    Submit Educator
                </Button>
            </div>
        </Card>
    )

    const renderTutorialForm = () => (
        <Card key="tutorial-form" className="!mb-4 !p-4 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <BlockTitle> Create Tutorial </BlockTitle>
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
                {/* Category Selection */}
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
                {/* Chain Selection */}
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
                <Button onClick={() => setContentType(null)} className="w-1/2 bg-gray-500 text-white rounded-full mr-2" large raised>
                    Back
                </Button>
                <Button onClick={handleSubmit} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
                    Submit Tutorial
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
                onClick={() => setContentType('Podcast')}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Podcast' ? 'bg-brand-primary text-white' : ''}`}
            >
                Podcast
            </Button>
            <Button
                outline={contentType !== 'Educator'}
                onClick={() => setContentType('Educator')}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Educator' ? 'bg-brand-primary text-white' : ''}`}
            >
                Educator
            </Button>
            <Button
                outline={contentType !== 'Tutorial'}
                onClick={() => setContentType('Tutorial')}
                raised
                className={`w-1/3 rounded-full ${contentType === 'Tutorial' ? 'bg-brand-primary text-white' : ''}`}
            >
                Tutorial
            </Button>
        </div>
    )

    return (
        <Page>
            <Navbar />
            <Sidebar />

            <div className="p-4">
                {/* Content Type Tabs */}
                {renderContentTypeTabs()}

                {/* Content Forms */}
                {renderContentForm()}

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
            </div>
        </Page>
    )
}

export default ContentCreationPage
