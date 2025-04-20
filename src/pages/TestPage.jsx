import React from 'react';

const TestPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Test Page</h1>
      <p className="text-lg text-gray-700">If you can see this, React is rendering correctly.</p>
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
        <p className="mb-4">Some common issues with blank screens:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>JavaScript errors preventing rendering</li>
          <li>CSS not loading properly</li>
          <li>Routing issues</li>
          <li>Authentication problems</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage; 