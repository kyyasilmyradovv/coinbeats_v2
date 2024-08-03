// src/components/creator/ContentManager.tsx

import React, { useState } from 'react';
import { Block, List, ListInput, Button } from 'konsta/react';

const ContentManager: React.FC = () => {
  const [contentData, setContentData] = useState({
    title: '',
    description: '',
    videoUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentData({
      ...contentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle API call to save content data
    // Assuming we have an API endpoint for content management
    try {
      // await apiService.saveContent(contentData);
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content');
    }
  };

  return (
    <Block strong className="rounded-2xl shadow-md m-4">
      <h2 className="text-xl font-semibold mb-4">Manage Your Content</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <List>
          <ListInput
            label="Title"
            type="text"
            placeholder="Enter content title"
            outline
            clearButton
            required
            name="title"
            value={contentData.title}
            onChange={handleChange}
            className="rounded-2xl"
          />
          <ListInput
            label="Description"
            type="text"
            placeholder="Enter content description"
            outline
            clearButton
            required
            name="description"
            value={contentData.description}
            onChange={handleChange}
            className="rounded-2xl"
          />
          <ListInput
            label="Video URL"
            type="text"
            placeholder="Enter video URL"
            outline
            clearButton
            required
            name="videoUrl"
            value={contentData.videoUrl}
            onChange={handleChange}
            className="rounded-2xl"
          />
        </List>
        <Button type="submit" large raised strong className="rounded-2xl">
          Save Content
        </Button>
      </form>
    </Block>
  );
};

export default ContentManager;
