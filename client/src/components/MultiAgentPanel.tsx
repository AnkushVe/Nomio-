import React, { useState } from 'react';

interface MultiAgentPanelProps {
  onAgentSelect: (agent: string) => void;
  activeAgent: string;
}

const MultiAgentPanel: React.FC<MultiAgentPanelProps> = ({ onAgentSelect, activeAgent }) => {
  const agents = [
    {
      id: 'pre-trip',
      name: 'Pre-Trip Agent',
      emoji: '🛫',
      description: 'Visa, medical, travel alerts',
      color: 'bg-blue-500',
      features: [
        'Visa requirements',
        'Medical advisories',
        'Travel alerts',
        'Packing lists',
        'Document checklist',
        'Insurance recommendations'
      ]
    },
    {
      id: 'in-trip',
      name: 'In-Trip Agent',
      emoji: '✈️',
      description: 'Real-time assistance',
      color: 'bg-green-500',
      features: [
        'Emergency assistance',
        'Navigation help',
        'Booking changes',
        'Recommendations',
        'Translation support',
        'Safety alerts'
      ]
    },
    {
      id: 'post-trip',
      name: 'Post-Trip Agent',
      emoji: '🏠',
      description: 'Feedback & learning',
      color: 'bg-purple-500',
      features: [
        'Trip feedback',
        'Preference learning',
        'Future recommendations',
        'Experience analysis',
        'Trip summaries',
        'Personalized suggestions'
      ]
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🤖 Multi-Agent Travel System
      </h2>
      <p className="text-gray-600 mb-6">
        Our AI system uses specialized agents for different phases of your travel journey
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => onAgentSelect(agent.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              activeAgent === agent.id
                ? `${agent.color} text-white border-${agent.color.split('-')[1]}-600`
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{agent.emoji}</div>
            <h3 className="font-semibold text-lg mb-2">{agent.name}</h3>
            <p className="text-sm mb-3 opacity-90">{agent.description}</p>
            
            <div className="space-y-1">
              {agent.features.map((feature, index) => (
                <div key={index} className="text-xs flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">How it works:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• <strong>Pre-Trip:</strong> Ask about visas, vaccinations, or packing lists</div>
          <div>• <strong>In-Trip:</strong> Say "I'm here" or "help me" for real-time assistance</div>
          <div>• <strong>Post-Trip:</strong> Share feedback like "trip was amazing" or "I loved Paris"</div>
        </div>
      </div>
    </div>
  );
};

export default MultiAgentPanel;
