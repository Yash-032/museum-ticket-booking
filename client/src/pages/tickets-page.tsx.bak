import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { Helmet } from "react-helmet";
import { TicketType } from "@shared/schema";
import TicketCard from "@/components/tickets/TicketCard";
import TicketForm from "@/components/tickets/TicketForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatBot from "@/components/chat/ChatBot";
import { CalendarIcon, Users, Clock, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const TicketsPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user } = useAuth();
  
  const searchParams = new URLSearchParams(search);
  const ticketTypeId = searchParams.get('type') ? parseInt(searchParams.get('type')!) : undefined;
  const exhibitionId = searchParams.get('exhibition') ? parseInt(searchParams.get('exhibition')!) : undefined;
  const isGroupBooking = searchParams.get('group') === 'true';
  
  const [selectedTicketType, setSelectedTicketType] = useState<number | undefined>(ticketTypeId);
  
  // Get ticket types
  const { data: ticketTypes = [], isLoading } = useQuery({
    queryKey: ["/api/ticket-types"],
  });
  
  // Set active tab based on URL parameter
  const [activeTab, setActiveTab] = useState(isGroupBooking ? "group" : "individual");
  
  useEffect(() => {
    // Update selected ticket type when URL changes
    setSelectedTicketType(ticketTypeId);
  }, [ticketTypeId]);
  
  const handleTicketSelect = (id: number) => {
    setSelectedTicketType(id);
  };
  
  const handleFormSubmit = (data: any) => {
    if (!user) {
      // Redirect to auth page if not logged in
      setLocation('/auth');
      return;
    }
    
    // Redirect to checkout with the ticket details
    setLocation(`/checkout?ticket=${data.ticketTypeId}&quantity=${data.quantity}&date=${data.visitDate.toISOString()}&time=${data.visitTime}${data.exhibitionId ? `&exhibition=${data.exhibitionId}` : ''}`);
  };
  
  return (
    <>
      <Helmet>
        <title>{t("meta.ticketsTitle")} | MuseumTix</title>
        <meta name="description" content={t("meta.ticketsDescription")} />
      </Helmet>
      
      <div className="bg-neutral-50 py-8 md:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("tickets.title")}</h1>
            <p className="text-neutral-600 mb-6">{t("tickets.subtitle")}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="individual">Individual Tickets</TabsTrigger>
            <TabsTrigger value="group">Group & School Visits</TabsTrigger>
          </TabsList>
          
          <TabsContent value="individual">
            {selectedTicketType ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  {ticketTypes.filter((tt: TicketType) => tt.id === selectedTicketType).map((ticketType: TicketType) => (
                    <TicketCard
                      key={ticketType.id}
                      ticketType={ticketType}
                    />
                  ))}
                </div>
                
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("tickets.ticketDetails")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TicketForm
                        selectedTicketTypeId={selectedTicketType}
                        selectedExhibitionId={exhibitionId}
                        onSubmit={handleFormSubmit}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  {ticketTypes.map((ticketType: TicketType) => (
                    <TicketCard
                      key={ticketType.id}
                      ticketType={ticketType}
                      onSelect={() => handleTicketSelect(ticketType.id)}
                    />
                  ))}
                </div>
                
                <div className="bg-white rounded-lg shadow-md border border-neutral-200 mt-8 p-6">
                  <h3 className="font-medium text-lg text-neutral-900 mb-4">{t("tickets.additionalInfo")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-neutral-800 mb-1">{t("tickets.discounts")}</h4>
                          <ul className="text-neutral-600 space-y-1 text-sm">
                            <li>• {t("tickets.discountStudents")}</li>
                            <li>• {t("tickets.discountSeniors")}</li>
                            <li>• {t("tickets.discountChildren")}</li>
                            <li>• {t("tickets.discountMembers")}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-neutral-800 mb-1">{t("tickets.openingHours")}</h4>
                          <ul className="text-neutral-600 space-y-1 text-sm">
                            <li>• {t("tickets.hourMonday")}</li>
                            <li>• {t("tickets.hourTueThur")}</li>
                            <li>• {t("tickets.hourFriday")}</li>
                            <li>• {t("tickets.hourWeekend")}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <CalendarIcon className="h-5 w-5 text-primary-600 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-neutral-800 mb-1">{t("tickets.visitTips")}</h4>
                          <ul className="text-neutral-600 space-y-1 text-sm">
                            <li>• Weekday mornings are less crowded</li>
                            <li>• Plan at least 2 hours for your visit</li>
                            <li>• Audio guides are available for rent</li>
                            <li>• Photography without flash is permitted</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="group">
            <Card>
              <CardHeader>
                <CardTitle>{t("tickets.groupVisits")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Users className="h-10 w-10 text-primary-600 mt-1" />
                  <div>
                    <h3 className="text-xl font-medium mb-2">Group Visit Benefits</h3>
                    <p className="text-neutral-600 mb-4">
                      Our group visit program offers special rates and experiences for groups of 10 or more people. 
                      Enjoy personalized guided tours, educational materials, and priority entry.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">School Groups</h4>
                        <ul className="space-y-1 text-neutral-600 text-sm">
                          <li>• Special educational rates</li>
                          <li>• Customized learning materials</li>
                          <li>• Grade-specific guided tours</li>
                          <li>• Lunch area reservation option</li>
                        </ul>
                      </div>
                      
                      <div className="bg-neutral-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Adult Groups</h4>
                        <ul className="space-y-1 text-neutral-600 text-sm">
                          <li>• 15% discount for groups of 10-20</li>
                          <li>• 20% discount for groups over 20</li>
                          <li>• Private guided tours available</li>
                          <li>• Special exhibition access</li>
                        </ul>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <h3 className="text-xl font-medium mb-4">Request Group Booking</h3>
                    <p className="text-neutral-600 mb-4">
                      For group bookings, please contact our group sales department directly. 
                      A representative will help you plan your visit and provide a personalized quote.
                    </p>
                    
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h4 className="font-medium text-primary-700">Contact Group Sales</h4>
                          <p className="text-primary-600 text-sm">Available Monday-Friday, 9am-5pm</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                          <p className="text-primary-700 font-medium">groups@museumtix.com</p>
                          <p className="text-primary-700 font-medium">+1 (212) 555-4321</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <ChatBot />
    </>
  );
};

export default TicketsPage;
