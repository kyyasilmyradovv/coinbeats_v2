// src/components/creator/CongratsVideoUploader.tsx

import React, { useState } from 'react';
import { Block, List, Button } from 'konsta/react';

const CongratsVideoUploader: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      alert('Please select a video file to upload.');
      return;
    }

    // Handle API call to upload the video
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      // await apiService.uploadCongratsVideo(formData);
      alert('Congrats video uploaded successfully!');
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Failed to upload video');
    }
  };

  return (
    <Block strong className="rounded-2xl shadow-md mt-4 m-4">
      <h2 className="text-xl font-semibold mb-4">Upload Congrats Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <List>
          <div className="flex items-center justify-between px-4 py-2">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            />
          </div>
        </List>
        <Button type="submit" large raised strong className="rounded-2xl">
          Upload Video
        </Button>
      </form>
    </Block>
  );
};

export default CongratsVideoUploader;
