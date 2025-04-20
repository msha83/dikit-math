import React from 'react';
import { Link } from 'react-router-dom';

const CompletedTopics = ({ completedTopics = [] }) => {
  if (!completedTopics || completedTopics.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Topik yang Sudah Diselesaikan</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedTopics.map(topic => (
          <div key={topic.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">{topic.title}</h3>
                <p className="text-xs text-gray-600">
                  Diselesaikan pada {new Date(topic.completedAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'long'})}
                </p>
              </div>
            </div>
            <div className="mt-3 text-right">
              <Link to={`/materi/${topic.category}/${topic.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-green-600 hover:text-green-800">
                Lihat Kembali
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedTopics; 