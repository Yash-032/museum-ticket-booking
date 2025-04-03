import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { insertTicketSchema } from "@shared/schema";
import { useLocation } from "wouter";

interface TicketFormProps {
  selectedTicketTypeId?: number;
  selectedExhibitionId?: number;
  onSubmit: (data: TicketFormData) => void;
}



const ticketFormSchema = insertTicketSchema.extend({
  visitTime: z.string().min(1, "Please select a time"),
});

const TicketForm = ({
  selectedTicketTypeId,
  selectedExhibitionId,
  onSubmit,
}: TicketFormProps) => {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  
  const { data: ticketTypes = [] } = useQuery({
    queryKey: ["/api/ticket-types"],
  });
  
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(Date.now() + 24 * 60 * 60 * 1000) // tomorrow
  );
  
  const form = useForm({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      ticketTypeId: selectedTicketTypeId || undefined,
      exhibitionId: selectedExhibitionId || undefined,
      quantity: 1,
      visitDate: selectedDate,
      visitTime: "10:00",
      totalPrice: 0,
    },
  });
  
  // Update total price when ticket type or quantity changes
  const watchTicketTypeId = form.watch("ticketTypeId");
  const watchQuantity = form.watch("quantity");
  
  // Calculate and update total price
  const calculateTotalPrice = () => {
    if (!watchTicketTypeId || !watchQuantity) return 0;
    
    const selectedTicketType = ticketTypes.find(
      (type) => type.id === watchTicketTypeId
    );
    
    if (!selectedTicketType) return 0;
    
    return selectedTicketType.price * watchQuantity;
  };
  
  // Update total price when dependencies change
  useState(() => {
    const totalPrice = calculateTotalPrice();
    form.setValue("totalPrice", totalPrice);
  });
  
  const handleSubmit = (data: TicketFormData) => {
    // Calculate final price
    const totalPrice = calculateTotalPrice();
    onSubmit({
      ...data,
      totalPrice,
    });
  };
  
  const timeSlots = [
    "10:00", "11:00", "12:00", "13:00", "14:00", 
    "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
  ];
  
  // Disable past dates
  const disabledDates = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="ticketTypeId"
          render={({ field }) => (
            
              {t("tickets.selectTicket")}</FormLabel>
              <Select
                value={field.value?.toString()}
                onValueChange={(value) => field.onChange(parseInt(value))}
              >
                
                  
                    <SelectValue placeholder={t("tickets.selectTicket")} />
                  </SelectTrigger>
                </FormControl>
                
                  {ticketTypes.map((ticketType) => (
                    <SelectItem
                      key={ticketType.id}
                      value={ticketType.id.toString()}
                    >
                      {ticketType.name} - ${ticketType.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="exhibitionId"
          render={({ field }) => (
            
              {t("tickets.exhibition")}</FormLabel>
              <Select
                value={field.value?.toString() || ""}
                onValueChange={(value) => 
                  field.onChange(value ? parseInt(value) : undefined)
                }
              >
                
                  
                    <SelectValue placeholder={t("tickets.selectExhibition")} />
                  </SelectTrigger>
                </FormControl>
                
                  <SelectItem value="">No specific exhibition</SelectItem>
                  {exhibitions.map((exhibition) => (
                    <SelectItem
                      key={exhibition.id}
                      value={exhibition.id.toString()}
                    >
                      {exhibition.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
                {t("tickets.exhibitionOptional")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            
              {t("tickets.quantity")}</FormLabel>
              
                <Input
                  type="number"
                  min={1}
                  max={20}
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    field.onChange(value);
                    
                    // Update total price
                    setTimeout(() => {
                      const totalPrice = calculateTotalPrice();
                      form.setValue("totalPrice", totalPrice);
                    }, 0);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="visitDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                {t("tickets.date")}</FormLabel>
                
                  <PopoverTrigger asChild>
                    
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          {t("tickets.selectDate")}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value }
                      onSelect={(date) => {
                        setSelectedDate(date);
                        field.onChange(date);
                      }}
                      disabled={disabledDates}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="visitTime"
            render={({ field }) => (
              
                {t("tickets.time")}</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  
                    
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                  </FormControl>
                  
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between font-semibold text-lg mb-6">
            {t("tickets.totalPrice")}</span>
            ${calculateTotalPrice().toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/tickets")}
              className="w-full"
            >
              {t("checkout.returnToCart")}
            </Button>
            <Button type="submit" className="w-full">
              {t("tickets.proceedToCheckout")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default TicketForm;
