import React, { useState } from 'react';
import ConfidenceBadge from './ConfidenceBadge';

export default function ReviewField({ label, initialValue, confidence, onResolve }) {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('pending'); // pending, approved, edited, rejected

  const handleApprove = () => {
    setStatus('approved');
    setIsEditing(false);
    onResolve(value, 'approved');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    setStatus('edited');
    setIsEditing(false);
    onResolve(value, 'edited');
  };

  const handleReject = () => {
    setStatus('rejected');
    setIsEditing(false);
    onResolve(value, 'rejected');
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</label>
            <ConfidenceBadge confidence={confidence || 'medium'} />
          </div>
          
          {isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <textarea 
                className="w-full p-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-y min-h-[80px]"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-lg border ${status === 'approved' ? 'bg-green-50 border-green-200' : status === 'edited' ? 'bg-blue-50 border-blue-200' : status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
              <p className="text-gray-800 whitespace-pre-wrap">{value}</p>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-2 md:flex-col shrink-0 mt-2 md:mt-0">
            <button 
              onClick={handleApprove}
              title="Approve"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${status === 'approved' ? 'bg-green-600 text-white shadow-md' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </button>
            <button 
              onClick={handleEdit}
              title="Edit"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${status === 'edited' ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button 
              onClick={handleReject}
              title="Reject"
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors cursor-pointer ${status === 'rejected' ? 'bg-red-600 text-white shadow-md' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        )}
      </div>
      {status === 'rejected' && !isEditing && (
        <p className="text-red-500 text-xs mt-2 font-medium">This field has been marked for manual review.</p>
      )}
    </div>
  );
}
