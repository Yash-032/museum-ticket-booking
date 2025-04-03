import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import Hero from "@/components/home/Hero";
import ExhibitionCard from "@/components/exhibitions/ExhibitionCard";
import TicketCard from "@/components/tickets/TicketCard";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import ChatBot from "@/components/chat/ChatBot";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const HomePage = () => {
  const { t } = useTranslation();
  
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions/featured"],
  });
  
  const { data: ticketTypes = [] } = useQuery({
    queryKey: ["/api/ticket-types"],
  });
  
  useEffect(() => {
    // Initialize chatbot button
    const chatbotButton = document.getElementById("openChatbotButton");
    const chatbotLauncher = document.querySelector(".fixed.bottom-6.right-6.z-20 button");
    
    if (chatbotButton && chatbotLauncher) {
      chatbotButton.addEventListener("click", () => {
        (chatbotLauncher ).click();
      });
    }
    
    return () => {
      if (chatbotButton) {
        chatbotButton.removeEventListener("click", () => {});
      }
    };
  }, []);
  
  return (
    <>
      
        {t("meta.homeTitle")} | MuseumTix</title>
        <meta name="description" content={t("meta.homeDescription")} />
      </Helmet>
      
      <Hero />
      
      {/* Featured Exhibitions */}
      <section id="exhibitions" className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-2xl md:text-3xl text-neutral-900 mb-2">
              {t("featuredExhibitions.title")}
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("featuredExhibitions.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exhibitions.slice(0, 3).map((exhibition) => (
              <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/exhibitions">
              <Button variant="ghost" className="text-primary-600 hover:text-primary-700 font-medium">
                {t("featuredExhibitions.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Tickets & Admission */}
      <section id="tickets" className="py-12 md:py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-semibold text-2xl md:text-3xl text-neutral-900 mb-2">
              {t("tickets.title")}
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              {t("tickets.subtitle")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ticketTypes.slice(0, 3).map((ticketType) => (
              <TicketCard key={ticketType.id} ticketType={ticketType} />
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-neutral-200 mt-8 p-5">
            <h3 className="font-medium text-lg text-neutral-900 mb-3">
              {t("tickets.additionalInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              
                <h4 className="font-medium text-neutral-800 mb-1">
                  {t("tickets.discounts")}
                </h4>
                <ul className="text-neutral-600 space-y-1">
                  • {t("tickets.discountStudents")}</li>
                  • {t("tickets.discountSeniors")}</li>
                  • {t("tickets.discountChildren")}</li>
                  • {t("tickets.discountMembers")}</li>
                </ul>
              </div>
              
                <h4 className="font-medium text-neutral-800 mb-1">
                  {t("tickets.openingHours")}
                </h4>
                <ul className="text-neutral-600 space-y-1">
                  • {t("tickets.hourMonday")}</li>
                  • {t("tickets.hourTueThur")}</li>
                  • {t("tickets.hourFriday")}</li>
                  • {t("tickets.hourWeekend")}</li>
                </ul>
              </div>
              
                <h4 className="font-medium text-neutral-800 mb-1">
                  {t("tickets.groupVisits")}
                </h4>
                <p className="text-neutral-600 mb-2">
                  {t("tickets.groupInfo")}
                </p>
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/tickets?group=true">
                    {t("tickets.learnMoreGroups")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <HowItWorks />
      <Testimonials />
      
      {/* Chatbot Features */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
              <h2 className="font-semibold text-2xl md:text-3xl text-neutral-900 mb-4">
                {t("chatbotFeatures.title")}
              </h2>
              <p className="text-neutral-700 mb-6">
                {t("chatbotFeatures.description")}
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-md mr-4">
                    <Globe className="h-5 w-5 text-primary-600" />
                  </div>
                  
                    <h3 className="font-medium text-neutral-900 mb-1">
                      {t("chatbotFeatures.multilingual")}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {t("chatbotFeatures.multilingualDesc")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-md mr-4">
                    <Bot className="h-5 w-5 text-primary-600" />
                  </div>
                  
                    <h3 className="font-medium text-neutral-900 mb-1">
                      {t("chatbotFeatures.aiPowered")}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {t("chatbotFeatures.aiPoweredDesc")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-md mr-4">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  
                    <h3 className="font-medium text-neutral-900 mb-1">
                      {t("chatbotFeatures.availability")}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {t("chatbotFeatures.availabilityDesc")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-md mr-4">
                    <ShieldCheck className="h-5 w-5 text-primary-600" />
                  </div>
                  
                    <h3 className="font-medium text-neutral-900 mb-1">
                      {t("chatbotFeatures.secure")}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {t("chatbotFeatures.secureDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-neutral-100 rounded-xl p-4 md:p-6 max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                    <h3 className="font-medium">{t("chatbot.title")}</h3>
                    <MoreVertical className="h-5 w-5 text-white opacity-80" />
                  </div>
                  
                  <div className="h-96 overflow-y-auto p-4 space-y-4">
                    <div className="flex items-start">
                      <div className="bg-primary-600 text-white rounded-lg py-2 px-4 max-w-xs">
                        {t("chatbot.demoMessage1")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-end">
                      <div className="bg-neutral-100 rounded-lg py-2 px-4 max-w-xs">
                        {t("chatbot.demoReply1")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary-600 text-white rounded-lg py-2 px-4 max-w-xs">
                        {t("chatbot.demoMessage2")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-end">
                      <div className="bg-neutral-100 rounded-lg py-2 px-4 max-w-xs">
                        {t("chatbot.demoReply2")}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary-600 text-white rounded-lg py-2 px-4 max-w-xs">
                        {t("chatbot.demoMessage3")}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-200 p-3">
                    <div className="flex items-center">
                      <input type="text" placeholder={t("chatbot.inputPlaceholder")} className="flex-grow border border-neutral-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      <Button className="rounded-l-none">
                        <SendHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white text-sm py-1 px-3 rounded-full shadow-md">
                {t("chatbotFeatures.liveDemo")}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Newsletter />
      <ChatBot />
    </>
  );
};

export default HomePage;

// Import all icons since they're used in the page
import { Globe, Bot, Clock, ShieldCheck, MoreVertical, SendHorizontal } from "lucide-react";
