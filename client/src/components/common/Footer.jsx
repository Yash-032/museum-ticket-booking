import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { 
  LandmarkIcon,
  PhoneIcon,
  MailIcon,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-neutral-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
            <div className="flex items-center mb-4">
              <LandmarkIcon className="text-primary-500 h-6 w-6 mr-2" />
              <span className="font-semibold text-xl">MuseumTix</span>
            </div>
            <p className="text-neutral-400 mb-4">
              {t("footer.description")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          
            <h3 className="font-medium text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
                  {t("navigation.home")}
                </Link>
              </li>
              
                <Link href="/exhibitions" className="text-neutral-400 hover:text-white transition-colors">
                  {t("navigation.exhibitions")}
                </Link>
              </li>
              
                <Link href="/tickets" className="text-neutral-400 hover:text-white transition-colors">
                  {t("navigation.tickets")}
                </Link>
              </li>
            </ul>
          </div>
          
          
            <h3 className="font-medium text-lg mb-4">{t("footer.visitUs")}</h3>
            <address className="text-neutral-400 not-italic">
              123 Museum Avenue<br />
              New York, NY 10001<br />
              United States
            </address>
            <p className="text-neutral-400 mt-2">
              <strong className="text-white">{t("footer.hours")}:</strong><br />
              {t("footer.hoursTueThur")}<br />
              {t("footer.hoursFri")}<br />
              {t("footer.hoursSatSun")}
            </p>
          </div>
          
          
            <h3 className="font-medium text-lg mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2 text-primary-500" />
                +1 (212) 555-1234
              </li>
              <li className="flex items-center">
                <MailIcon className="h-4 w-4 mr-2 text-primary-500" />
                info@museumtix.com
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-800 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-500 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} MuseumTix. {t("footer.allRightsReserved")}
            </p>
            <div className="flex space-x-4 text-sm text-neutral-500">
              <a href="#" className="hover:text-white transition-colors">
                {t("footer.privacyPolicy")}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t("footer.termsOfService")}
              </a>
              <a href="#" className="hover:text-white transition-colors">
                {t("footer.accessibility")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
