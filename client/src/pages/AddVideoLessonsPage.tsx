import React, { useEffect, useState } from 'react';
import { Page, Block, List, ListInput, Button, Notification } from 'konsta/react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';
import useAcademyStore from '../store/useAcademyStore';
import useCategoryChainStore from '../store/useCategoryChainStore';

const AddVideoLessonsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get academy ID from URL
  const navigate = useNavigate();
  const [rightPanelOpened, setRightPanelOpened] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const {
    initialAnswers,
    videoUrls,
    setVideoUrl,
    fetchQuestions,
    submitVideoLessons,
  } = useAcademyStore();

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

  const handleVideoUrlChange = (index: number, url: string) => {
    setVideoUrl(index, url);
  };

  const handleSubmit = async () => {
    try {
      await submitVideoLessons(parseInt(id || '0', 10));
      setNotificationOpen(true);
    } catch (error) {
      console.error('Failed to submit video lessons:', error);
    }
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
    navigate('/my-academies'); // Redirect to My Academies page
  };

  const renderVideoLessonSlide = (questionIndex: number) => (
    <Block key={`video-question-${questionIndex}`} strong className="mx-4 my-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
      <h2 className="text-lg font-bold mb-4 text-center">Add Video Lesson</h2>
      <p className="font-medium mb-2">{`Question ${questionIndex + 1}: ${initialAnswers[questionIndex].question}`}</p>
      <List>
        <ListInput
          label={`Video URL for Question ${questionIndex + 1}`}
          type="textarea"
          inputClassName="!resize-none"
          outline
          placeholder="Enter Video URL"
          value={videoUrls[questionIndex]?.url || ''}
          onChange={(e) => handleVideoUrlChange(questionIndex, e.target.value)}
        />
      </List>
      {videoUrls[questionIndex]?.url && (
        <div className="mt-4">
          <iframe
            width="100%"
            height="315"
            src={`https://www.youtube.com/embed/${new URL(videoUrls[questionIndex].url).searchParams.get('v')}`}
            title={`Video for Question ${questionIndex + 1}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </Block>
  );

  return (
    <Page>
      <Navbar darkMode={darkMode} onToggleSidebar={toggleSidebar} />
      <Sidebar
        opened={rightPanelOpened}
        onClose={() => setRightPanelOpened(false)}
      />

      <Block strong className="m-4 p-4 bg-white rounded-xl shadow-md">
        {initialAnswers.map((_, index) => renderVideoLessonSlide(index))}
        <Button onClick={handleSubmit} large raised className="w-full bg-brand-primary text-white mt-4 rounded-full">
          Submit Video Lessons
        </Button>
      </Block>

      <Notification
        opened={notificationOpen}
        title="Success"
        text="You successfully added Video Lessons"
        button={
          <Button onClick={handleNotificationClose}>
            OK
          </Button>
        }
        onClose={handleNotificationClose}
      />
    </Page>
  );
};

export default AddVideoLessonsPage;
