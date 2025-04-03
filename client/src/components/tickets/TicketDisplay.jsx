import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ticket, TicketType, Exhibition } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Download, Eye, XCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface TicketDisplayProps {
  ticket: Ticket;
  ticketType: TicketType;
  exhibition?: Exhibition | null;
  onCancel?: (ticketId: number) => void;
}

const TicketDisplay = ({ ticket, ticketType, exhibition, onCancel }: TicketDisplayProps) => {
  const { t } = useTranslation();
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "EEEE, MMMM do, yyyy");
  };
  
  const getStatusBadge = () => {
    if (ticket.isUsed) {
      return <Badge variant="secondary">{t("myTickets.used")}</Badge>;
    }
    
    if (new Date(ticket.visitDate) < new Date()) {
      return <Badge variant="destructive">{t("myTickets.expired")}</Badge>;
    }
    
    return <Badge variant="default" className="bg-emerald-500">{t("myTickets.active")}</Badge>;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className={`bg-${ticketType.color || 'primary'}-600 p-4 text-white`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">{ticketType.name}</h3>
          {getStatusBadge()}
        </div>
        <p className="text-sm opacity-90">{ticketType.description}</p>
      </div>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            
              <h4 className="text-sm font-medium text-neutral-500">{t("tickets.ticketDetails")}</h4>
              <p className="text-sm text-neutral-600">Ticket #{ticket.id}</p>
              <p className="font-medium">
                {ticket.quantity} {ticket.quantity > 1 ? "tickets" : "ticket"}
              </p>
            </div>
            
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-neutral-500 mt-0.5" />
              
                <h4 className="font-medium">{formatDate(ticket.visitDate)}</h4>
                <p className="text-sm text-neutral-500">
                  {t("tickets.bookingDate")}: {format(new Date(ticket.createdAt), "PP")}
                </p>
              </div>
            </div>
            
            {exhibition && (
              <div className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-neutral-500 mt-0.5" />
                
                  <h4 className="font-medium">{exhibition.title}</h4>
                  <p className="text-sm text-neutral-500 line-clamp-2">
                    {exhibition.description}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-neutral-500 mt-0.5" />
              
                <p className="text-sm text-neutral-500">{t("tickets.hourTueThur")}</p>
                <p className="text-sm text-neutral-500">{t("tickets.hourFriday")}</p>
                <p className="text-sm text-neutral-500">{t("tickets.hourWeekend")}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center">
            {ticket.qrCodeData ? (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <QRCodeSVG value={ticket.qrCodeData} size={150} />
                <p className="text-center text-xs mt-2 text-neutral-500">Scan for entry</p>
              </div>
            ) : (
              <div className="bg-neutral-100 p-6 rounded-lg flex flex-col items-center justify-center">
                <p className="text-neutral-500 text-center">{ticket.isPaid ? "QR code will be generated after processing" : "Purchase your ticket to receive QR code"}</p>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <p className="font-semibold">{t("tickets.totalPrice")}: ${ticket.totalPrice.toFixed(2)}</p>
              <p className="text-sm text-neutral-500">
                {ticket.isPaid ? `${t("checkout.paymentSuccess")} • ${format(new Date(ticket.createdAt), "PP")}` : t("checkout.paymentPending")}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4 flex flex-wrap justify-between gap-2">
        {ticket.isPaid && !ticket.isUsed && new Date(ticket.visitDate) > new Date() && (
          <>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              {t("myTickets.downloadTicket")}
            </Button>
            <Button size="sm" className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              {t("myTickets.viewTicket")}
            </Button>
            {onCancel && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50" 
                onClick={() => onCancel(ticket.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t("myTickets.cancelTicket")}
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default TicketDisplay;
