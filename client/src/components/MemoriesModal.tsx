import React, { useEffect } from 'react';
import { X, Heart, Camera, Share2, Sparkles, Star } from 'lucide-react';

interface MemoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MemoriesModal: React.FC<MemoriesModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Memories Coming Soon!
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            We're working on an amazing feature that will let you capture, share, and relive your travel memories like never before.
          </p>

          {/* Features Preview */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-xl">
              <Camera className="w-6 h-6 text-pink-600" />
              <span className="text-gray-700 font-medium">Photo Galleries</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-xl">
              <Share2 className="w-6 h-6 text-purple-600" />
              <span className="text-gray-700 font-medium">Share Experiences</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
              <Star className="w-6 h-6 text-blue-600" />
              <span className="text-gray-700 font-medium">Rate & Review Places</span>
            </div>
          </div>


          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Share your travel experiences with us and help build the future of travel planning!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoriesModal;
