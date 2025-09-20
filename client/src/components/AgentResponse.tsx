import React from 'react';

interface AgentResponseProps {
  response: any;
  agentType: string;
}

const AgentResponse: React.FC<AgentResponseProps> = ({ response, agentType }) => {
  if (!response) return null;

  const renderPreTripData = (data: any) => {
    if (!data.preTripInfo) return null;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🛫 Pre-Trip Information</h4>
          
          {data.preTripInfo.visa && (
            <div className="mb-3">
              <h5 className="font-medium text-blue-700">Visa Requirements:</h5>
              <p className="text-sm text-blue-600">{data.preTripInfo.visa.summary || 'Check embassy website'}</p>
            </div>
          )}
          
          {data.preTripInfo.medical && (
            <div className="mb-3">
              <h5 className="font-medium text-blue-700">Medical Advisories:</h5>
              <p className="text-sm text-blue-600">{data.preTripInfo.medical.summary || 'Consult travel health clinic'}</p>
            </div>
          )}
          
          {data.preTripInfo.alerts && (
            <div className="mb-3">
              <h5 className="font-medium text-blue-700">Travel Alerts:</h5>
              <p className="text-sm text-blue-600">{data.preTripInfo.alerts.summary || 'Check government advisories'}</p>
            </div>
          )}
          
          {data.preTripInfo.packingList && (
            <div className="mb-3">
              <h5 className="font-medium text-blue-700">Packing List:</h5>
              <div className="text-sm text-blue-600">
                <div>Essentials: {data.preTripInfo.packingList.essentials?.join(', ')}</div>
                <div>Mode-specific: {data.preTripInfo.packingList.modeSpecific?.join(', ')}</div>
              </div>
            </div>
          )}
        </div>
        
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">📋 Recommendations</h4>
            <ul className="text-sm text-green-600 space-y-1">
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index}>• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderInTripData = (data: any) => {
    if (!data.response) return null;

    return (
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✈️ In-Trip Assistance</h4>
          
          <div className="mb-3">
            <h5 className="font-medium text-green-700">Response:</h5>
            <p className="text-sm text-green-600">{data.response.message}</p>
          </div>
          
          {data.response.contacts && (
            <div className="mb-3">
              <h5 className="font-medium text-green-700">Emergency Contacts:</h5>
              <div className="text-sm text-green-600 space-y-1">
                {data.response.contacts.map((contact: any, index: number) => (
                  <div key={index}>• {contact.name}: {contact.number}</div>
                ))}
              </div>
            </div>
          )}
          
          {data.response.actions && (
            <div className="mb-3">
              <h5 className="font-medium text-green-700">Recommended Actions:</h5>
              <ul className="text-sm text-green-600 space-y-1">
                {data.response.actions.map((action: string, index: number) => (
                  <li key={index}>• {action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPostTripData = (data: any) => {
    if (!data.tripSummary) return null;

    return (
      <div className="space-y-4">
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-800 mb-2">🏠 Trip Summary</h4>
          
          <div className="mb-3">
            <h5 className="font-medium text-purple-700">Overview:</h5>
            <p className="text-sm text-purple-600">{data.tripSummary.overview}</p>
          </div>
          
          {data.tripSummary.highlights && (
            <div className="mb-3">
              <h5 className="font-medium text-purple-700">Highlights:</h5>
              <ul className="text-sm text-purple-600 space-y-1">
                {data.tripSummary.highlights.map((highlight: string, index: number) => (
                  <li key={index}>• {highlight}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.insights && (
            <div className="mb-3">
              <h5 className="font-medium text-purple-700">Trip Insights:</h5>
              <div className="text-sm text-purple-600">
                <div>Satisfaction: {data.insights.satisfaction}/10</div>
                <div>Value for Money: {data.insights.valueForMoney}</div>
                <div>Safety: {data.insights.safety}</div>
              </div>
            </div>
          )}
        </div>
        
        {data.futureRecommendations && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🔮 Future Recommendations</h4>
            <p className="text-sm text-yellow-600">{data.futureRecommendations.detailedRecommendations}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-4">
      {agentType === 'pre-trip' && renderPreTripData(response)}
      {agentType === 'in-trip' && renderInTripData(response)}
      {agentType === 'post-trip' && renderPostTripData(response)}
    </div>
  );
};

export default AgentResponse;
