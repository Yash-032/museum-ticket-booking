import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import { Testimonial } from "@shared/schema";

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-amber-500 text-amber-500" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-amber-500 text-amber-500" />);
    }
    
    return stars;
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className="text-amber-500 flex">
            {renderStars(testimonial.rating)}
          </div>
        </div>
        
        <p className="text-neutral-700 mb-4">"{testimonial.content}"</p>
        
        <div className="flex items-center">
          <img 
            src={testimonial.avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(testimonial.name)} 
            alt={testimonial.name} 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="font-medium text-neutral-900">{testimonial.name}</div>
            {testimonial.role && (
              <div className="text-sm text-neutral-500">{testimonial.role}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Testimonials = () => {
  const { t } = useTranslation();
  
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["/api/testimonials"],
  });
  
  return (
    <section className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-2xl md:text-3xl text-neutral-900 mb-2">
            {t("testimonials.title")}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {t("testimonials.subtitle")}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial: Testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
