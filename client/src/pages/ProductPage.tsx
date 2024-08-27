import React, { useState, useEffect } from 'react';
import { useInitData } from '@telegram-apps/sdk-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import BottomTabBar from '../components/BottomTabBar';
import { Page, Card, Radio, Button, Block } from 'konsta/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import axiosInstance from '../api/axiosInstance'; 
import { Icon } from '@iconify/react';
import collected from '../images/collected-coins.png';
import coins from '../images/coins-to-earn.png';
import ticker from '../images/ticker.png';
import categories from '../images/categories.png';
import chains from '../images/chains.png';
import name from '../images/name.png';
import gecko from '../images/coingecko.svg';

export default function ProductPage({ theme, setTheme, setColorTheme }) {
  const initData = useInitData();
  const location = useLocation();
  const navigate = useNavigate();
  const { academy } = location.state || {};
  const [darkMode, setDarkMode] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [initialAnswers, setInitialAnswers] = useState([]);
  const [quests, setQuests] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (academy) {
      fetchQuestions();
      fetchQuests();
    }
  }, [academy]);

  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [activeFilter]);

  const handleNavigateToDetail = () => {
    setActiveFilter(null);
  };

  const constructImageUrl = (url) => `https://subscribes.lt/${url}`;

  const fetchQuestions = async () => {
    try {
      const response = await axiosInstance.get(`/api/academies/${academy.id}/questions`);
      const questions = response.data;
  
      const mappedAnswers = questions.map((question) => ({
        academyQuestionId: question.id, // Use the correct ID from the response
        question: question.question,
        answer: question.answer,
        quizQuestion: question.quizQuestion,
        choices: question.choices,
      }));
  
      setInitialAnswers(mappedAnswers);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchQuests = async () => {
    try {
      const response = await axiosInstance.get(`/api/academies/${academy.id}/quests`);
      setQuests(response.data);
    } catch (error) {
      console.error('Error fetching quests:', error);
    }
  };

  const handleChoiceClick = (questionIndex, choiceIndex) => {
    setInitialAnswers(
      initialAnswers.map((q, qi) =>
        qi === questionIndex
          ? { ...q, selectedChoice: choiceIndex }
          : q
      )
    );
  };

  const handleSubmitAnswers = async () => {
    try {
      const userAnswers = initialAnswers.map((question) => ({
        questionId: question.academyQuestionId, // Send academyQuestionId instead of initialQuestionId
        choiceId: question.choices[question.selectedChoice]?.id,
      }));
  
      const response = await axiosInstance.post(`/api/academies/${academy.id}/submit-quiz`, {
        academyId: academy.id,
        answers: userAnswers,
        telegramUserId: initData.user.id,
      });
  
      const { results, message } = response.data;
      const updatedAnswers = initialAnswers.map(question => {
        const result = results.find(r => r.questionId === question.academyQuestionId);
        return { ...question, isCorrect: result.correct };
      });
  
      setInitialAnswers(updatedAnswers);
      alert(message);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };
  
  const renderProgressbar = () => {
    const totalSlides = initialAnswers.length * 2;
    const completedSlides = currentSlideIndex + 1;

    return (
      <Card className="mb-2 !mx-1 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
        <div className="flex items-center justify-between">
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${(completedSlides / totalSlides) * 100}%`,
                background: 'linear-gradient(to right, #ff0077, #7700ff)',
              }}
            />
          </div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{`${completedSlides}/${totalSlides}`}</span>
        </div>
      </Card>
    );
  };

  const renderInitialQuestionSlide = (questionIndex) => {
    const question = initialAnswers[questionIndex];
    if (!question) return null;

    return (
      <SwiperSlide key={`initial-question-${questionIndex}`}>
        <Card className="!my-2 !mx-1 !p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.answer}</p>
        </Card>
        <div className="flex justify-between items-center mt-4">
          <Icon icon="mdi:arrow-left" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
          <span className="text-gray-600 dark:text-gray-400">Swipe</span>
          <Icon icon="mdi:arrow-right" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
        </div>
      </SwiperSlide>
    );
  };

  const renderQuizSlide = (questionIndex) => {
    const question = initialAnswers[questionIndex];
    if (!question) return null;
  
    return (
      <SwiperSlide key={`quiz-question-${questionIndex}`}>
        <Card className="!mx-1 !my-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.quizQuestion}</p>
        </Card>
        <Card className="!my-4 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
          {question.choices.map((choice, choiceIndex) => (
            <div
              key={choiceIndex}
              className={`cursor-pointer p-4 rounded-lg flex justify-between items-center dark:bg-gray-700 dark:text-gray-200 ${
                question.selectedChoice === choiceIndex ? 'bg-purple-200 border border-purple-500' : 'bg-white border border-transparent'
              } mb-2`}
              onClick={() => handleChoiceClick(questionIndex, choiceIndex)}
            >
              <span className='mr-4'>{choice.text}</span>
              <Radio
                checked={question.selectedChoice === choiceIndex}
                readOnly
              />
            </div>
          ))}
          {question.isCorrect !== undefined && (
            <p className={`mt-2 ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {question.isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          )}
        </Card>
        {questionIndex === initialAnswers.length - 1 && (
          <Button
            large
            rounded
            outline
            onClick={handleSubmitAnswers}
            className="mt-6 mb-12 bg-brand-primary text-white"
          >
            Submit Answers
          </Button>
        )}
        <div className="flex justify-between items-center mt-4 mb-12">
          <Icon icon="mdi:arrow-left" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
          <span className="text-gray-600 dark:text-gray-400">Swipe</span>
          <Icon icon="mdi:arrow-right" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
        </div>
      </SwiperSlide>
    );
  };

  const renderReadTab = () => (
    <>
      {renderProgressbar()}
      <Swiper
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setCurrentSlideIndex(swiper.activeIndex)}
      >
        {initialAnswers.length > 0 ? (
          initialAnswers.flatMap((_, index) => [
            renderInitialQuestionSlide(index),
            renderQuizSlide(index),
          ])
        ) : (
          <SwiperSlide>
            <Card className="m-2 p-2">
              <p className="text-center">No reading materials available</p>
            </Card>
          </SwiperSlide>
        )}
      </Swiper>
    </>
  );

  const renderWatchTab = () => (
    <>
      {renderProgressbar()}
      <Swiper pagination={{ clickable: true }}>
        {initialAnswers.length > 0 ? (
          initialAnswers.map((question, index) => (
            <React.Fragment key={`watch-tab-${index}`}>
              <SwiperSlide key={`video-slide-${index}`}>
                <Card className="!my-2 !mx-1 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm">
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://www.youtube.com/embed/${question.video}`}
                    title={`Video ${index + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Card>
                <div className="flex justify-between items-center mt-4">
                  <Icon icon="mdi:arrow-left" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
                  <span className="text-gray-600 dark:text-gray-400">Swipe</span>
                  <Icon icon="mdi:arrow-right" className="text-gray-600 dark:text-gray-400 w-6 h-6" />
                </div>
              </SwiperSlide>
              {renderQuizSlide(index)}
            </React.Fragment>
          ))
        ) : (
          <SwiperSlide>
            <Card className="m-2 p-2">
              <p className="text-center">No videos available</p>
            </Card>
          </SwiperSlide>
        )}
      </Swiper>
    </>
  );  

  const renderQuestTab = () => (
    <Block>
      {quests.length > 0 ? (
        quests.map((quest, index) => (
          <Card
            key={index}
            className="m-2 p-2 !rounded-2xl !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !shadow-sm flex justify-between"
          >
            <span className="text-gray-900 dark:text-gray-200">{quest.name}</span>
          </Card>
        ))
      ) : (
        <Card className="m-2 p-2">
          <p className="text-center">No quests available</p>
        </Card>
      )}
    </Block>
  );

  const renderContent = () => {
    switch (activeFilter) {
      case 'read':
        return renderReadTab();
      case 'watch':
        return renderWatchTab();
      case 'quests':
        return renderQuestTab();
      default:
        return null;
    }
  };

  return (
    <Page className="bg-white dark:bg-gray-900">
      <Navbar theme={theme} setTheme={setTheme} setColorTheme={setColorTheme} />
      <Sidebar theme={theme} setTheme={setTheme} setColorTheme={setColorTheme} />

      {academy && (
        <div className="px-4 pt-2">
          <div className="text-center">
            <img
              alt={academy.name}
              className="h-18 w-18 rounded-full mb-2 mx-auto cursor-pointer"
              src={constructImageUrl(academy.logoUrl)}
              onClick={handleNavigateToDetail}
            />
            <h1
              className="text-3xl font-bold text-gray-900 dark:text-gray-200 cursor-pointer"
              onClick={handleNavigateToDetail}
            >
              {academy.name}
            </h1>
            <div className="flex justify-center gap-2 mt-4 mx-4">
              <Button
                outline
                rounded
                onClick={() => setActiveFilter('read')}
                className={`${
                  activeFilter === 'read'
                    ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                Read
              </Button>
              <Button
                outline
                rounded
                onClick={() => setActiveFilter('watch')}
                className={`${
                  activeFilter === 'watch'
                    ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                Watch
              </Button>
              <Button
                outline
                rounded
                onClick={() => setActiveFilter('quests')}
                className={`${
                  activeFilter === 'quests'
                    ? 'bg-gray-100 dark:bg-gray-700 k-color-brand-purple shadow-lg'
                    : 'bg-white dark:bg-gray-800 shadow-lg'
                }`}
              >
                Quests
              </Button>
            </div>
          </div>

          <div className="p-4">
            {activeFilter === null && (
              <>
                <Card className="flex flex-row rounded-2xl !shadow-lg p-2 !mx-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !py-0">
                  <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                    <img src={name} className="h-10 w-10 mr-4" alt="academy name" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      Name:
                    </span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                      {academy.name}
                    </span>
                  </div>
                  <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                    <img src={coins} className="h-10 w-10 mr-4" alt="coins to earn" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      Coins to earn:
                    </span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                      {academy.xp}
                    </span>
                  </div>
                  <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                    <img src={ticker} className="h-10 w-10 mr-4" alt="academy ticker" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      Ticker:
                    </span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                      {academy.ticker}
                    </span>
                  </div>
                  <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                    <img src={categories} className="h-10 w-10 mr-4" alt="academy categories" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      Categories:
                    </span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                      {academy.categories.map((c) => c.name).join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200">
                    <img src={chains} className="h-10 w-10 mr-4" alt="academy chains" />
                    <span className="text-gray-600 dark:text-gray-400 mr-2">
                      Chains:
                    </span>
                    <span className="text-black dark:text-gray-200 font-semibold">
                      {academy.chains.map((c) => c.name).join(', ')}
                    </span>
                  </div>
                </Card>

                <Card className="flex flex-row rounded-2xl !shadow-lg p-2 !m-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !mb-4">
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {academy.webpageUrl && (
                      <Button
                        clear
                        raised
                        className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
                      >
                        <Icon
                          icon="mdi:web"
                          color="#6c757d"
                          className="w-5 h-5"
                        />
                        WEBSITE
                      </Button>
                    )}
                    {academy.twitter && (
                      <Button
                        clear
                        raised
                        className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
                      >
                        <Icon
                          icon="mdi:twitter"
                          color="#1DA1F2"
                          className="w-5 h-5"
                        />
                        TWITTER
                      </Button>
                    )}
                    {academy.telegram && (
                      <Button
                        clear
                        raised
                        className="flex items-center justify-center gap-2 dark:text-gray-200"
                      >
                        <Icon
                          icon="mdi:telegram"
                          color="#0088cc"
                          className="w-5 h-5"
                        />
                        TELEGRAM
                      </Button>
                    )}
                    {academy.discord && (
                      <Button
                        clear
                        raised
                        className="flex items-center justify-center gap-2 dark:text-gray-200"
                      >
                        <Icon
                          icon="mdi:discord"
                          color="#7289DA"
                          className="w-5 h-5"
                        />
                        DISCORD
                      </Button>
                    )}
                    {academy.coingecko && (
                      <Button
                        clear
                        raised
                        className="flex items-center justify-center gap-2 w-full dark:text-gray-200"
                      >
                        <img src={gecko} className="h-5 w-5" alt="Coingecko logo" />
                        COINGECKO
                      </Button>
                    )}
                  </div>
                </Card>

                <Card className="flex flex-row rounded-2xl !shadow-lg p-2 !m-0 !bg-gray-50 dark:!bg-gray-800 !border !border-gray-200 dark:!border-gray-700 !py-0">
                  <div className="flex items-center justify-center text-gray-900 dark:text-gray-200">
                    <img src={collected} className="h-10 w-10 mr-4" alt="collected coins" />
                    <span className="text-lg text-gray-600 dark:text-gray-400 mr-2">
                      Earned Coins:
                    </span>
                    <span className="text-lg text-black dark:text-gray-200 font-semibold">
                      150/200
                    </span>
                  </div>
                </Card>
              </>
            )}

            <div className="mt-4">{renderContent()}</div>
          </div>
        </div>
      )}
      <BottomTabBar activeTab="tab-1" setActiveTab={setActiveFilter} />
    </Page>
  );
}
