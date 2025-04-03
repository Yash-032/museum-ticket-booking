import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { format } from "date-fns";
import { Ticket, TicketType, Exhibition } from "@shared/schema";
import TicketDisplay from "@/components/tickets/TicketDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ticket , Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const MyTicketsPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [ticketToCancel, setTicketToCancel] = useState<number | null>(null);
  
  // Fetch all user tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ["/api/tickets"],
  });
  
  // Fetch ticket types for reference
  const { data: ticketTypes = [] } = useQuery({
    queryKey: ["/api/ticket-types"],
  });
  
  // Fetch exhibitions for reference
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
  
  // Mutation for cancelling a ticket
  const cancelTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      return await apiRequest("DELETE", `/api/tickets/${ticketId}`);
    },
    onSuccess: () => {
      toast({
        title: t("myTickets.cancelSuccess"),
        description: t("myTickets.cancelSuccessDesc"),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      setTicketToCancel(null);
    },
    onError: (error) => {
      toast({
        title: t("myTickets.cancelError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Filter tickets into upcoming and past
  const now = new Date();
  
  const upcomingTickets = tickets.filter((ticket: Ticket) => 
    new Date(ticket.visitDate) >= now && !ticket.isUsed
  );
  
  const pastTickets = tickets.filter((ticket: Ticket) => 
    new Date(ticket.visitDate) < now || ticket.isUsed
  );
  
  // Get ticket type and exhibition for a ticket
  const getTicketType = (ticketTypeId: number) => {
    return ticketTypes.find((type: TicketType) => type.id === ticketTypeId);
  };
  
  const getExhibition = (exhibitionId: number | null) => {
    if (!exhibitionId) return null;
    return exhibitions.find((exhibition: Exhibition) => exhibition.id === exhibitionId);
  };
  
  // Handle ticket cancellation
  const handleCancelTicket = (ticketId: number) => {
    setTicketToCancel(ticketId);
  };
  
  const confirmCancelTicket = () => {
    if (ticketToCancel !== null) {
      cancelTicketMutation.mutate(ticketToCancel);
    }
  };
  
  return (
    <>
      
        {t("meta.myTicketsTitle")} | MuseumTix</title>
      </Helmet>
      
      <div className="bg-neutral-50 py-8 md:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("myTickets.title")}</h1>
            <p className="text-neutral-600">{t("myTickets.subtitle")}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="upcoming" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {t("myTickets.upcomingVisits")}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center">
              <TicketIcon className="mr-2 h-4 w-4" />
              {t("myTickets.pastVisits")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoadingTickets ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : upcomingTickets.length === 0 ? (
              
                
                  {t("myTickets.noUpcomingTickets")}</CardTitle>
                  {t("myTickets.noTicketsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TicketIcon className="h-16 w-16 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 mb-6 text-center max-w-md">
                    {t("myTickets.noTickets")}
                  </p>
                  <Button asChild>
                    <Link href="/tickets">{t("myTickets.bookTicketsNow")}</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {upcomingTickets.map((ticket: Ticket) => {
                  const ticketType = getTicketType(ticket.ticketTypeId);
                  const exhibition = getExhibition(ticket.exhibitionId);
                  
                  if (!ticketType) return null;
                  
                  return (
                    <TicketDisplay
                      key={ticket.id}
                      ticket={ticket}
                      ticketType={ticketType}
                      exhibition={exhibition}
                      onCancel={handleCancelTicket}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoadingTickets ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : pastTickets.length === 0 ? (
              
                
                  {t("myTickets.noPastTickets")}</CardTitle>
                  {t("myTickets.noPastTicketsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TicketIcon className="h-16 w-16 text-neutral-300 mb-4" />
                  <p className="text-neutral-500 mb-6 text-center max-w-md">
                    {t("myTickets.noVisitHistory")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pastTickets.map((ticket: Ticket) => {
                  const ticketType = getTicketType(ticket.ticketTypeId);
                  const exhibition = getExhibition(ticket.exhibitionId);
                  
                  if (!ticketType) return null;
                  
                  return (
                    <TicketDisplay
                      key={ticket.id}
                      ticket={ticket}
                      ticketType={ticketType}
                      exhibition={exhibition}
                    />
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Cancel Ticket Alert Dialog */}
      <AlertDialog open={ticketToCancel !== null} onOpenChange={(open) => !open && setTicketToCancel(null)}>
        
          
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              {t("myTickets.cancelTicketTitle")}
            </AlertDialogTitle>
            
              {t("myTickets.cancelTicketDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
            {t("myTickets.keepTicket")}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelTicket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelTicketMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                  {t("myTickets.cancelling")}
                </div>
              ) : (
                t("myTickets.confirmCancel")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyTicketsPage;
