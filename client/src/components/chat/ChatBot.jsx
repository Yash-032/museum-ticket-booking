import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";
import { 
  MessageSquare, 
  X, 
  Minimize2, 
  SendHorizontal,
  HelpCircle,
  Globe,
  Mic,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatBubble from "./ChatBubble";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import CustomerCare from "./CustomerCare";
import VoiceBooking from "./VoiceBooking";

interface Message {
  id: number;
  conversationId: number;
  isFromUser: boolean;
  content: string;
  createdAt: string;
}

interface ConversationResponse {
  conversationId: number;
  sessionId: string;
  messages: Message[];
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"chat" | "voiceBooking" | "customerCare">("chat");
  const chatMessagesRef = useRef(null);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Start a new conversation
  const startConversation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/chat/start", {
        language: i18n.language,
        userId: user?.id
      });
      return await res.json() ;
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
    }
  });

  // Get messages for a conversation
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["/api/chat/messages", conversationId],
    queryFn: () => null,
    enabled: false, // We don't want to fetch data initially
  });

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!conversationId) throw new Error("No active conversation");
      
      const res = await apiRequest("POST", "/api/chat/message", {
        conversationId,
        message
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/chat/messages", conversationId], data);
      scrollToBottom();
    }
  });

  // Start conversation when the chat is opened
  useEffect(() => {
    if (isOpen && !conversationId) {
      startConversation.mutate();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messagesData]);

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const minimizeChat = () => {
    setIsOpen(false);
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && conversationId) {
      sendMessage.mutate(messageInput);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Restart conversation with new language if we change language
    if (conversationId) {
      setConversationId(null);
      startConversation.mutate();
    }
  };

  // Extract messages from the query data
  const messages = startConversation.data?.messages || [];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  return (
    <>
      {/* Chat button */}
      <div className="fixed bottom-6 right-6 z-20">
        <Button
          onClick={toggleChat}
          className="w-16 h-16 rounded-full shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Chat interface */}
      <div 
        className={`fixed bottom-0 right-0 w-full md:w-96 h-[600px] max-h-screen bg-white shadow-xl rounded-t-xl md:rounded-xl transform transition-transform z-30 
          ${isOpen ? 'md:bottom-6 md:right-6' : 'translate-y-full md:translate-y-0 md:hidden'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 mr-3" />
              
                <h3 className="font-medium">{t("chatbot.title")}</h3>
                <div className="text-xs text-primary-100 flex items-center">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  {t("chatbot.online")}
                </div>
              </div>
            </div>
            
              <Button variant="ghost" size="icon" onClick={minimizeChat} className="text-white">
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {activeView === "chat" && (
            <>
              {/* Messages */}
              <div 
                ref={chatMessagesRef}
                className="flex-grow overflow-y-auto p-4 bg-neutral-50 space-y-4"
              >
                {startConversation.status === 'pending' ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <ChatBubble 
                        key={message.id}
                        message={message.content}
                        isUser={message.isFromUser}
                      />
                    ))}
                    
                    {/* Voice booking and customer care feature suggestions */}
                    {messages.length > 0 && (
                      <div className="my-5 space-y-3">
                        <div 
                          className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-center cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => setActiveView("voiceBooking")}
                        >
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <Mic className="h-5 w-5 text-blue-600" />
                          </div>
                          
                            <p className="font-medium text-blue-700">{t("chatbot.speakToBook")}</p>
                            <p className="text-sm text-blue-600">{t("chatbot.voiceBookingIntro")}</p>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center cursor-pointer hover:bg-green-100 transition-colors"
                          onClick={() => setActiveView("customerCare")}
                        >
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          
                            <p className="font-medium text-green-700">{t("chatbot.customerCare")}</p>
                            <p className="text-sm text-green-600">{t("chatbot.customerCareIntro")}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {sendMessage.status === 'pending' && (
                  <div className="flex items-start">
                    <div className="bg-primary-600 text-white rounded-lg py-2 px-4 max-w-xs flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input area */}
              <div className="p-4 border-t border-neutral-200 bg-white rounded-b-xl">
                <div className="flex text-sm text-neutral-500 mb-2">
                  
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500">
                        <Globe className="h-4 w-4 mr-1" />
                        {languages.find(l => l.code === i18n.language)?.name || "English"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {languages.map((lang) => (
                        <DropdownMenuItem 
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                        >
                          {lang.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-neutral-500">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {t("chatbot.help")}
                  </Button>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t("chatbot.inputPlaceholder")}
                    className="flex-grow border border-neutral-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!conversationId || sendMessage.status === 'pending'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !conversationId || sendMessage.status === 'pending'}
                    className="rounded-l-none"
                  >
                    <SendHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {activeView === "voiceBooking" && (
            <VoiceBooking 
              onClose={toggleChat} 
              onBack={() => setActiveView("chat")} 
              conversationId={conversationId}
            />
          )}
          
          {activeView === "customerCare" && (
            <CustomerCare 
              onClose={toggleChat} 
              onBack={() => setActiveView("chat")} 
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ChatBot;
