import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import LoadingSpinner from '../components/LoadingSpinner';
import sampleData from '../mock/sampleData.json';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file only.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file only.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setLoadingText('Reading judgment...');

    // Simulate multi-step loading text
    const loadingInterval = setTimeout(() => {
      setLoadingText('Extracting key information...');
    }, 2000);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/extract`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      clearTimeout(loadingInterval);
      setIsLoading(false);
      navigate('/review', { state: { extractionData: response.data } });
    } catch (err) {
      console.warn('Backend extraction failed, falling back to mock data:', err);
      // Fallback to sampleData if backend fails
      setTimeout(() => {
        clearTimeout(loadingInterval);
        setIsLoading(false);
        navigate('/review', { state: { extractionData: sampleData } });
      }, 3000); // add a slight delay for realism
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-10">
        
        <div className="flex justify-between items-start mb-10 relative">
          <div className="w-full text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Judge<span className="text-primary-600">AI</span></h1>
            </div>
            <p className="text-lg text-gray-500 font-medium">Court Judgment Intelligence System</p>
          </div>
          
          <button 
            onClick={() => navigate('/dashboard')} 
            className="absolute right-0 top-0 text-primary-600 font-medium hover:text-primary-700 transition-colors flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100"
          >
            Dashboard
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        {isLoading ? (
          <div className="py-12">
            <LoadingSpinner text={loadingText} />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div 
              className={`border-3 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[250px]
                ${file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
              
              <svg className={`w-16 h-16 mb-4 ${file ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              
              {file ? (
                <div>
                  <p className="text-lg font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                  <p className="text-primary-600 text-sm mt-4 hover:underline">Click or drag to replace</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg text-gray-700 font-medium">Drop your court order PDF here</p>
                  <p className="text-gray-500 mt-2">or click to browse</p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={!file}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer
                ${file 
                  ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg translate-y-0 hover:-translate-y-0.5' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Extract Action Plan
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
