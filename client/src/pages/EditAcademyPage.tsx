// client/src/pages/EditAcademyPage.tsx

import React, { useState, useEffect } from 'react'
import { Page, Block, List, ListInput, Button, Card } from 'konsta/react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/Sidebar'
import Spinner from '../components/Spinner'
import axios from '../api/axiosInstance'
import useCategoryChainStore from '../store/useCategoryChainStore'
import useAcademyStore from '../store/useAcademyStore'

const EditAcademyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const { categories: categoryList, chains: chainList, fetchCategoriesAndChains } = useCategoryChainStore()

    const {
        name,
        ticker,
        categories,
        chains,
        twitter,
        telegram,
        discord,
        coingecko,
        dexScreener, // Added dexScreener
        contractAddress, // Added contractAddress
        logo,
        coverPhoto,
        webpageUrl,
        initialAnswers,
        raffles,
        quests,
        updateAcademy,
        setField,
        setInitialAnswer,
        toggleCorrectAnswer,
        addRaffle,
        removeRaffle,
        addQuest,
        removeQuest,
        setPrefilledAcademyData,
        resetAcademyData,
        academyTypeId // Added to get the academy type
    } = useAcademyStore()

    const [loading, setLoading] = useState(true)
    const [logoFile, setLogoFile] = useState<File | null>(null) // Local state for file handling
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null) // Local state for file handling
    const [academyTypes, setAcademyTypes] = useState<any[]>([]) // State for academy types
    const [selectedAcademyType, setSelectedAcademyType] = useState<any>(null) // State for selected academy type

    useEffect(() => {
        const fetchAcademyData = async () => {
            try {
                setLoading(true)
                const response = await axios.get(`/api/academies/${id}`)
                setPrefilledAcademyData(response.data)
            } catch (error) {
                console.error('Error fetching academy data:', error)
                // Handle the error, perhaps redirect or show a message
                if (error.response && error.response.status === 403) {
                    // User is not authorized to access this academy
                    alert('You are not authorized to access this academy.')
                    navigate('/my-academies') // Redirect to another page
                } else {
                    alert('An error occurred while fetching the academy data.')
                }
            } finally {
                setLoading(false)
            }
        }

        fetchAcademyData()
        fetchCategoriesAndChains()
        fetchAcademyTypes()

        return () => {
            resetAcademyData()
            console.log('Academy store reset after leaving EditAcademyPage.')
        }
    }, [id])

    const fetchAcademyTypes = async () => {
        try {
            const response = await axios.get('/api/academy-types')
            setAcademyTypes(response.data)
        } catch (error) {
            console.error('Error fetching academy types:', error)
        }
    }

    useEffect(() => {
        // After academyTypes and academyTypeId are loaded, set the selectedAcademyType
        if (academyTypes.length > 0 && academyTypeId) {
            const type = academyTypes.find((type: any) => type.id === academyTypeId)
            setSelectedAcademyType(type)
        }
    }, [academyTypes, academyTypeId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        )
    }

    const handleFileChange = (field: 'logo' | 'coverPhoto', file: File | null) => {
        if (field === 'logo') {
            setLogoFile(file) // Update local state
        } else {
            setCoverPhotoFile(file) // Update local state
        }
    }

    const constructImageUrl = (url: string) => {
        return `https://subscribes.lt/${url}`
    }

    const handleSubmit = async () => {
        try {
            if (id) {
                await updateAcademy(parseInt(id, 10), logoFile, coverPhotoFile)
            } else {
                console.error('No academy ID found for updating.')
            }
            console.log('Academy updated successfully.')
            navigate('/my-academies')
        } catch (error) {
            console.error('Error updating academy:', error)
        }
    }

    const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    const removeCategory = (index: number) => {
        setField(
            'categories',
            categories.filter((_, i) => i !== index)
        )
    }

    const removeChain = (index: number) => {
        setField(
            'chains',
            chains.filter((_, i) => i !== index)
        )
    }

    const renderInitialQuestionSlide = (questionIndex: number) => {
        const question = initialAnswers[questionIndex]
        if (!question) return null

        // Check if this is the "Tokenomics details" question
        if (question.question === 'Tokenomics details') {
            // Parse the tokenomics data from the answer field
            const tokenomics = question.answer ? JSON.parse(question.answer) : {}

            return (
                <Card
                    key={`initial-question-${questionIndex}`}
                    className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600"
                >
                    <h2 className="text-lg font-bold mb-4">Tokenomics Details</h2>
                    <List>
                        <ListInput
                            label="Total Supply"
                            type="text"
                            value={tokenomics.totalSupply || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, totalSupply: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="Utility"
                            type="text"
                            value={tokenomics.utility || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, utility: e.target.value }))}
                            outline
                        />
                        <ListInput
                            label="Logic"
                            type="text"
                            value={tokenomics.logic || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, logic: e.target.value }))}
                            outline
                        />
                        {/* CoinGecko Link */}
                        <ListInput
                            label="CoinGecko Link"
                            type="url"
                            outline
                            value={tokenomics.coingecko || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, coingecko: e.target.value }))}
                        />
                        {/* DexScreener Link */}
                        <ListInput
                            label="DexScreener Link"
                            type="url"
                            outline
                            value={tokenomics.dexScreener || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, dexScreener: e.target.value }))}
                        />
                        {/* Contract Address */}
                        <ListInput
                            label="Contract Address"
                            type="text"
                            outline
                            value={tokenomics.contractAddress || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'answer', JSON.stringify({ ...tokenomics, contractAddress: e.target.value }))}
                        />
                        {/* Chain Selection */}
                        <ListInput
                            label="Add Chain"
                            inputClassName="!bg-gray-800 !text-white"
                            type="select"
                            onChange={(e) => setField('chains', [...chains, e.target.value])}
                            value=""
                            outline
                        >
                            <option value="">Select Chain</option>
                            {chainList.map((chain) => (
                                <option key={chain.id} value={chain.name}>
                                    {chain.name}
                                </option>
                            ))}
                        </ListInput>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {chains.map((chain, index) => (
                                <div key={index} className="relative">
                                    <span onClick={() => removeChain(index)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg">
                                        {chain}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* Rest of the fields */}
                        <ListInput
                            label={`Quiz Question ${questionIndex + 1}`}
                            type="textarea"
                            value={question.quizQuestion || ''}
                            onChange={(e) => {
                                setInitialAnswer(questionIndex, 'quizQuestion', e.target.value)
                                autoresize(e)
                            }}
                            outline
                        />
                        {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className="flex items-center">
                                <ListInput
                                    label={`Choice ${choiceIndex + 1}`}
                                    type="textarea"
                                    value={choice.answer || ''}
                                    onChange={(e) =>
                                        setInitialAnswer(questionIndex, 'choices', {
                                            index: choiceIndex,
                                            choice: { ...choice, answer: e.target.value }
                                        })
                                    }
                                    outline
                                />
                                <input
                                    type="radio"
                                    checked={choice.correct || false}
                                    onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
                                    className="custom-radio ml-2"
                                />
                            </div>
                        ))}
                        <ListInput
                            label="Video URL"
                            type="url"
                            value={question.video || ''}
                            onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
                            outline
                        />
                        {question.video && (
                            <iframe
                                title={`video-${questionIndex}`}
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${question.video}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        )}
                    </List>
                </Card>
            )
        }

        return (
            <Card
                key={`initial-question-${questionIndex}`}
                className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600"
            >
                <h2 className="text-lg font-bold mb-4">Initial Question {questionIndex + 1}</h2>
                <List>
                    <div className="mb-4">
                        <label className="block text-gray-700">Question {questionIndex + 1}</label>
                        <p className="text-gray-500">{question.question}</p>
                    </div>
                    <ListInput
                        label={`Answer ${questionIndex + 1}`}
                        type="textarea"
                        value={question.answer || ''}
                        onChange={(e) => {
                            setInitialAnswer(questionIndex, 'answer', e.target.value)
                            autoresize(e)
                        }}
                        outline
                    />
                    <ListInput
                        label={`Quiz Question ${questionIndex + 1}`}
                        type="textarea"
                        value={question.quizQuestion || ''}
                        onChange={(e) => {
                            setInitialAnswer(questionIndex, 'quizQuestion', e.target.value)
                            autoresize(e)
                        }}
                        outline
                    />
                    {question.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="flex items-center">
                            <ListInput
                                label={`Choice ${choiceIndex + 1}`}
                                type="textarea"
                                value={choice.answer || ''}
                                onChange={(e) =>
                                    setInitialAnswer(questionIndex, 'choices', {
                                        index: choiceIndex,
                                        choice: { ...choice, answer: e.target.value }
                                    })
                                }
                                outline
                            />
                            <input
                                type="radio"
                                checked={choice.correct || false}
                                onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
                                className="custom-radio ml-2"
                            />
                        </div>
                    ))}
                    <ListInput
                        label="Video URL"
                        type="url"
                        value={question.video || ''}
                        onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
                        outline
                    />
                    {question.video && (
                        <iframe
                            title={`video-${questionIndex}`}
                            width="100%"
                            height="315"
                            src={`https://www.youtube.com/embed/${question.video}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    )}
                </List>
            </Card>
        )
    }

    const renderAcademyDetailsSlide = () => (
        <Card key="academy-details-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Academy Details</h2>
            <List>
                <ListInput label="Protocol Name" type="text" value={name} onChange={(e) => setField('name', e.target.value)} outline />
                <ListInput label="Ticker" type="text" value={ticker} onChange={(e) => setField('ticker', e.target.value)} outline />
                <ListInput label="Webpage URL" type="url" value={webpageUrl} onChange={(e) => setField('webpageUrl', e.target.value)} outline />

                {/* Conditional fields for 'Meme' type */}
                {selectedAcademyType && selectedAcademyType.name === 'Meme' && (
                    <>
                        {/* Chain Selection */}
                        <ListInput
                            label="Add Chain"
                            type="select"
                            outline
                            onChange={(e) => {
                                if (e.target.value) {
                                    setField('chains', [...(chains || []), e.target.value])
                                }
                            }}
                            value=""
                            placeholder="Select Chain"
                            inputClassName="!bg-[#1c1c1d] !text-white !m-1"
                        >
                            <option value="" className="!text-black">
                                Select Chain
                            </option>
                            {(chainList || []).map((chain) => (
                                <option key={chain.id} value={chain.name}>
                                    {chain.name}
                                </option>
                            ))}
                        </ListInput>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {(chains || []).map((chain, index) => (
                                <div key={index} className="relative">
                                    <span onClick={() => removeChain(index)} className="bg-green-200 dark:bg-green-600 px-2 py-1 rounded-lg cursor-pointer">
                                        {chain}
                                    </span>
                                </div>
                            ))}
                        </div>
                        {/* DexScreener Link */}
                        <ListInput
                            label="DexScreener Link"
                            type="url"
                            outline
                            placeholder="Enter DexScreener Link"
                            value={dexScreener}
                            onChange={(e) => {
                                setField('dexScreener', e.target.value)
                            }}
                        />
                        {/* Contract Address */}
                        <ListInput
                            label="Contract Address"
                            type="text"
                            outline
                            placeholder="Enter Contract Address"
                            value={contractAddress}
                            onChange={(e) => {
                                setField('contractAddress', e.target.value)
                            }}
                        />
                    </>
                )}

                <div className="relative mb-4">
                    <label className="block font-medium mb-2">Upload Logo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)} />
                    {logo && (
                        <div className="relative mt-2">
                            <img
                                src={logoFile ? URL.createObjectURL(logoFile) : constructImageUrl(logo)}
                                alt="Logo Preview"
                                className="w-32 h-32 object-cover rounded-full"
                            />
                            <Button className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full !w-7 !m-1" onClick={() => setField('logo', null)}>
                                &times;
                            </Button>
                        </div>
                    )}
                </div>
                <div className="relative mb-10">
                    <label className="block font-medium mb-2">Upload Cover Photo</label>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)} />
                    {coverPhoto && (
                        <div className="relative mt-2 !rounded-2xl">
                            <img
                                src={coverPhotoFile ? URL.createObjectURL(coverPhotoFile) : constructImageUrl(coverPhoto)}
                                alt="Cover Photo Preview"
                                className="w-full h-48 object-cover rounded-2xl"
                            />
                            <Button
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full !w-7 !m-1"
                                onClick={() => setField('coverPhoto', null)}
                            >
                                &times;
                            </Button>
                        </div>
                    )}
                </div>
                <ListInput
                    label="Add Category"
                    type="select"
                    onChange={(e) => setField('categories', [...categories, e.target.value])}
                    value=""
                    placeholder="Select Category"
                    outline
                >
                    <option value="">Select Category</option>
                    {categoryList.map((category) => (
                        <option key={category.id} value={category.name}>
                            {category.name}
                        </option>
                    ))}
                </ListInput>
                <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map((category, index) => (
                        <div key={index} className="relative">
                            <span onClick={() => removeCategory(index)} className="bg-blue-200 dark:bg-blue-600 px-2 py-1 rounded-lg">
                                {category}
                            </span>
                        </div>
                    ))}
                </div>
            </List>
        </Card>
    )

    const renderSocialLinksSlide = () => (
        <Card key="social-links-slide" className="!mb-2 !p-0 !rounded-2xl shadow-lg !mx-4 relative border border-gray-300 dark:border-gray-600">
            <h2 className="text-lg font-bold mb-4">Social Links</h2>
            <List>
                <ListInput label="Twitter" type="url" value={twitter} onChange={(e) => setField('twitter', e.target.value)} outline />
                <ListInput label="Telegram" type="url" value={telegram} onChange={(e) => setField('telegram', e.target.value)} outline />
                <ListInput label="Discord" type="url" value={discord} onChange={(e) => setField('discord', e.target.value)} outline />
                <ListInput label="CoinGecko" type="url" value={coingecko} onChange={(e) => setField('coingecko', e.target.value)} outline />
            </List>
        </Card>
    )

    // Render all initial question slides
    const slides = [
        renderAcademyDetailsSlide(),
        renderSocialLinksSlide(),
        ...initialAnswers.map((_, index) => renderInitialQuestionSlide(index)) // Ensure all questions are rendered
        // Other slides like raffles and quests can be added here if needed
    ]

    return (
        <Page>
            <Navbar />
            <Sidebar />
            {slides.map((slide, index) => (
                <div key={index}>{slide}</div>
            ))}
            <Button onClick={handleSubmit} large raised className="!w-[86%] bg-brand-primary text-white rounded-full mx-auto my-4">
                Save Academy
            </Button>
        </Page>
    )
}

export default EditAcademyPage
