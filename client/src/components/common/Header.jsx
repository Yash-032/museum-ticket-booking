import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LandmarkIcon, Menu, X, ChevronDown, Globe, User } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: "/", label: t("navigation.home") },
    { path: "/exhibitions", label: t("navigation.exhibitions") },
    { path: "/tickets", label: t("navigation.tickets") },
  ];

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <LandmarkIcon className="h-6 w-6 text-primary-600 mr-2" />
              <span className="font-semibold text-xl text-primary-600">MuseumTix</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`text-neutral-600 hover:text-primary-600 transition-colors font-medium ${
                  location === link.path ? "text-primary-600" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {languages.find(l => l.code === i18n.language)?.name || "English"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem 
                      key={lang.code} 
                      onClick={() => changeLanguage(lang.code)}
                      className={i18n.language === lang.code ? "bg-muted font-medium" : ""}
                    >
                      {lang.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {!user ? (
              <div className="flex items-center space-x-2">
                <Link href="/auth" className="text-neutral-600 hover:text-primary-600 transition-colors font-medium">
                  {t("auth.login")}
                </Link>
                <Link href="/auth">
                  <Button size="sm">{t("auth.signUp")}</Button>
                </Link>
              </div>
            ) : (
              
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user.fullName || user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/my-tickets">{t("navigation.myTickets")}</Link>
                  </DropdownMenuItem>
                  
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">{t("navigation.adminDashboard")}</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("auth.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 py-2">
          <div className="container mx-auto px-4 space-y-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                className={`block py-2 text-neutral-600 hover:text-primary-600 transition-colors font-medium ${
                  location === link.path ? "text-primary-600" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {user && (
              <Link 
                href="/my-tickets"
                className="block py-2 text-neutral-600 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navigation.myTickets")}
              </Link>
            )}
            
            {user && user.isAdmin && (
              <Link 
                href="/admin"
                className="block py-2 text-neutral-600 hover:text-primary-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("navigation.adminDashboard")}
              </Link>
            )}
            
            <div className="py-2">
              <select 
                className="bg-neutral-100 border border-neutral-300 text-neutral-700 py-1 px-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
