import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Page, Block, Button, BlockTitle, List, ListItem, Range, Segmented
} from 'konsta/react';
import axios from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/Sidebar';

const AllocateXpPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [academy, setAcademy] = useState<any>(null);
  const [xpAllocation, setXpAllocation] = useState({
    quizXp: {},
    questXp: {},
  });
  const [maxXp, setMaxXp] = useState(0);
  const [remainingXp, setRemainingXp] = useState(0);
  const [activeTab, setActiveTab] = useState<'quiz' | 'quests'>('quiz');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcademyDetails = async () => {
      try {
        const response = await axios.get(`/api/academies/${id}`);
        const academyData = response.data;
        setAcademy(academyData);
        setMaxXp(academyData.xp);
        setRemainingXp(academyData.xp);

        // Initialize XP allocation with data from the database
        const quizXp = {};
        const questXp = {};
        academyData.academyQuestions.forEach((question) => {
          quizXp[question.id] = question.xp || 0;
        });
        academyData.quests.forEach((quest) => {
          questXp[quest.id] = quest.xp || 0;
        });
        setXpAllocation({ quizXp, questXp });

        // Update the remaining XP
        const totalAllocatedXp = Object.values(quizXp).reduce((sum, xp) => sum + xp, 0)
          + Object.values(questXp).reduce((sum, xp) => sum + xp, 0);
        setRemainingXp(academyData.xp - totalAllocatedXp);
      } catch (error) {
        console.error('Error fetching academy details:', error);
      }
    };

    fetchAcademyDetails();
  }, [id]);

  const handleXpChange = (type: 'quizXp' | 'questXp', itemId: number, value: number) => {
    const adjustedValue = Math.max(0, Math.min(value, maxXp));
    setXpAllocation((prevState) => {
      const newAllocation = {
        ...prevState,
        [type]: {
          ...prevState[type],
          [itemId]: adjustedValue,
        },
      };

      const totalAllocatedXp = Object.values(newAllocation.quizXp).reduce((sum, xp) => sum + xp, 0)
        + Object.values(newAllocation.questXp).reduce((sum, xp) => sum + xp, 0);

      setRemainingXp(maxXp - totalAllocatedXp);
      return newAllocation;
    });
  };

  const handleSliderChange = (type: 'quizXp' | 'questXp', itemId: number) => (event) => {
    const value = parseInt(event.target.value, 10);
    handleXpChange(type, itemId, value);
  };

  const handleApplyAllocation = async () => {
    const totalAllocatedXp = Object.values(xpAllocation.quizXp).reduce((sum, xp) => sum + xp, 0)
      + Object.values(xpAllocation.questXp).reduce((sum, xp) => sum + xp, 0);

    if (totalAllocatedXp !== maxXp) {
      alert(`Please allocate exactly ${maxXp} XP.`);
      return;
    }

    try {
      await axios.put(`/api/academies/${id}/allocate-xp`, xpAllocation);
      navigate(`/my-academies`);
    } catch (error) {
      console.error('Error applying XP allocation:', error);
    }
  };

  return (
    <Page>
      <Navbar title="Allocate XP" backLink />
      <Sidebar />

      <Block>
        <BlockTitle large>Allocate XP for {academy?.name}</BlockTitle>
        <Block className="flex items-center mb-2 text-lg text-gray-900 dark:text-gray-200 whitespace-nowrap">
          Total XP to allocate: <p className='text-xl ml-2'>{maxXp}</p>
        </Block>
        <Segmented strong rounded>
          <Button
            rounded
            raised
            active={activeTab === 'quiz'}
            onClick={() => setActiveTab('quiz')}
          >
            Quiz Questions
          </Button>
          <Button
          rounded
          raised
            active={activeTab === 'quests'}
            onClick={() => setActiveTab('quests')}
          >
            Quests
          </Button>
        </Segmented>

        {activeTab === 'quiz' ? (
          <List strong className="my-4 rounded-2xl">
            {academy?.academyQuestions.map((question) => (
              <ListItem
                key={question.id}
                title={question.quizQuestion}
                after={
                  <div className="flex items-center">
                    <Range
                      min={0}
                      max={maxXp}
                      step={1}
                      value={xpAllocation.quizXp[question.id]}
                      onInput={handleSliderChange('quizXp', question.id)}
                    />
                    <input
                      type="number"
                      className="ml-4 p-2 text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded-md w-16 text-center"
                      value={xpAllocation.quizXp[question.id]}
                      onChange={(e) => handleXpChange('quizXp', question.id, parseInt(e.target.value, 10))}
                      min={0}
                      max={maxXp}
                    />
                  </div>
                }
              />
            ))}
          </List>
        ) : (
          <List strong className="my-4">
            {academy?.quests.length > 0 ? (
              academy.quests.map((quest) => (
                <ListItem
                  key={quest.id}
                  title={quest.name}
                  after={
                    <div className="flex items-center">
                      <Range
                        min={0}
                        max={maxXp}
                        step={1}
                        value={xpAllocation.questXp[quest.id]}
                        onInput={handleSliderChange('questXp', quest.id)}
                      />
                      <input
                        type="number"
                        className="ml-4 p-2 text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 rounded-md w-16 text-center"
                        value={xpAllocation.questXp[quest.id]}
                        onChange={(e) => handleXpChange('questXp', quest.id, parseInt(e.target.value, 10))}
                        min={0}
                        max={maxXp}
                      />
                    </div>
                  }
                />
              ))
            ) : (
              <Block className="text-center text-gray-600 dark:text-gray-400">
                No quests available
              </Block>
            )}
          </List>
        )}

        <Block className="text-center text-xl font-bold text-gray-900 dark:text-gray-200 mt-4">
          XP left to allocate: {remainingXp}
        </Block>

        <Button
          onClick={handleApplyAllocation}
          large
          rounded
          className="bg-brand-primary text-white mt-8 fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%]"
        >
          Apply XP Allocation
        </Button>
      </Block>
    </Page>
  );
};

export default AllocateXpPage;
