import React, { createContext, useState, useContext } from 'react';

const BookmarkContext = createContext();

export const useBookmarks = () => useContext(BookmarkContext);

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  const addBookmark = (academy) => {
    setBookmarks((prevBookmarks) => {
      if (prevBookmarks.find((item) => item.id === academy.id)) {
        return prevBookmarks;
      }
      return [...prevBookmarks, academy];
    });
  };

  const removeBookmark = (academy) => {
    setBookmarks((prevBookmarks) =>
      prevBookmarks.filter((item) => item.id !== academy.id)
    );
  };

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, addBookmark, removeBookmark }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};
