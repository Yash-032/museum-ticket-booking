import { useState, useEffect, useCallback } from 'react';

interface UseVoiceRecognitionProps {
  language?: string;
  continuous?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: any) => void;
}

interface VoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: Error | null;
  browserSupportsSpeechRecognition: boolean;
}

// Type for the SpeechRecognition interface
interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

// Global interfaces
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceRecognition({
  language = 'en-US',
  continuous = false,
  onResult,
  onError
}: UseVoiceRecognitionProps = {}): VoiceRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Check if browser supports speech recognition
  const browserSupportsSpeechRecognition = !!window.SpeechRecognition || !!window.webkitSpeechRecognition;

  // Initialize recognition
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setError(new Error('Your browser does not support speech recognition.'));
      return;
    }

    // Create SpeechRecognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    // Configure
    recognitionInstance.continuous = continuous;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = language;

    // Handle results
    recognitionInstance.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          currentTranscript += event.results[i][0].transcript;
        }
      }

      if (currentTranscript) {
        setTranscript(currentTranscript);
        if (onResult) {
          onResult(currentTranscript);
        }
      }
    };

    // Handle errors
    recognitionInstance.onerror = (event) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      setError(error);
      if (onError) {
        onError(error);
      }
    };

    // Handle end of speech
    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.abort();
      }
    };
  }, [browserSupportsSpeechRecognition, continuous, language, onError, onResult]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognition) return;
    
    try {
      recognition.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  }, [recognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    recognition.stop();
    setIsListening(false);
  }, [recognition]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error,
    browserSupportsSpeechRecognition
  };
}

// Add text-to-speech functionality
interface UseSpeechSynthesisProps {
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

interface SpeechSynthesisReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  browserSupportsSpeechSynthesis: boolean;
}

export function useSpeechSynthesis({
  voice,
  rate = 1,
  pitch = 1,
  volume = 1,
  onEnd,
  onError
}: UseSpeechSynthesisProps = {}): SpeechSynthesisReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const browserSupportsSpeechSynthesis = typeof window !== 'undefined' && !!window.speechSynthesis;

  useEffect(() => {
    if (!browserSupportsSpeechSynthesis) return;

    // Load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();

    // Chrome needs a listener for voices to load
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [browserSupportsSpeechSynthesis]);

  const speak = useCallback(
    (text: string) => {
      if (!browserSupportsSpeechSynthesis) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);

      // Configure utterance
      if (voice) utterance.voice = voice;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Setup listeners
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = (event) => {
        setIsSpeaking(false);
        if (onError) onError(event);
      };

      // Speak
      window.speechSynthesis.speak(utterance);
    },
    [browserSupportsSpeechSynthesis, voice, rate, pitch, volume, onEnd, onError]
  );

  const cancel = useCallback(() => {
    if (!browserSupportsSpeechSynthesis) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [browserSupportsSpeechSynthesis]);

  return {
    speak,
    cancel,
    isSpeaking,
    voices,
    browserSupportsSpeechSynthesis
  };
}