import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Ticket, 
  CreditCard, 
  QrCode 
} from "lucide-react";

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Description"),
    },
    {
      icon: <Ticket className="h-6 w-6" />,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Description"),
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Description"),
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: t("howItWorks.step4Title"),
      description: t("howItWorks.step4Description"),
    },
  ];
  
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-semibold text-2xl md:text-3xl text-neutral-900 mb-2">
            {t("howItWorks.title")}
          </h2>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="font-medium text-lg text-neutral-900 mb-2">
                {step.title}
              </h3>
              <p className="text-neutral-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button size="lg" id="openChatbotButton">
            {t("howItWorks.tryNow")}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
