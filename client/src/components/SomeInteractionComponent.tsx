// src/components/SomeInteractionComponent.tsx

import axios from 'axios';
import useSessionStore from '../store/useSessionStore';

const SomeInteractionComponent = () => {
  const telegramUserId = useSessionStore((state) => state.userId);

  const handleUserInteraction = async (actionType: string) => {
    try {
      await axios.post('/api/user-interaction', {
        telegramUserId,
        action: actionType,
        email: 'user@example.com', // Pass user email if available
      });
      console.log(`Successfully logged interaction: ${actionType}`);
    } catch (error) {
      console.error(`Error logging interaction: ${actionType}`, error);
    }
  };

  return (
    <div>
      <button onClick={() => handleUserInteraction('bookmark')}>Bookmark</button>
      <button onClick={() => handleUserInteraction('collect_points')}>Collect Points</button>
      <button onClick={() => handleUserInteraction('social_quest')}>Social Quest</button>
      <button onClick={() => handleUserInteraction('register_creator')}>Register as Creator</button>
    </div>
  );
};

export default SomeInteractionComponent;
