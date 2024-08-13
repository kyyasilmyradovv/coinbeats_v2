import React, { useState, useEffect } from 'react';
import {
  Page,
  Block,
  List,
  ListInput,
  Button,
} from 'konsta/react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import useCategoryChainStore from '../store/useCategoryChainStore';
import useAcademyStore from '../store/useAcademyStore';

const CreateAcademyPage: React.FC = ({ theme, setTheme, setColorTheme }) => {
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [visibleTooltip, setVisibleTooltip] = useState<number | null>(null);

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
    webpageUrl,
    coverPhoto,
    initialAnswers,
    raffles,
    quests,
    currentStep,
    setField,
    setInitialAnswer,
    toggleCorrectAnswer,
    addRaffle,
    addQuest,
    submitAcademy,
    fetchQuestions,
    nextStep,
    prevStep,
    removeRaffle,
    removeQuest,
  } = useAcademyStore();

  const navigate = useNavigate();

  const {
    categories: categoryList,
    chains: chainList,
    fetchCategoriesAndChains,
  } = useCategoryChainStore();

  useEffect(() => {
    fetchQuestions();
    fetchCategoriesAndChains();
  }, [fetchQuestions, fetchCategoriesAndChains]);

  const toggleSidebar = () => {
    setRightPanelOpened(!rightPanelOpened);
  };

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

  const autoresize = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const handleCharacterLimit = (e: React.ChangeEvent<HTMLTextAreaElement>, limit: number) => {
    if (e.target.value.length > limit) {
      e.target.value = e.target.value.substring(0, limit);
    }
    autoresize(e);
  };

  const toggleTooltip = (tooltipIndex: number) => {
    if (visibleTooltip === tooltipIndex) {
      setVisibleTooltip(null);
    } else {
      setVisibleTooltip(tooltipIndex);
      setTimeout(() => setVisibleTooltip(null), 2000);
    }
  };

  const removeCategory = (index: number) => {
    setField('categories', categories.filter((_, i) => i !== index));
  };

  const removeChain = (index: number) => {
    setField('chains', chains.filter((_, i) => i !== index));
  };

  const renderQuestionSlide = (questionIndex: number) => {
    const answerLimit = 300;
    const quizQuestionLimit = 100;

    return (
      <Block key={`slide-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center justify-center relative">
          <h2 className="text-lg font-bold mb-4 text-center">Educational Quiz Section</h2>
          <button
            className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
            onClick={() => toggleTooltip(questionIndex)}
          >
            ?
          </button>
          {visibleTooltip === questionIndex && (
            <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
              This section is designed to assess the learner’s understanding of the material presented. Provide a detailed answer to the quiz question and use the additional options to set up multiple choices and the correct answer.
              <button
                className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
                onClick={() => setVisibleTooltip(null)}
              >
                &times;
              </button>
            </div>
          )}
        </div>
        <div className="mb-4 rounded-lg shadow-sm">
          <p className="font-medium mb-2">{`Question ${questionIndex + 1}: ${initialAnswers[questionIndex].question}`}</p>
          <List>
            <div className="relative mb-6">
              <ListInput
                label={`Answer to Question ${questionIndex + 1}`}
                outline
                type="textarea"
                placeholder="Enter your answer"
                inputClassName="!resize-none"
                className="!ml-0 !mr-0"
                value={initialAnswers[questionIndex].answer || ''}
                maxLength={answerLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'answer', e.target.value);
                  handleCharacterLimit(e, answerLimit);
                }}
              />
              <span className="absolute -top-6 right-2 text-xs text-gray-500 mt-2 mr-2">
                {initialAnswers[questionIndex].answer.length}/{answerLimit}
              </span>
            </div>
            <div className="relative">
              <ListInput
                label={`Quiz Question ${questionIndex + 1}`}
                outline
                type="textarea"
                inputClassName="!resize-none"
                placeholder={`Quiz question for Question ${questionIndex + 1}`}
                value={initialAnswers[questionIndex].quizQuestion || ''}
                maxLength={quizQuestionLimit}
                onChange={(e) => {
                  setInitialAnswer(questionIndex, 'quizQuestion', e.target.value);
                  handleCharacterLimit(e, quizQuestionLimit);
                }}
              />
              <span className="absolute -top-6 right-2 text-xs text-gray-500 mt-2 mr-2">
                {initialAnswers[questionIndex].quizQuestion.length}/{quizQuestionLimit}
              </span>
            </div>
            <div className="flex justify-between">
              <h4 className="font-medium mt-2">Choices</h4>
              <h4 className="font-medium mt-2">Correct<br />answer</h4>
            </div>
            {initialAnswers[questionIndex].choices.map((choice, choiceIndex) => (
              <div key={choiceIndex} className="flex items-center">
                <ListInput
                  label={`Answer ${choiceIndex + 1}`}
                  type="textarea"
                  inputClassName="!resize-none"
                  outline
                  placeholder={`Enter Answer ${choiceIndex + 1}`}
                  value={choice.answer}
                  onChange={(e) => {
                    setInitialAnswer(questionIndex, 'choices', {
                      index: choiceIndex,
                      choice: { ...choice, answer: e.target.value },
                    });
                    autoresize(e);
                  }}
                />
                <input
                  type="checkbox"
                  checked={choice.correct}
                  onChange={() => toggleCorrectAnswer(questionIndex, choiceIndex)}
                  className="custom-radio"
                  disabled={!choice.answer} 
                />
              </div>
            ))}
            <ListInput
              label={`Video URL for Question ${questionIndex + 1}`}
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Video URL"
              value={initialAnswers[questionIndex].video || ''}
              onChange={(e) => {
                setInitialAnswer(questionIndex, 'video', e.target.value);
                autoresize(e);
              }}
            />
          </List>
        </div>
        <div className="flex justify-between">
          <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
            Back
          </Button>
          <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
            Next
          </Button>
        </div>
      </Block>
    );
  };

  const renderAcademyDetailsSlide = () => (
    <Block key="slide-details" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Academy Details</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(1)}
        >
          ?
        </button>
        {visibleTooltip === 1 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Provide detailed information about your academy, including the webpage URL, logo, cover photo, categories, and associated blockchain chains.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Webpage URL"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Webpage URL"
          value={webpageUrl}
          onChange={(e) => {
            setField('webpageUrl', e.target.value);
            autoresize(e);
          }}
        />
        <div className="relative mb-4">
          <label className="block font-medium mb-2 mt-6">Upload Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              handleFileChange('logo', e.target.files ? e.target.files[0] : null)
            }
          />
          {logo && (
            <div className="relative mt-2">
              <img
                src={logo}
                alt="Logo Preview"
                className="w-32 h-32 object-cover"
              />
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
            onChange={(e) =>
              handleFileChange('coverPhoto', e.target.files ? e.target.files[0] : null)
            }
          />
          {coverPhoto && (
            <div className="relative mt-2">
              <img
                src={coverPhoto}
                alt="Cover Photo Preview"
                className="w-full h-48 object-cover"
              />
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
          outline
          onChange={(e) => {
            setField('categories', [...categories, e.target.value]);
          }}
          value=""
          placeholder="Select Category"
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
              <span onClick={() => removeCategory(index)} className="bg-blue-200 px-2 py-1 rounded-lg">
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
            setField('chains', [...chains, e.target.value]);
          }}
          value=""
          placeholder="Select Chain"
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
              <span onClick={() => removeChain(index)} className="bg-green-200 px-2 py-1 rounded-lg">
                {chain}
              </span>
            </div>
          ))}
        </div>
      </List>
      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderSocialLinksSlide = () => (
    <Block key="slide-social-links" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Social Links</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(2)}
        >
          ?
        </button>
        {visibleTooltip === 2 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Enter the social media links for your academy. These links will help users connect with your academy on various platforms like Twitter, Telegram, and Discord.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Twitter Account"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Twitter Account"
          value={twitter}
          onChange={(e) => {
            setField('twitter', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="Telegram Account"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Telegram Account"
          value={telegram}
          onChange={(e) => {
            setField('telegram', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="Discord Channel"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Discord Channel"
          value={discord}
          onChange={(e) => {
            setField('discord', e.target.value);
            autoresize(e);
          }}
        />
        <ListInput
          label="CoinGeko Address"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter CoinGeko Address"
          value={coingecko}
          onChange={(e) => {
            setField('coingecko', e.target.value);
            autoresize(e);
          }}
        />
      </List>
      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderRaffleSlide = () => (
    <Block key="slide-raffle" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Raffle Section</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(3)}
        >
          ?
        </button>
        {visibleTooltip === 3 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            In this section, set up raffles that your academy participants can enter. Define the number of raffles, rewards, and associated blockchain details.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      {raffles.map((raffle, index) => (
        <div key={index} className="relative mb-4 p-4 border rounded-lg shadow-sm">
          <button
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            onClick={() => removeRaffle(index)}
          >
            &times;
          </button>
          <h4 className="font-medium mb-2">Raffle {index + 1}</h4>
          <List>
            <ListInput
              label="Amount of Raffles"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Amount"
              value={raffle.amount}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, amount: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Reward per Raffle"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Reward"
              value={raffle.reward}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, reward: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Raffle Reward Currency"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Currency"
              value={raffle.currency}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, currency: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Chain"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Chain"
              value={raffle.chain}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, chain: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Raffle Dates"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Dates"
              value={raffle.dates}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, dates: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Total Raffle Pool"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Total Pool"
              value={raffle.totalPool}
              onChange={(e) => {
                setField('raffles', [
                  ...raffles.slice(0, index),
                  { ...raffle, totalPool: e.target.value },
                  ...raffles.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
          </List>
        </div>
      ))}
      <Button onClick={addRaffle} className="rounded-full">
        Add Raffle
      </Button>
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderQuestSlide = () => (
    <Block key="slide-quest" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Quest Section</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(4)}
        >
          ?
        </button>
        {visibleTooltip === 4 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Create quests for users to complete. These could be tasks or challenges related to your academy, and can include links and platform details.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      {quests.map((quest, index) => (
        <div key={index} className="relative mb-4 p-4 border rounded-lg shadow-sm">
          <button
            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
            onClick={() => removeQuest(index)}
          >
            &times;
          </button>
          <h4 className="font-medium mb-2">Quest {index + 1}</h4>
          <List>
            <ListInput
              label="Quest Name"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Quest Name"
              value={quest.name}
              onChange={(e) => {
                setField('quests', [
                  ...quests.slice(0, index),
                  { ...quest, name: e.target.value },
                  ...quests.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Quest Link"
              type="textarea"
              inputClassName="!resize-none"
              outline
              placeholder="Enter Quest Link"
              value={quest.link}
              onChange={(e) => {
                setField('quests', [
                  ...quests.slice(0, index),
                  { ...quest, link: e.target.value },
                  ...quests.slice(index + 1),
                ]);
                autoresize(e);
              }}
            />
            <ListInput
              label="Platform Binding"
              type="select"
              outline
              placeholder="Select Platform"
              value={quest.platform}
              onChange={(e) => {
                setField('quests', [
                  ...quests.slice(0, index),
                  { ...quest, platform: e.target.value },
                  ...quests.slice(index + 1),
                ]);
                autoresize(e);
              }}
            >
              <option value="">Select Platform</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
            </ListInput>
          </List>
        </div>
      ))}
      <Button onClick={addQuest} className="rounded-full">
        Add Quest
      </Button>
      <div className="flex justify-between mt-4">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={nextStep} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Next
        </Button>
      </div>
    </Block>
  );

  const renderReviewSlide = () => (
    <Block key="slide-review" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Review and Submit</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(5)}
        >
          ?
        </button>
        {visibleTooltip === 5 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Review all the details you have entered. Make sure everything is correct before submitting your academy for review.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {/* Protocol Name and Ticker */}
      <div className="mb-4">
        <h3 className="font-medium">Protocol Name:</h3>
        <p>{name || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Ticker:</h3>
        <p>{ticker || 'N/A'}</p>
      </div>

      {/* Academy Details */}
      <div className="mb-4">
        <h3 className="font-medium">Webpage URL:</h3>
        <p>{webpageUrl || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Logo:</h3>
        {logo ? <img src={logo} alt="Logo Preview" className="mt-2 w-32 h-32 object-cover" /> : <p>N/A</p>}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Cover Photo:</h3>
        {coverPhoto ? <img src={coverPhoto} alt="Cover Photo Preview" className="mt-2 w-full h-48 object-cover" /> : <p>N/A</p>}
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Categories:</h3>
        <p>{categories.length > 0 ? categories.join(', ') : 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Chains:</h3>
        <p>{chains.length > 0 ? chains.join(', ') : 'N/A'}</p>
      </div>

      {/* Social Links */}
      <div className="mb-4">
        <h3 className="font-medium">Twitter Account:</h3>
        <p>{twitter || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Telegram Account:</h3>
        <p>{telegram || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Discord Channel:</h3>
        <p>{discord || 'N/A'}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">CoinGeko Address:</h3>
        <p>{coingecko || 'N/A'}</p>
      </div>

      {/* Educational Quiz Section */}
      <div className="mb-4">
        <h3 className="font-medium">Educational Quiz Section:</h3>
        {initialAnswers.map((question, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium">{`Question ${index + 1}: ${question.question}`}</h4>
            <p><strong>Answer:</strong> {question.answer || 'N/A'}</p>
            <p><strong>Quiz Question:</strong> {question.quizQuestion || 'N/A'}</p>
            <p><strong>Choices:</strong></p>
            <ul className="list-disc ml-5">
              {question.choices.map((choice, choiceIndex) => (
                <li key={choiceIndex}>{choice.answer || 'N/A'} {choice.correct && '(Correct)'}</li>
              ))}
            </ul>
            <p><strong>Video URL:</strong> {question.video || 'N/A'}</p>
          </div>
        ))}
      </div>

      {/* Raffle Section */}
      <div className="mb-4">
        <h3 className="font-medium">Raffle Section:</h3>
        {raffles.map((raffle, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium">Raffle {index + 1}</h4>
            <p><strong>Amount of Raffles:</strong> {raffle.amount || 'N/A'}</p>
            <p><strong>Reward per Raffle:</strong> {raffle.reward || 'N/A'}</p>
            <p><strong>Raffle Reward Currency:</strong> {raffle.currency || 'N/A'}</p>
            <p><strong>Chain:</strong> {raffle.chain || 'N/A'}</p>
            <p><strong>Raffle Dates:</strong> {raffle.dates || 'N/A'}</p>
            <p><strong>Total Raffle Pool:</strong> {raffle.totalPool || 'N/A'}</p>
          </div>
        ))}
      </div>

      {/* Quest Section */}
      <div className="mb-4">
        <h3 className="font-medium">Quest Section:</h3>
        {quests.map((quest, index) => (
          <div key={index} className="mb-4">
            <h4 className="font-medium">Quest {index + 1}</h4>
            <p><strong>Quest Name:</strong> {quest.name || 'N/A'}</p>
            <p><strong>Quest Link:</strong> {quest.link || 'N/A'}</p>
            <p><strong>Platform:</strong> {quest.platform || 'N/A'}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <Button onClick={prevStep} className="w-1/2 bg-brand-primary text-white rounded-full mr-2" large raised>
          Back
        </Button>
        <Button onClick={submitAcademy} className="w-1/2 bg-brand-primary text-white rounded-full ml-2" large raised>
          Submit Academy
        </Button>
      </div>
    </Block>
  );

  const slides = [
    // First slide for Protocol Name and Ticker
    <Block key="slide1" strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-center relative">
        <h2 className="text-lg font-bold mb-4 text-center">Create Academy Form</h2>
        <button
          className="ml-2 rounded-full bg-gray-700 text-white text-xs font-bold w-5 h-5 flex items-center justify-center mb-4"
          onClick={() => toggleTooltip(6)}
        >
          ?
        </button>
        {visibleTooltip === 6 && (
          <div className="tooltip absolute bg-gray-700 text-white text-xs rounded-2xl p-4 mt-2 z-10">
            Fill in the protocol name and ticker (optional) for your academy. This is the first step to create a new academy.
            <button
              className="absolute top-0 right-0 text-white text-sm mt-1 mr-1"
              onClick={() => setVisibleTooltip(null)}
            >
              &times;
            </button>
          </div>
        )}
      </div>
      <List>
        <ListInput
          label="Protocol Name"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Protocol Name"
          value={name}
          onChange={(e) => {
            setField('name', e.target.value);
            autoresize(e);
          }}
          required
        />
        <ListInput
          label="Ticker (optional)"
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Ticker"
          value={ticker}
          onChange={(e) => {
            setField('ticker', e.target.value);
            autoresize(e);
          }}
        />
      </List>
      <Button onClick={nextStep} large raised className="w-full bg-brand-primary text-white mt-4 rounded-full">
        Next
      </Button>
    </Block>,

    // Dynamically render each question slide
    ...initialAnswers.map((_, index) => renderQuestionSlide(index)),

    // Slide for Academy Details
    renderAcademyDetailsSlide(),

    // Slide for Social Links
    renderSocialLinksSlide(),

    // Slide for Raffle Section
    renderRaffleSlide(),

    // Slide for Quest Section
    renderQuestSlide(),

    // Review and Submit slide
    renderReviewSlide(),
  ];

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
        theme={theme}
        setTheme={setTheme}
        setColorTheme={setColorTheme}
      />

      {/* Render the current slide */}
      {slides[currentStep]}
    </Page>
  );
};

export default CreateAcademyPage;
