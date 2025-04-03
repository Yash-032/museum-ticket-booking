import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { insertUserSchema } from "@shared/schema";

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(1, t("auth.usernameRequired")),
    password: z.string().min(1, t("auth.passwordRequired")),
    rememberMe: z.boolean().optional(),
  });

  // Register form schema - extending the insertUserSchema
  const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string().min(1, t("auth.confirmPasswordRequired")),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t("auth.acceptTermsRequired"),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("auth.passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

  // Form hooks
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      languagePreference: i18n.language || "en",
      acceptTerms: false,
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  // Handle register form submission
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    // Remove confirmPassword and acceptTerms 're not part of the API schema
    const { confirmPassword, acceptTerms, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Available languages
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  return (
    <>
      
        {t("meta.authTitle")} | MuseumTix</title>
      </Helmet>

      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Auth Forms */}
            <div className="flex-1">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{t("auth.welcomeToMuseumTix")}</CardTitle>
                  
                    {t("auth.accessYourAccount")}
                  </CardDescription>
                </CardHeader>
                
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
                      <TabsTrigger value="register">{t("auth.signUp")}</TabsTrigger>
                    </TabsList>

                    {/* Login Form */}
                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              
                                {t("auth.username")}</FormLabel>
                                
                                  <Input placeholder="john_doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              
                                {t("auth.password")}</FormLabel>
                                
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center justify-between mt-2">
                            <FormField
                              control={loginForm.control}
                              name="rememberMe"
                              render={({ field }) => (
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="rememberMe"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                  <label
                                    htmlFor="rememberMe"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {t("auth.rememberMe")}
                                  </label>
                                </div>
                              )}
                            />
                            <Button variant="link" className="px-0 h-auto font-normal" asChild>
                              <a href="#forgot-password">{t("auth.forgotPassword")}</a>
                            </Button>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full mt-6" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <div className="flex items-center">
                                <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                                {t("auth.loggingIn")}
                              </div>
                            ) : (
                              t("auth.login")
                            )}
                          </Button>
                        </form>
                      </Form>

                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-neutral-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-neutral-500">
                            {t("auth.orContinueWith")}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" type="button" className="flex items-center justify-center">
                          <FaGoogle className="mr-2 h-4 w-4" />
                          Google
                        </Button>
                        <Button variant="outline" type="button" className="flex items-center justify-center">
                          <FaFacebook className="mr-2 h-4 w-4" />
                          Facebook
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Register Form */}
                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <FormField
                            control={registerForm.control}
                            name="fullName"
                            render={({ field }) => (
                              
                                {t("auth.fullName")}</FormLabel>
                                
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                
                                  {t("auth.username")}</FormLabel>
                                  
                                    <Input placeholder="john_doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                
                                  {t("auth.email")}</FormLabel>
                                  
                                    <Input placeholder="john@example.com" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                
                                  {t("auth.password")}</FormLabel>
                                  
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                
                                  {t("auth.confirmPassword")}</FormLabel>
                                  
                                    <Input type="password" placeholder="••••••••" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={registerForm.control}
                            name="languagePreference"
                            render={({ field }) => (
                              
                                {t("auth.preferredLanguage")}</FormLabel>
                                <Select
                                  defaultValue={field.value}
                                  onValueChange={field.onChange}
                                >
                                  
                                    
                                      <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                  </FormControl>
                                  
                                    {languages.map((language) => (
                                      <SelectItem key={language.code} value={language.code}>
                                        {language.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="acceptTerms"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                                
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  
                                    {t("auth.acceptTermsAndConditions")}
                                  </FormLabel>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="w-full mt-6"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <div className="flex items-center">
                                <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                                {t("auth.registering")}
                              </div>
                            ) : (
                              t("auth.createAccount")
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-neutral-500">
                    {activeTab === "login" 
                      ? t("auth.dontHaveAccount") 
                      : t("auth.alreadyHaveAccount")}{" "}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto"
                      onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                    >
                      {activeTab === "login" ? t("auth.signUp") : t("auth.login")}
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </div>

            {/* Hero Section */}
            <div className="flex-1 bg-primary-600 text-white rounded-lg shadow-lg overflow-hidden hidden lg:block">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-black opacity-20">
                  <img 
                    src="https://images.unsplash.com/photo-1565060169194-19fabf63012c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                    alt="Museum gallery"
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                </div>
                <div className="relative h-full flex flex-col justify-center p-12">
                  <h2 className="text-3xl font-bold mb-6">
                    {t("auth.discoverArtAndCulture")}
                  </h2>
                  <p className="text-lg mb-8 text-neutral-100">
                    {t("auth.createAccountToBook")}
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <div className="bg-white bg-opacity-20 p-1 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      {t("auth.benefit1")}
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white bg-opacity-20 p-1 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      {t("auth.benefit2")}
                    </li>
                    <li className="flex items-center">
                      <div className="bg-white bg-opacity-20 p-1 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      {t("auth.benefit3")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
