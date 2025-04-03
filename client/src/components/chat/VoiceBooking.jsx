import React, { useState, useEffect } from "react";
import { Mic, MicOff, ArrowLeft, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { useVoiceRecognition, useSpeechSynthesis } from "@/hooks/use-voice-recognition";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface VoiceBookingProps {
  onClose: () => void;
  onBack: () => void;
  conversationId: number | null;
}

const VoiceBooking: React.FC = ({ onClose, onBack, conversationId }) => {
  const { t, i18n } = useTranslation();
  const [bookingStep, setBookingStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptFinal, setTranscriptFinal] = useState("");
  const [voicePrompt, setVoicePrompt] = useState("");

  // Voice recognition hook
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useVoiceRecognition({
    language: i18n.language === 'en' ? 'en-US' : 
              i18n.language === 'es' ? 'es-ES' : 
              i18n.language === 'fr' ? 'fr-FR' : 
              i18n.language === 'de' ? 'de-DE' : 'en-US',
    onResult: (result) => {
      // Update UI with interim results
    }
  });

  // Text-to-speech hook
  const { speak, cancel, isSpeaking } = useSpeechSynthesis({
    onEnd: () => {
      // Start listening after speaking ends
      if (bookingStep < 5) {
        startListening();
      }
    }
  });

  // Send a message to the chatbot API
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) throw new Error("No active conversation");
      
      const res = await apiRequest("POST", "/api/chat/message", {
        conversationId,
        message,
        isVoiceBooking: true
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/chat/messages", conversationId], data);
      // Process the response
      processResponse(data.lastResponse);
    }
  });

  // Process the response from the chatbot
  const processResponse = (response: string) => {
    setVoicePrompt(response);
    speak(response);
    
    // Move to the next step after processing
    if (bookingStep < 5) {
      setBookingStep(prevStep => prevStep + 1);
    } else {
      // Booking complete
      setTimeout(() => {
        onBack();
      }, 5000);
    }
  };

  // Steps for the voice booking process
  const bookingSteps = [
    t("voiceBooking.stepWelcome"),
    t("voiceBooking.stepExhibition"),
    t("voiceBooking.stepDate"),
    t("voiceBooking.stepTicketType"),
    t("voiceBooking.stepConfirmation"),
    t("voiceBooking.stepCompleted")
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (browserSupportsSpeechRecognition) {
      setVoicePrompt(bookingSteps[0]);
      speak(bookingSteps[0]);
    }
  }, []);

  // Handle when user stops speaking
  useEffect(() => {
    if (!isListening && transcript && bookingStep > 0 && bookingStep < 5) {
      setTranscriptFinal(transcript);
      setIsProcessing(true);
      // Send the transcript to the chatbot API
      sendMessage.mutate(transcript);
      resetTranscript();
    }
  }, [isListening, transcript]);

  // Calculate progress
  const progress = (bookingStep / 5) * 100;

  const handleStopListening = () => {
    if (isListening) {
      stopListening();
    }
  };

  const handleStartListening = () => {
    if (!isListening && !isSpeaking) {
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center">
          <ArrowLeft className="h-5 w-5 mr-3 cursor-pointer" onClick={onBack} />
          <h3 className="font-medium">{t("voiceBooking.title")}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-grow p-6 flex flex-col">
        {/* Progress bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-neutral-500 mt-2">
            {t("voiceBooking.step")} {bookingStep + 1} {t("voiceBooking.of")} 5
          </p>
        </div>

        {/* Current step */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{bookingSteps[bookingStep]}</h2>
          <p className="text-neutral-600">
            {voicePrompt}
          </p>
        </div>

        {/* Voice input area */}
        <div className="flex-grow flex flex-col items-center justify-center">
          {!browserSupportsSpeechRecognition ? (
            <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-600 font-medium mb-2">{t("voiceBooking.browserNotSupported")}</p>
              <p className="text-neutral-600 text-sm">{t("voiceBooking.tryTextChat")}</p>
            </div>
          ) : isProcessing ? (
            <div className="text-center">
              <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">{t("voiceBooking.processing")}</p>
              {transcriptFinal && (
                <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <p className="text-sm text-neutral-500 mb-1">{t("voiceBooking.youSaid")}:</p>
                  <p className="text-neutral-700">"{transcriptFinal}"</p>
                </div>
              )}
            </div>
          ) : isListening ? (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full bg-primary-500 animate-pulse opacity-10"></div>
                <Mic className="h-10 w-10 text-primary-600" />
              </div>
              <p className="text-primary-600 font-medium">{t("voiceBooking.listening")}</p>
              {transcript && (
                <p className="mt-4 text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200 max-w-xs mx-auto">
                  {transcript}
                </p>
              )}
              <Button
                variant="outline"
                className="mt-6"
                onClick={handleStopListening}
              >
                {t("voiceBooking.stopListening")}
              </Button>
            </div>
          ) : isSpeaking ? (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <div className="w-16 h-16 relative">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute bottom-0 left-1/2 w-3 bg-blue-500 rounded-full"
                      style={{
                        height: `${Math.random() * 100}%`,
                        transform: `translateX(${i * 10 - 10}px)`,
                        animation: `soundwave 1s ease-in-out infinite ${i * 0.2}s`
                      }}
                    ></div>
                  ))}
                </div>
              </div>
              <p className="text-blue-600 font-medium">{t("voiceBooking.speaking")}</p>
            </div>
          ) : (
            <div className="text-center">
              <Button
                size="lg"
                className="w-24 h-24 rounded-full mb-4"
                onClick={handleStartListening}
              >
                <Mic className="h-10 w-10" />
              </Button>
              <p className="text-primary-600 font-medium">{t("voiceBooking.tapToSpeak")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceBooking;