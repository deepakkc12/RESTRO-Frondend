import React from 'react';
import MenuDetailHeader from "../../../components/Headers/MenuDetailHeader";

export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <MenuDetailHeader name={""} />
      <div className="container mt-14 mx-auto px-4 pb-32 lg:max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <LeftSectionSkeleton />
          <RightSectionSkeleton />
        </div>
      </div>
    </div>
  );
};

const LeftSectionSkeleton = () => (
  <div className="lg:w-1/2 space-y-6">
    <div className="flex flex-row md:flex-col gap-4 md:gap-1">
      <div className="w-1/2 md:w-full md:h-full h-1/2 aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const RightSectionSkeleton = () => (
  <div className="lg:w-1/2 space-y-6">
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-40"></div>
        </div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
      <div className="flex sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="h-12 w-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);