import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    id: string;
    title: string;
    icon: string;
    description: string;
    problem: string;
    solution: string;
    benefits: string[];
    example?: string;
    iconComponent: React.ReactNode;
  } | null;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ isOpen, onClose, feature }) => {
  if (!isOpen || !feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-95 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-start space-x-4 mb-6">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                  {feature.iconComponent}
                </div>
              </div>
              {/* Title */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{feature.title}</h2>
              </div>
            </div>
            
            {/* Problem Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">The Problem</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.problem}</p>
            </div>

            {/* Solution Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Our Solution</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.solution}</p>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Benefits</h3>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Divider */}
            <div className="border-t border-gray-200 mb-6"></div>
          </div>

          {/* Right Column - Example */}
          {feature.example && (
            <div className="lg:col-span-2">
              <div className="sticky top-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-300 shadow-lg h-fit">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-lg">💬</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Real Example</h3>
                  </div>
                  <div className="bg-white rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                    <p className="text-gray-800 font-medium leading-relaxed text-base">{feature.example}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;
