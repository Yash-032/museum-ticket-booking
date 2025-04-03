import React, { useState } from "react";
import { Phone, Video, X, ArrowLeft, MicOff, Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";

interface CustomerCareProps {
  onClose: () => void;
  onBack: () => void;
}

const CustomerCare: React.FC = ({ onClose, onBack }) => {
  const { t } = useTranslation();
  const [callConnected, setCallConnected] = useState(false);
  const [callType, setCallType] = useState<"voice" | "video" | null>(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);
  const { 
    isListening, 
    startListening, 
    stopListening, 
    browserSupportsSpeechRecognition 
  } = useVoiceRecognition();

  const handleCallStart = (type: "voice" | "video") => {
    setCallType(type);
    // In a real implementation, this would initiate a call to a customer service agent
    // For now, we'll simulate connecting after a short delay
    setTimeout(() => {
      setCallConnected(true);
    }, 2000);
  };

  const toggleMicrophone = () => {
    if (audioMuted) {
      // Unmute
      setAudioMuted(false);
      if (browserSupportsSpeechRecognition) {
        startListening();
      }
    } else {
      // Mute
      setAudioMuted(true);
      if (isListening) {
        stopListening();
      }
    }
  };

  const toggleSpeaker = () => {
    setSpeakerMuted(!speakerMuted);
  };

  const handleEndCall = () => {
    setCallConnected(false);
    setCallType(null);
    if (isListening) {
      stopListening();
    }
  };

  if (!callType) {
    // Call type selection screen
    return (
      <div className="flex flex-col h-full">
        <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center">
            <ArrowLeft className="h-5 w-5 mr-3 cursor-pointer" onClick={onBack} />
            <h3 className="font-medium">{t("customerCare.title")}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-grow p-6 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-8">{t("customerCare.howToConnect")}</h2>
          
          <div className="space-y-6 w-full max-w-xs">
            <Button 
              onClick={() => handleCallStart("voice")}
              className="w-full py-6 text-lg flex items-center justify-center gap-3"
            >
              <Phone className="h-6 w-6" />
              {t("customerCare.voiceCall")}
            </Button>
            
            <Button 
              onClick={() => handleCallStart("video")}
              className="w-full py-6 text-lg flex items-center justify-center gap-3"
              variant="outline"
            >
              <Video className="h-6 w-6" />
              {t("customerCare.videoCall")}
            </Button>
          </div>
          
          <p className="mt-8 text-center text-neutral-500 text-sm max-w-xs">
            {t("customerCare.availabilityNote")}
          </p>
        </div>
      </div>
    );
  }

  // Call in progress screen
  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center">
          <ArrowLeft className="h-5 w-5 mr-3 cursor-pointer" onClick={handleEndCall} />
          <h3 className="font-medium">
            {callConnected 
              ? t("customerCare.connectedWith", { agent: "Alex" }) 
              : t("customerCare.connecting")}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-grow flex flex-col">
        {/* Avatar area */}
        <div className="flex-grow flex items-center justify-center bg-neutral-100">
          {callType === "video" ? (
            callConnected ? (
              <div className="text-center">
                <div className="bg-primary-200 h-64 w-64 rounded-full flex items-center justify-center mb-4">
                  <img 
                    src="/customer-service-agent.svg" 
                    alt="Customer Service Agent"
                    className="h-full w-full object-cover rounded-full"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/200?text=CS+Agent";
                    }}
                  />
                </div>
                <p className="text-lg font-medium">Alex - {t("customerCare.agentTitle")}</p>
              </div>
            ) : (
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-32 bg-primary-200 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-neutral-200 rounded mb-2"></div>
                <div className="h-3 w-32 bg-neutral-200 rounded"></div>
              </div>
            )
          ) : (
            // Voice call
            <div className="text-center">
              <div className="bg-primary-100 h-32 w-32 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-16 w-16 text-primary-600" />
              </div>
              <p className="text-lg font-medium">
                {callConnected 
                  ? "Alex - " + t("customerCare.agentTitle")
                  : t("customerCare.connecting")}
              </p>
              {callConnected && (
                <div className="mt-2 flex items-center justify-center">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-green-600 text-sm">{t("customerCare.activeCall")}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="p-6 bg-white flex items-center justify-center space-x-6">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full"
            onClick={toggleMicrophone}
          >
            {audioMuted ? (
              <MicOff className="h-6 w-6 text-red-500" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
          
          <Button 
            variant="destructive" 
            size="icon" 
            className="h-16 w-16 rounded-full"
            onClick={handleEndCall}
          >
            <Phone className="h-8 w-8 rotate-135" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full"
            onClick={toggleSpeaker}
          >
            {speakerMuted ? (
              <VolumeX className="h-6 w-6 text-red-500" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;