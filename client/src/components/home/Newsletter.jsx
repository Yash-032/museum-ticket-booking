import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Newsletter = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: t("newsletter.error"),
        description: t("newsletter.errorMessage"),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: t("newsletter.success"),
        description: t("newsletter.successMessage"),
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <section className="py-12 bg-primary-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-semibold text-2xl md:text-3xl mb-3">
            {t("newsletter.title")}
          </h2>
          <p className="text-primary-100 mb-6">
            {t("newsletter.description")}
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("newsletter.placeholder")}
              className="bg-white text-neutral-800 flex-grow py-6"
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-primary-700 hover:bg-neutral-100 py-6 px-6 whitespace-nowrap"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></span>
                  {t("newsletter.sending")}
                </span>
              ) : (
                t("newsletter.subscribe")
              )}
            </Button>
          </form>
          
          <p className="text-xs text-primary-200 mt-4">
            {t("newsletter.policy")}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
