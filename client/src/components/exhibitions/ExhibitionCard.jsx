import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Exhibition } from "@shared/schema";

interface ExhibitionCardProps {
  exhibition: Exhibition;
}

const ExhibitionCard = ({ exhibition }: ExhibitionCardProps) => {
  const { t } = useTranslation();
  
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy");
  };
  
  return (
    <Card className="overflow-hidden transition-transform hover:-translate-y-1 museum-card">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={exhibition.imageUrl || "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"} 
          alt={exhibition.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-neutral-900">{exhibition.title}</h3>
          <div className="flex gap-1">
            {exhibition.isFeatured && (
              <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
                {t("exhibitions.featured")}
              </Badge>
            )}
            {exhibition.isNew && (
              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                {t("exhibitions.new")}
              </Badge>
            )}
          </div>
        </div>
        
        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {exhibition.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-neutral-500 flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(exhibition.startDate)} - {formatDate(exhibition.endDate)}
          </div>
          
          <Link href={`/tickets?exhibition=${exhibition.id}`}>
            <Button size="sm">
              {t("exhibitions.bookNow")}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExhibitionCard;
