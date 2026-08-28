import React, { createContext, useContext, useState } from "react";

const StorageContext = createContext(null);

export const StorageContextProvider = ({ children }) => {
    const [leaves,setLeaves] = useState([]);
    const [selectedTab,setSelectedTab] = useState(0) // Student Leave History Screen
    const [noticeBoard,setNoticeBoard] = useState([]);

  return (
    <StorageContext.Provider
      value={{
        leaves,
        setLeaves,
        selectedTab,
        setSelectedTab,
        noticeBoard,
        setNoticeBoard
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error(
      "useGlobalStorage must be used inside GlobalStorageProvider"
    );
  }
  return context;
};
