import { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onResult, placeholder = 'Speak...' }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        onResult(finalTranscript);
        setIsListening(false);
      } else {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please enable microphone permissions.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onResult]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    setTranscript('');
    setIsListening(true);

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  if (!isSupported) {
    return (
      <div className="text-xs text-gray-500 italic">
        Voice input not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        title={isListening ? 'Stop listening' : 'Start voice input'}
      >
        {isListening ? '🔴' : '🎤'}
      </button>
      {isListening && (
        <span className="text-xs text-gray-600 italic animate-pulse">
          {transcript || placeholder}
        </span>
      )}
    </div>
  );
};
