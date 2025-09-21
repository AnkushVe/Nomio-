import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';

interface VoiceChatProps {
  onMessage: (message: string) => void;
  onResponse: (response: string) => void;
  onLocationUpdate: (location: string) => void;
  onMapDataUpdate: (mapData: any) => void;
  userId: string;
  currentLocation: string;
  travelMode: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ onMessage, onResponse, onLocationUpdate, onMapDataUpdate, userId, currentLocation, travelMode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transcript, setTranscript] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const continuousRecorderRef = useRef<MediaRecorder | null>(null);
  const continuousChunksRef = useRef<Blob[]>([]);
  const wakeWordTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert audio blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      const response = await axios.post('/api/voice-chat', {
        audioBase64: base64Audio,
        userId: userId,
        currentLocation: currentLocation,
        travelMode: travelMode
      });

      if (response.data.success) {
        // Add to chat - only add the AI response, not the transcript
        onResponse(response.data.aiResponse);

        // Handle map updates if location is mentioned
        if (response.data.location && response.data.location !== currentLocation) {
          onLocationUpdate(response.data.location);
        }

        // Handle map data updates
        if (response.data.mapData) {
          onMapDataUpdate(response.data.mapData);
        }

        // Play the AI response
        if (response.data.audio) {
          await playAudioResponse(response.data.audio);
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      alert('Error processing voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioResponse = async (audioBase64: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.src = `data:audio/mp3;base64,${audioBase64}`;
        audioRef.current.onplay = () => setIsPlaying(true);
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = () => setIsPlaying(false);
        
        await audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };



  // Check for wake words
  const checkWakeWord = (text: string) => {
    const wakeWords = ['hey nomio', 'hey nimo', 'hey gemini', 'hey google', 'nomio', 'nimo'];
    const lowerText = text.toLowerCase().trim();
    
    for (const wakeWord of wakeWords) {
      if (lowerText.includes(wakeWord)) {
        return true;
      }
    }
    return false;
  };

  // Process audio for wake word detection
  const processWakeWordAudio = useCallback(async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

      const response = await axios.post('/api/voice-to-text', {
        audioBase64: base64Audio
      });

      if (response.data.success && response.data.transcript) {
        const transcript = response.data.transcript;
        
        if (checkWakeWord(transcript)) {
          setWakeWordDetected(true);
          setTranscript(transcript);
          // Stop continuous listening when wake word is detected
          stopContinuousListening();
        }
      }
    } catch (error) {
      console.error('Error processing wake word audio:', error);
    }
  }, [stopContinuousListening]);

  // Start continuous listening for wake words
  const startContinuousListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      continuousRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
      continuousChunksRef.current = [];

      continuousRecorderRef.current.ondataavailable = (event) => {
        continuousChunksRef.current.push(event.data);
      };

      continuousRecorderRef.current.onstop = async () => {
        if (continuousChunksRef.current.length > 0) {
          const audioBlob = new Blob(continuousChunksRef.current, { type: 'audio/webm; codecs=opus' });
          await processWakeWordAudio(audioBlob);
        }
        // Restart listening
        setTimeout(() => startContinuousListening(), 1000);
      };

      continuousRecorderRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting continuous listening:', error);
    }
  }, [processWakeWordAudio]);

  // Stop continuous listening
  const stopContinuousListening = useCallback(() => {
    if (continuousRecorderRef.current && isListening) {
      continuousRecorderRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);


  // Initialize audio context and start continuous listening
  useEffect(() => {
    audioRef.current = new Audio();
    
    // Start continuous listening for wake words
    startContinuousListening();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      stopContinuousListening();
      const timeoutId = wakeWordTimeoutRef.current;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [startContinuousListening, stopContinuousListening]);

  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Modern Voice Button */}
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        disabled={isProcessing}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-medium transition-all duration-300 shadow-lg ${
          isRecording
            ? 'bg-gradient-to-r from-red-500 to-pink-500 scale-110 shadow-red-500/50'
            : isProcessing
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 cursor-not-allowed scale-95'
            : wakeWordDetected
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-110 shadow-green-500/50'
            : isListening
            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-blue-500/50'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-purple-500/50'
        }`}
        title={isRecording ? 'Recording... Release to send' : isProcessing ? 'Processing...' : 'Hold to record voice'}
      >
        {isProcessing ? '⏳' : isRecording ? '🎤' : wakeWordDetected ? '👂' : isListening ? '👂' : '🎤'}
      </button>

      {/* Status Text */}
      <div className="flex-1 text-center">
        {isRecording && (
          <p className="text-sm text-red-600 font-medium">Recording...</p>
        )}
        {isProcessing && (
          <p className="text-sm text-yellow-600 font-medium">Processing...</p>
        )}
        {isPlaying && (
          <p className="text-sm text-blue-600 font-medium">Playing...</p>
        )}
        {wakeWordDetected && (
          <p className="text-sm text-green-600 font-medium">Wake word detected!</p>
        )}
        {isListening && !wakeWordDetected && (
          <p className="text-sm text-blue-600">Listening for "Hey Nomio"</p>
        )}
        {!isRecording && !isProcessing && !isPlaying && !isListening && (
          <p className="text-sm text-slate-500">Hold mic to record or say "Hey Nomio"</p>
        )}
      </div>

      {/* Modern Controls */}
      <div className="flex space-x-2">
        <button
          onClick={isListening ? stopContinuousListening : startContinuousListening}
          className={`px-3 py-2 text-xs rounded-xl transition-all duration-300 font-medium ${
            isListening 
              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' 
              : 'bg-gray-100 text-slate-700 hover:bg-gray-200 border border-gray-200'
          }`}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? 'Stop' : 'Listen'}
        </button>
        <button
          onClick={() => {
            // Clear conversation functionality removed for cleanup
          }}
          className="px-3 py-2 text-xs bg-gray-100 text-slate-700 hover:bg-gray-200 rounded-xl transition-all duration-300 font-medium border border-gray-200"
          title="Clear conversation"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default VoiceChat;
