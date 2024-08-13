import React, { useState, useEffect } from 'react';
import {
  Page,
  Block,
  List,
  ListInput,
  Button,
} from 'konsta/react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import axios from '../api/axiosInstance';
import useCategoryChainStore from '../store/useCategoryChainStore';
import useAcademyStore from '../store/useAcademyStore';

const EditAcademyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    categories: categoryList,
    chains: chainList,
    fetchCategoriesAndChains,
  } = useCategoryChainStore();

  const {
    name,
    ticker,
    categories,
    chains,
    twitter,
    telegram,
    discord,
    coingecko,
    logo,
    coverPhoto,
    webpageUrl,
    initialAnswers,
    raffles,
    quests,
    setField,
    setInitialAnswer,
    toggleCorrectAnswer,
    addRaffle,
    removeRaffle,
    addQuest,
    removeQuest,
    submitAcademy,
    setPrefilledAcademyData,
  } = useAcademyStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcademyData = async () => {
      try {
        const response = await axios.get(`/api/academies/${id}`);
        setPrefilledAcademyData(response.data);
      } catch (error) {
        console.error('Error fetching academy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndChains();
    fetchAcademyData();
  }, [id, fetchCategoriesAndChains, setPrefilledAcademyData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleFileChange = (field: string, file: File | null) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setField(field, e.target.result);
      }
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setField(field, null);
    }
  };

  const renderInitialQuestionSlide = (questionIndex: number) => (
    <Block key={`initial-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4">Initial Question</h2>
      <List>
        <ListInput
          label={`Question ${questionIndex + 1}`}
          type="textarea"
          value={initialAnswers[questionIndex]?.question || ''}
          onChange={(e) => setInitialAnswer(questionIndex, 'question', e.target.value)}
        />
        <ListInput
          label={`Answer ${questionIndex + 1}`}
          type="textarea"
          value={initialAnswers[questionIndex]?.answer || ''}
          onChange={(e) => setInitialAnswer(questionIndex, 'answer', e.target.value)}
        />
        <ListInput
          label={`Quiz Question ${questionIndex + 1}`}
          type="textarea"
          value={initialAnswers[questionIndex]?.quizQuestion || ''}
          onChange={(e) => setInitialAnswer(questionIndex, 'quizQuestion', e.target.value)}
        />
        {initialAnswers[questionIndex]?.choices?.map((choice, choiceIndex) => (
          <div key={choiceIndex} className="flex items-center">
            <ListInput
              label={`Choice ${choiceIndex + 1}`}
              type="textarea"
              value={choice?.text || ''}
              onChange={(e) => setInitialAnswer(questionIndex, 'choices', {
                index: choiceIndex,
                choice: { ...choice, text: e.target.value },
              })}
            />
            <input
              type="radio"
              checked={choice?.isCorrect || false}
              onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
              className="ml-2"
            />
          </div>
        ))}
        <ListInput
          label="Video URL"
          type="url"
          value={initialAnswers[questionIndex]?.video || ''}
          onChange={(e) => setInitialAnswer(questionIndex, 'video', e.target.value)}
        />
        {initialAnswers[questionIndex]?.video && (
          <iframe
            title={`video-${questionIndex}`}
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${initialAnswers[questionIndex].video}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )}
      </List>
    </Block>
  );

  const renderRaffleSlide = () => (
    <Block key="raffle-slide" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4">Raffles</h2>
      {raffles.map((raffle, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
          <List>
            <ListInput
              label="Amount"
              type="number"
              value={raffle.amount}
              onChange={(e) => setField(`raffles[${index}].amount`, e.target.value)}
            />
            <ListInput
              label="Reward"
              type="text"
              value={raffle.reward}
              onChange={(e) => setField(`raffles[${index}].reward`, e.target.value)}
            />
            <ListInput
              label="Currency"
              type="text"
              value={raffle.currency}
              onChange={(e) => setField(`raffles[${index}].currency`, e.target.value)}
            />
            <ListInput
              label="Chain"
              type="text"
              value={raffle.chain}
              onChange={(e) => setField(`raffles[${index}].chain`, e.target.value)}
            />
            <ListInput
              label="Dates"
              type="text"
              value={raffle.dates}
              onChange={(e) => setField(`raffles[${index}].dates`, e.target.value)}
            />
            <ListInput
              label="Total Pool"
              type="number"
              value={raffle.totalPool}
              onChange={(e) => setField(`raffles[${index}].totalPool`, e.target.value)}
            />
          </List>
          <button
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            onClick={() => removeRaffle(index)}
          >
            &times;
          </button>
        </div>
      ))}
      <Button onClick={addRaffle} large className="bg-brand-primary text-white rounded-full mt-2">
        Add Raffle
      </Button>
    </Block>
  );

  const renderQuestSlide = () => (
    <Block key="quest-slide" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4">Quests</h2>
      {quests.map((quest, index) => (
        <div key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
          <List>
            <ListInput
              label="Quest Name"
              type="text"
              value={quest.name}
              onChange={(e) => setField(`quests[${index}].name`, e.target.value)}
            />
            <ListInput
              label="Quest Link"
              type="url"
              value={quest.link}
              onChange={(e) => setField(`quests[${index}].link`, e.target.value)}
            />
            <ListInput
              label="Platform"
              type="select"
              value={quest.platform}
              onChange={(e) => setField(`quests[${index}].platform`, e.target.value)}
            >
              <option value="">Select Platform</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
            </ListInput>
          </List>
          <button
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            onClick={() => removeQuest(index)}
          >
            &times;
          </button>
        </div>
      ))}
      <Button onClick={addQuest} large className="bg-brand-primary text-white rounded-full mt-2">
        Add Quest
      </Button>
    </Block>
  );

  const renderAcademyDetailsSlide = () => (
    <Block key="academy-details-slide" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4">Academy Details</h2>
      <List>
        <ListInput
          label="Protocol Name"
          type="text"
          value={name}
          onChange={(e) => setField('name', e.target.value)}
        />
        <ListInput
          label="Ticker"
          type="text"
          value={ticker}
          onChange={(e) => setField('ticker', e.target.value)}
        />
        <ListInput
          label="Webpage URL"
          type="url"
          value={webpageUrl}
          onChange={(e) => setField('webpageUrl', e.target.value)}
        />
        <div className="relative mb-4">
          <label className="block font-medium mb-2">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('logo', e.target.files ? e.target.files[0] : null)}
          />
          {logo && (
            <div className="relative mt-2">
              <img src={logo} alt="Logo Preview" className="w-32 h-32 object-cover" />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                onClick={() => setField('logo', null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <div className="relative mb-10">
          <label className="block font-medium mb-2">Upload Cover Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)}
          />
          {coverPhoto && (
            <div className="relative mt-2">
              <img src={coverPhoto} alt="Cover Photo Preview" className="w-full h-48 object-cover" />
              <button
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                onClick={() => setField('coverPhoto', null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <ListInput
          label="Add Category"
          type="select"
          onChange={(e) => setField('categories', [...categories, e.target.value])}
          value=""
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
              <span onClick={() => setField('categories', categories.filter((_, i) => i !== index))} className="bg-blue-200 px-2 py-1 rounded-lg">
                {category}
              </span>
            </div>
          ))}
        </div>
        <ListInput
          label="Add Chain"
          type="select"
          onChange={(e) => setField('chains', [...chains, e.target.value])}
          value=""
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
              <span onClick={() => setField('chains', chains.filter((_, i) => i !== index))} className="bg-green-200 px-2 py-1 rounded-lg">
                {chain}
              </span>
            </div>
          ))}
        </div>
      </List>
    </Block>
  );

  const renderSocialLinksSlide = () => (
    <Block key="social-links-slide" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4">Social Links</h2>
      <List>
        <ListInput
          label="Twitter"
          type="url"
          value={twitter}
          onChange={(e) => setField('twitter', e.target.value)}
        />
        <ListInput
          label="Telegram"
          type="url"
          value={telegram}
          onChange={(e) => setField('telegram', e.target.value)}
        />
        <ListInput
          label="Discord"
          type="url"
          value={discord}
          onChange={(e) => setField('discord', e.target.value)}
        />
        <ListInput
          label="CoinGecko"
          type="url"
          value={coingecko}
          onChange={(e) => setField('coingecko', e.target.value)}
        />
      </List>
    </Block>
  );

  const slides = [
    renderAcademyDetailsSlide(),
    renderSocialLinksSlide(),
    ...initialAnswers.map((_, index) => renderInitialQuestionSlide(index)),
    renderRaffleSlide(),
    renderQuestSlide(),
  ];

  return (
    <Page>
      <Navbar darkMode={false} onToggleSidebar={() => {}} />
      <Sidebar opened={false} onClose={() => {}} theme="ios" setTheme={() => {}} setColorTheme={() => {}} />
      {slides.map((slide, index) => (
        <div key={index}>
          {slide}
        </div>
      ))}
      <Button
        onClick={() => {
          submitAcademy();
          navigate('/my-academies');
        }}
        large
        raised
        className="w-full bg-brand-primary text-white mt-4 rounded-full"
      >
        Save Academy
      </Button>
    </Page>
  );
};

export default EditAcademyPage;
