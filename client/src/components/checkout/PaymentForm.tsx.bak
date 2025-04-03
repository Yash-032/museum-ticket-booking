import * as z from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Setup form schema
const paymentFormSchema = z.object({
  cardNumber: z
    .string()
    .min(16, { message: "Card number must be at least 16 digits" })
    .max(19, { message: "Card number must be no more than 19 digits" })
    .regex(/^[0-9\s-]+$/, { message: "Card number must contain only digits, spaces, or hyphens" }),
  nameOnCard: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be no more than 50 characters" }),
  expiryMonth: z.string().min(1, { message: "Expiry month is required" }),
  expiryYear: z.string().min(1, { message: "Expiry year is required" }),
  cvv: z
    .string()
    .min(3, { message: "CVV must be 3 or 4 digits" })
    .max(4, { message: "CVV must be 3 or 4 digits" })
    .regex(/^[0-9]+$/, { message: "CVV must contain only digits" }),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  totalAmount: number;
  ticketId: number;
  onPaymentSubmit: (ticketId: number) => void;
  isProcessing: boolean;
}

const PaymentForm = ({
  totalAmount,
  ticketId,
  onPaymentSubmit,
  isProcessing,
}: PaymentFormProps) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  // Initialize the form
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      nameOnCard: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
  });
  
  // Submit handler
  const handleSubmit = (data: PaymentFormData) => {
    onPaymentSubmit(ticketId);
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const val = value.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = val.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">{t("checkout.orderSummary")}</h3>
        <div className="flex justify-between py-2">
          <span>{t("checkout.subtotal")}</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2">
          <span>{t("checkout.tax")}</span>
          <span>${(totalAmount * 0.0).toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between py-2 font-medium">
          <span>{t("checkout.total")}</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nameOnCard"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("checkout.nameOnCard")}</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("checkout.cardNumber")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="4111 1111 1111 1111"
                    maxLength={19}
                    {...field}
                    onChange={(e) => {
                      const formatted = formatCardNumber(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormDescription>
                  {t("checkout.securePayment")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="expiryMonth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.expiryMonth")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, "0");
                          return (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiryYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.expiryYear")}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (currentYear + i).toString();
                          return (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("checkout.cvv")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="animate-spin mr-2">&#x1F504;</span>
                {t("checkout.processing")}
              </>
            ) : (
              t("checkout.payNow", { amount: `$${totalAmount.toFixed(2)}` })
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;