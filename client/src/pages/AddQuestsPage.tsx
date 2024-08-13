import React, { useState } from 'react';
import { Page, Block, List, ListInput, Button, Notification } from 'konsta/react';
import useAcademyStore from '../store/useAcademyStore';
import axios from 'axios';
import bunnyLogo from '../images/bunny-mascot.png'; // Replace with the actual path to your image

const AddQuestsPage: React.FC = () => {
  const { quests, addQuest, setField, removeQuest } = useAcademyStore();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSaveQuests = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/academies/:id/quests', { quests });
      if (response.status === 200) {
        setNotificationOpen(true);
      }
    } catch (error) {
      console.error('Error saving quests:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Block strongIos className="m-4 p-4 bg-white rounded-xl shadow-md">
        <h2 className="text-lg font-bold mb-4">Add Quests</h2>
        <List>
          {quests.map((quest, index) => (
            <Block key={index} className="mb-4 p-4 border rounded-lg shadow-sm relative">
              <h4 className="font-medium mb-2">Quest {index + 1}</h4>
              <ListInput
                label="Name"
                type="textarea"
                placeholder="Enter quest name"
                value={quest.name}
                onChange={(e) => setField('quests', [...quests.slice(0, index), { ...quest, name: e.target.value }, ...quests.slice(index + 1)])}
              />
              <ListInput
                label="Link"
                type="textarea"
                placeholder="Enter quest link"
                value={quest.link}
                onChange={(e) => setField('quests', [...quests.slice(0, index), { ...quest, link: e.target.value }, ...quests.slice(index + 1)])}
              />
              <ListInput
                label="Platform"
                type="textarea"
                placeholder="Enter platform (e.g., Twitter, Facebook)"
                value={quest.platform}
                onChange={(e) => setField('quests', [...quests.slice(0, index), { ...quest, platform: e.target.value }, ...quests.slice(index + 1)])}
              />
              <Button onClick={() => removeQuest(index)} className="bg-red-500 text-white mt-4">Remove Quest</Button>
            </Block>
          ))}
        </List>
        <Button onClick={addQuest} className="rounded-full">Add Quest</Button>
        <Button onClick={handleSaveQuests} className="mt-4 bg-brand-primary text-white" disabled={loading}>
          {loading ? 'Saving...' : 'Save Quests'}
        </Button>
      </Block>

      <Notification
        opened={notificationOpen}
        icon={<img src={bunnyLogo} alt="Bunny Mascot" className="w-10 h-10" />}
        title="Success"
        text="You successfully added Quests"
        button={<Button onClick={() => setNotificationOpen(false)}>OK</Button>}
        onClose={() => setNotificationOpen(false)}
      />
    </Page>
  );
};

export default AddQuestsPage;
