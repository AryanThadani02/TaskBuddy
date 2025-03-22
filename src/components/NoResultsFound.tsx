
import React from 'react';
import noResultsImage from '../assets/img/no-results.png';

const NoResultsFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <img 
        src={noResultsImage} 
        alt="No results found" 
        className="w-[215px] h-[165px] object-contain"
      />
      <h3 className="mt-6 text-lg font-medium text-gray-900">No tasks found</h3>
      <p className="mt-2 text-sm text-gray-500">Try adjusting your search criteria</p>
    </div>
  );
};

export default NoResultsFound;
