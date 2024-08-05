// src/components/creator/PromotionEditor.tsx

import React, { useState } from 'react';
import { Block, List, ListInput, Button } from 'konsta/react';

const PromotionEditor: React.FC = () => {
  const [promotionData, setPromotionData] = useState({
    promoText: '',
    promoImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromotionData({
      ...promotionData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle API call to save promotion data
    try {
      // await apiService.savePromotion(promotionData);
      alert('Promotion updated successfully!');
    } catch (error) {
      console.error('Error updating promotion:', error);
      alert('Failed to update promotion');
    }
  };

  return (
    <Block strong className="rounded-2xl shadow-md mt-4 m-4">
      <h2 className="text-xl font-semibold mb-4">Edit Promotions</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <List>
          <ListInput
            label="Promotion Text"
            type="text"
            placeholder="Enter promotional text"
            outline
            clearButton
            required
            name="promoText"
            value={promotionData.promoText}
            onChange={handleChange}
            className="rounded-2xl"
          />
          <ListInput
            label="Promotion Image URL"
            type="text"
            placeholder="Enter image URL"
            outline
            clearButton
            required
            name="promoImage"
            value={promotionData.promoImage}
            onChange={handleChange}
            className="rounded-2xl"
          />
        </List>
        <Button type="submit" large raised strong className="rounded-2xl">
          Update Promotion
        </Button>
      </form>
    </Block>
  );
};

export default PromotionEditor;
