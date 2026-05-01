import React from 'react';

export default function ConfidenceBadge({ confidence }) {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let text = 'Unknown';

  if (confidence === 'high') {
    bgColor = 'bg-green-500';
    textColor = 'text-white';
    text = 'High Confidence';
  } else if (confidence === 'medium') {
    bgColor = 'bg-yellow-400';
    textColor = 'text-gray-900';
    text = 'Needs Review';
  } else if (confidence === 'low') {
    bgColor = 'bg-red-500';
    textColor = 'text-white';
    text = 'Low Confidence';
  }

  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bgColor} ${textColor} shadow-sm inline-block`}>
      {text}
    </span>
  );
}
