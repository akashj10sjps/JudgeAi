import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import ReviewField from '../components/ReviewField';

export default function Review() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [fieldsState, setFieldsState] = useState({});

  useEffect(() => {
    if (location.state && location.state.extractionData) {
      const extracted = location.state.extractionData;
      setData(extracted);
      
      const initialFields = {};
      const standardFields = ['case_number', 'date', 'petitioner', 'respondent', 'deadline', 'department'];
      
      standardFields.forEach(field => {
        if (extracted[field]) {
          initialFields[field] = { status: 'pending', value: extracted[field], type: 'standard' };
        }
      });
      
      if (Array.isArray(extracted.directions)) {
        extracted.directions.forEach((dir, idx) => {
          initialFields[`direction_${idx}`] = { status: 'pending', value: dir, type: 'direction' };
        });
      }
      
      setFieldsState(initialFields);
    }
  }, [location.state]);

  if (!location.state?.extractionData) {
    return <Navigate to="/" replace />;
  }

  if (!data) return null;

  const handleFieldResolve = (fieldId, newValue, newStatus) => {
    setFieldsState(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], status: newStatus, value: newValue }
    }));
  };

  const totalFields = Object.keys(fieldsState).length;
  const approvedCount = Object.values(fieldsState).filter(f => f.status === 'approved' || f.status === 'edited').length;
  const progressPercentage = totalFields === 0 ? 0 : Math.round((approvedCount / totalFields) * 100);
  const canSave = approvedCount === totalFields && reviewerName.trim().length > 0;

  const handleSave = async () => {
    setIsSaving(true);
    
    const finalData = { ...data };
    const finalDirections = [];
    
    Object.entries(fieldsState).forEach(([key, state]) => {
      if (state.type === 'standard') {
        finalData[key] = state.value;
      } else if (state.type === 'direction') {
        finalDirections.push(state.value);
      }
    });
    finalData.directions = finalDirections;
    finalData.reviewer = reviewerName;

    // Always save to localStorage for dashboard persistence
    // (handles Render ephemeral disk + offline scenarios)
    try {
      const dashboardEntry = {
        case_number: finalData.case_number,
        petitioner: finalData.petitioner,
        respondent: finalData.respondent,
        department: finalData.department,
        directions: finalData.directions,
        deadline: finalData.deadline,
        approved_at: new Date().toISOString().split('T')[0],
        reviewer_name: reviewerName,
      };
      const existing = JSON.parse(localStorage.getItem('judgeai_cases') || '[]');
      // Upsert: replace if same case_number already exists
      const updated = existing.filter(c => c.case_number !== dashboardEntry.case_number);
      updated.unshift(dashboardEntry);
      localStorage.setItem('judgeai_cases', JSON.stringify(updated));
    } catch (storageErr) {
      console.warn('localStorage save failed:', storageErr);
    }

    try {
      await axios.post(`${API}/approve`, finalData);
    } catch (e) {
      console.warn("Backend save failed, falling back to localStorage only");
    }

    setIsSaving(false);
    setShowToast(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const formatLabel = (key) => {
    return key.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            <span className="font-medium">Action plan saved successfully</span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Review Extracted Information</h1>
            <p className="text-gray-500 text-sm mt-1">Verify each field before saving the action plan</p>
          </div>
          <div className="w-full md:w-64">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-primary-600">{approvedCount} / {totalFields} Fields</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Panel - 60% */}
          <div className="w-full lg:w-[60%] flex flex-col gap-2">
            <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Document Details</h2>
            
            {Object.keys(fieldsState).filter(k => fieldsState[k].type === 'standard').map(key => (
              <ReviewField 
                key={key}
                label={formatLabel(key)}
                initialValue={fieldsState[key].value}
                confidence={data.confidence?.[key] || 'medium'}
                onResolve={(val, status) => handleFieldResolve(key, val, status)}
              />
            ))}

            <h2 className="text-xl font-bold text-gray-800 mt-6 mb-2 border-b pb-2">Directions & Deadlines</h2>
            
            {Object.keys(fieldsState).filter(k => fieldsState[k].type === 'direction').map((key, index) => (
              <ReviewField 
                key={key}
                label={`Direction ${index + 1}`}
                initialValue={fieldsState[key].value}
                confidence={data.confidence?.directions || 'medium'}
                onResolve={(val, status) => handleFieldResolve(key, val, status)}
              />
            ))}
          </div>

          {/* Right Panel - 40% */}
          <div className="w-full lg:w-[40%] relative">
            <div className="sticky top-32 bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col h-fit">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Summary Card
              </h3>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100">
                  <p className="text-xs text-primary-600 font-bold uppercase mb-1">Case No</p>
                  <p className="font-semibold text-gray-900">{fieldsState['case_number']?.value || 'N/A'}</p>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-1">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Deadline</p>
                    <p className="font-semibold text-gray-900">{fieldsState['deadline']?.value || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-1">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Directions</p>
                    <p className="font-semibold text-gray-900 text-2xl">{Object.keys(fieldsState).filter(k => fieldsState[k].type === 'direction').length}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Assigned Department</p>
                  <p className="font-medium text-gray-800">{fieldsState['department']?.value || 'N/A'}</p>
                </div>
              </div>

              <div className="mt-auto border-t pt-6">
                <div className="mb-4">
                  <label htmlFor="reviewer" className="block text-sm font-bold text-gray-700 mb-2">Reviewer Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="reviewer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    placeholder="Enter your name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleSave}
                  disabled={!canSave || isSaving}
                  className={`w-full py-4 rounded-xl text-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer
                    ${canSave 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white hover:shadow-lg translate-y-0 hover:-translate-y-0.5' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  {isSaving ? 'Saving...' : 'Save Action Plan'}
                  {!isSaving && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                </button>
                
                {!canSave && (
                  <p className="text-center text-xs text-gray-500 mt-3 font-medium">
                    {reviewerName.trim().length === 0 ? "Enter reviewer name to save" : "Approve or edit all fields to save"}
                  </p>
                )}
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
