import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative bg-primary-800 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80" 
          alt="Museum exhibition" 
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-bold text-3xl md:text-5xl mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-neutral-100 mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/tickets">
              <Button size="lg" variant="default" className="bg-white text-primary-600 hover:bg-neutral-100">
                {t("hero.bookNow")}
              </Button>
            </Link>
            <Link href="/exhibitions">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("hero.viewExhibitions")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
