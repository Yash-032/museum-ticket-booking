import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation, useSearch } from "wouter";
import { Helmet } from "react-helmet";
import PaymentForm from "@/components/checkout/PaymentForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const CheckoutPage = () => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  
  const searchParams = new URLSearchParams(search);
  
  // Get ticket from URL params - these would be added when coming from the tickets page
  const ticketTypeId = searchParams.get('ticket') ? parseInt(searchParams.get('ticket')!) : undefined;
  const quantity = searchParams.get('quantity') ? parseInt(searchParams.get('quantity')!) : 1;
  const visitDate = searchParams.get('date') ? new Date(searchParams.get('date')!) : new Date();
  const visitTime = searchParams.get('time') || "10:00";
  const exhibitionId = searchParams.get('exhibition') ? parseInt(searchParams.get('exhibition')!) : undefined;
  
  // Fetch ticket type
  const { data: ticketType } = useQuery<any>({
    queryKey: ["/api/ticket-types", ticketTypeId],
    enabled: !!ticketTypeId,
  });
  
  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      const res = await apiRequest("POST", "/api/tickets", ticketData);
      return await res.json();
    },
    onSuccess: (data) => {
      setTicketId(data.id);
    },
    onError: (error) => {
      toast({
        title: t("checkout.ticketCreateError"),
        description: error.message,
        variant: "destructive",
      });
      setIsError(true);
    },
  });
  
  // Process payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tickets/${id}/payment`, {
        paymentMethod: "card",
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("checkout.paymentSuccess"),
        description: t("checkout.paymentSuccessDesc"),
      });
      setIsSuccess(true);
      
      // Invalidate tickets cache
      queryClient.invalidateQueries({ queryKey: ["/api/tickets"] });
      
      // Redirect to my tickets page after a delay
      setTimeout(() => {
        setLocation("/my-tickets");
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: t("checkout.paymentError"),
        description: error.message,
        variant: "destructive",
      });
      setIsError(true);
    },
  });
  
  // Calculate total price
  const totalPrice = ticketType && 'price' in ticketType ? ticketType.price * quantity : 0;
  
  // Create ticket on component mount
  useEffect(() => {
    if (user && ticketTypeId && !isSuccess && !isError && !ticketId) {
      createTicketMutation.mutate({
        ticketTypeId,
        userId: user.id,
        quantity,
        visitDate,
        visitTime,
        exhibitionId,
        totalPrice,
      });
    }
  }, [user, ticketTypeId, isSuccess, isError, ticketId]);
  
  // Handle payment submission
  const handlePaymentSubmit = (id: number) => {
    processPaymentMutation.mutate(id);
  };
  
  if (!ticketTypeId || !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle>{t("checkout.invalidCheckout")}</CardTitle>
            <CardDescription>{t("checkout.invalidCheckoutDesc")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/tickets")}>
              {t("checkout.backToTickets")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-emerald-500" />
            </div>
            <CardTitle>{t("checkout.paymentSuccessTitle")}</CardTitle>
            <CardDescription>{t("checkout.paymentSuccessDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">{t("checkout.redirecting")}</p>
            <Button onClick={() => setLocation("/my-tickets")}>
              {t("checkout.viewMyTickets")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle>{t("checkout.paymentErrorTitle")}</CardTitle>
            <CardDescription>{t("checkout.paymentErrorDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">{t("checkout.tryAgainMessage")}</p>
            <Button onClick={() => window.location.reload()}>
              {t("checkout.tryAgain")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{t("meta.checkoutTitle")} | MuseumTix</title>
      </Helmet>
      
      <div className="bg-neutral-50 py-8 md:py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("checkout.title")}</h1>
            <p className="text-neutral-600">{t("checkout.subtitle")}</p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{t("checkout.paymentDetails")}</CardTitle>
              <CardDescription>{t("checkout.paymentDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              {ticketId && (
                <PaymentForm
                  totalAmount={totalPrice}
                  ticketId={ticketId}
                  onPaymentSubmit={handlePaymentSubmit}
                  isProcessing={processPaymentMutation.isPending}
                />
              )}
              
              {createTicketMutation.isPending && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;