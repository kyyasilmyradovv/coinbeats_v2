import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Page, Block, Button, BlockTitle
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
  const [maxXp, setMaxXp] = useState(200); // default max XP
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch academy details including quests and initial questions
    const fetchAcademyDetails = async () => {
      try {
        const response = await axios.get(`/api/academies/${id}`);
        setAcademy(response.data);
        // Initialize XP allocation
        const quizXp = {};
        const questXp = {};
        response.data.academyQuestions.forEach((question) => {
          quizXp[question.id] = 0;
        });
        response.data.quests.forEach((quest) => {
          questXp[quest.id] = 0;
        });
        setXpAllocation({ quizXp, questXp });
      } catch (error) {
        console.error('Error fetching academy details:', error);
      }
    };

    fetchAcademyDetails();
  }, [id]);

  const handleXpChange = (type: 'quizXp' | 'questXp', itemId: number, value: number) => {
    setXpAllocation((prevState) => ({
      ...prevState,
      [type]: {
        ...prevState[type],
        [itemId]: value,
      },
    }));
  };

  const handleApplyAllocation = async () => {
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

        <div>
          <h3 className="text-lg font-bold">Initial Questions</h3>
          {academy?.academyQuestions.map((question) => (
            <div key={question.id}>
              <label>{question.quizQuestion}</label>
              <input
                type="number"
                value={xpAllocation.quizXp[question.id]}
                onChange={(e) =>
                  handleXpChange('quizXp', question.id, parseInt(e.target.value, 10))
                }
                max={maxXp}
              />
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-lg font-bold">Quests</h3>
          {academy?.quests.map((quest) => (
            <div key={quest.id}>
              <label>{quest.name}</label>
              <input
                type="number"
                value={xpAllocation.questXp[quest.id]}
                onChange={(e) =>
                  handleXpChange('questXp', quest.id, parseInt(e.target.value, 10))
                }
                max={maxXp}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={handleApplyAllocation} className="bg-brand-primary text-white mr-2">
            Apply Allocation
          </Button>
          <Button onClick={() => navigate(`/my-academies`)} className="bg-gray-400 text-white">
            Cancel
          </Button>
        </div>
      </Block>
    </Page>
  );
};

export default AllocateXpPage;
