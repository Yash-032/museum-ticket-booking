import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TicketType } from "@shared/schema";
import { Link } from "wouter";

interface TicketCardProps {
  ticketType: TicketType;
  onSelect?: () => void;
}

const TicketCard = ({ ticketType, onSelect }: TicketCardProps) => {
  const { t } = useTranslation();

  // Determine the color based on the ticketType.color
  const getColorClass = () => {
    switch (ticketType.color) {
      case 'primary':
        return 'bg-primary-600';
      case 'accent':
        return 'bg-amber-500';
      case 'neutral':
        return 'bg-neutral-800';
      default:
        return 'bg-primary-600';
    }
  };

  // Same for button colors
  const getButtonClass = () => {
    switch (ticketType.color) {
      case 'primary':
        return 'bg-primary-600 hover:bg-primary-700';
      case 'accent':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'neutral':
        return 'bg-neutral-800 hover:bg-neutral-900';
      default:
        return 'bg-primary-600 hover:bg-primary-700';
    }
  };

  return (
    <Card className="overflow-hidden shadow-md border border-neutral-200 flex flex-col h-full">
      <CardHeader className={`${getColorClass()} text-white p-5`}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">{ticketType.name}</h3>
          {ticketType.isPopular && (
            <span className="bg-white text-amber-500 text-xs px-2 py-1 rounded-full font-medium">
              {t("tickets.popular")}
            </span>
          )}
        </div>
        <p className="text-neutral-100 text-sm mt-1">{ticketType.description}</p>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow">
        <div className="mb-4">
          <span className="text-2xl font-semibold text-neutral-900">${ticketType.price.toFixed(2)}</span>
          <span className="text-neutral-600"> / {t("tickets.person")}</span>
        </div>
        
        <ul className="space-y-2 mb-6">
          {ticketType.includes.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-neutral-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      
      <div className="px-5 pb-5 mt-auto">
        {onSelect ? (
          <Button 
            className={`w-full ${getButtonClass()} text-white`}
            onClick={onSelect}
          >
            {t("tickets.selectTicket")}
          </Button>
        ) : (
          <Link href={`/tickets?type=${ticketType.id}`}>
            <Button 
              className={`w-full ${getButtonClass()} text-white`}
            >
              {t("tickets.selectTicket")}
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default TicketCard;
