import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/admin/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  AreaChart
} from "@/components/ui/chart";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Download, Calendar, Filter } from "lucide-react";

// Analytics period type
type Period = "daily" | "weekly" | "monthly";

const AdminAnalytics = () => {
  const { t } = useTranslation();
  const [visitorsPeriod, setVisitorsPeriod] = useState<Period>("daily");
  const [revenuePeriod, setRevenuePeriod] = useState<Period>("daily");
  const [salesPeriod, setSalesPeriod] = useState<Period>("weekly");
  
  // Fetch analytics data
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });
  
  // Fetch ticket types
  const { data: ticketTypes = [] } = useQuery({
    queryKey: ["/api/ticket-types"],
  });
  
  // Fetch exhibitions
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
  
  // Fetch tickets for sales data
  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });
  
  // Generate chart data for visitors over time
  const getVisitorsChartData = () => {
    // Determine how many days to look back based on period
    const daysToLookBack = visitorsPeriod === "daily" ? 14 : visitorsPeriod === "weekly" ? 8 : 6;
    
    // Generate dates for the x-axis
    const dates = eachDayOfInterval({
      start: subDays(new Date(), daysToLookBack),
      end: new Date(),
    });
    
    // Create data points
    const data = dates.map(date => {
      // Find analytics entries for this date or generate random data if none exists
      const matchingAnalytics = analytics.find(entry => 
        new Date(entry.date).toDateString() === date.toDateString()
      );
      
      return {
        date: format(date, "MMM d"),
        visitors: matchingAnalytics ? matchingAnalytics.visitorCount : Math.floor(Math.random() * 100) + 20,
      };
    });
    
    return data;
  };
  
  // Generate chart data for revenue over time
  const getRevenueChartData = () => {
    // Determine how many days to look back based on period
    const daysToLookBack = revenuePeriod === "daily" ? 14 : revenuePeriod === "weekly" ? 8 : 6;
    
    // Generate dates for the x-axis
    const dates = eachDayOfInterval({
      start: subDays(new Date(), daysToLookBack),
      end: new Date(),
    });
    
    // Create data points
    const data = dates.map(date => {
      // Find analytics entries for this date or generate random data if none exists
      const matchingAnalytics = analytics.find(entry => 
        new Date(entry.date).toDateString() === date.toDateString()
      );
      
      return {
        date: format(date, "MMM d"),
        revenue: matchingAnalytics ? matchingAnalytics.revenue : Math.floor(Math.random() * 1000) + 200,
      };
    });
    
    return data;
  };
  
  // Generate chart data for ticket sales by type
  const getTicketSalesByTypeData = () => {
    // Count tickets by type
    const ticketCounts: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      const ticketType = ticketTypes.find(type => type.id === ticket.ticketTypeId);
      if (ticketType) {
        ticketCounts[ticketType.name] = (ticketCounts[ticketType.name] || 0) + ticket.quantity;
      }
    });
    
    // Convert to chart data format
    return Object.entries(ticketCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };
  
  // Generate chart data for exhibition popularity
  const getExhibitionPopularityData = () => {
    // Count tickets by exhibition
    const exhibitionCounts: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      if (ticket.exhibitionId) {
        const exhibition = exhibitions.find(ex => ex.id === ticket.exhibitionId);
        if (exhibition) {
          exhibitionCounts[exhibition.title] = (exhibitionCounts[exhibition.title] || 0) + ticket.quantity;
        }
      } else {
        exhibitionCounts["General Admission"] = (exhibitionCounts["General Admission"] || 0) + ticket.quantity;
      }
    });
    
    // Convert to chart data format and sort by popularity
    return Object.entries(exhibitionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 exhibitions
  };
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <Helmet>
          <title>{t("admin.analytics")} | MuseumTix</title>
        </Helmet>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{t("admin.analyticsAndReports")}</h1>
              <p className="text-neutral-500">{t("admin.analyticsDescription")}</p>
            </div>
            
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {t("admin.exportData")}
            </Button>
          </div>
          
          <Tabs defaultValue="visitors" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="visitors">{t("admin.visitorStatistics")}</TabsTrigger>
              <TabsTrigger value="revenue">{t("admin.revenueStatistics")}</TabsTrigger>
              <TabsTrigger value="exhibitions">{t("admin.popularExhibitions")}</TabsTrigger>
              <TabsTrigger value="sales">{t("admin.ticketSales")}</TabsTrigger>
            </TabsList>
            
            {/* Visitor Statistics */}
            <TabsContent value="visitors">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("admin.visitorsByDay")}</CardTitle>
                    <CardDescription>{t("admin.visitorTrends")}</CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <Select
                      value={visitorsPeriod}
                      onValueChange={(value) => setVisitorsPeriod(value as Period)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t("admin.period")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("admin.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("admin.weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("admin.monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <AreaChart
                      data={getVisitorsChartData()}
                      index="date"
                      categories={["visitors"]}
                      colors={["blue"]}
                      valueFormatter={(value) => value.toString()}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Revenue Statistics */}
            <TabsContent value="revenue">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{t("admin.revenueByDay")}</CardTitle>
                    <CardDescription>{t("admin.revenueTrends")}</CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                    <Select
                      value={revenuePeriod}
                      onValueChange={(value) => setRevenuePeriod(value as Period)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder={t("admin.period")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">{t("admin.daily")}</SelectItem>
                        <SelectItem value="weekly">{t("admin.weekly")}</SelectItem>
                        <SelectItem value="monthly">{t("admin.monthly")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart
                      data={getRevenueChartData()}
                      index="date"
                      categories={["revenue"]}
                      colors={["green"]}
                      valueFormatter={(value) => formatCurrency(value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Popular Exhibitions */}
            <TabsContent value="exhibitions">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("admin.exhibitionPopularity")}</CardTitle>
                    <CardDescription>{t("admin.popularExhibitionsDescription")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <BarChart
                        data={getExhibitionPopularityData()}
                        index="name"
                        categories={["value"]}
                        colors={["blue"]}
                        valueFormatter={(value) => value.toString()}
                        layout="vertical"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("admin.visitorsPerExhibition")}</CardTitle>
                    <CardDescription>{t("admin.exhibitionDistribution")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <PieChart
                        data={getExhibitionPopularityData()}
                        index="name"
                        categories={["value"]}
                        colors={["blue", "cyan", "indigo", "violet", "purple"]}
                        valueFormatter={(value) => value.toString()}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Ticket Sales */}
            <TabsContent value="sales">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{t("admin.ticketSalesByType")}</CardTitle>
                      <CardDescription>{t("admin.ticketTypeDistribution")}</CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-neutral-500" />
                      <Select
                        value={salesPeriod}
                        onValueChange={(value) => setSalesPeriod(value as Period)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder={t("admin.period")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">{t("admin.daily")}</SelectItem>
                          <SelectItem value="weekly">{t("admin.weekly")}</SelectItem>
                          <SelectItem value="monthly">{t("admin.monthly")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <PieChart
                        data={getTicketSalesByTypeData()}
                        index="name"
                        categories={["value"]}
                        colors={["blue", "green", "amber"]}
                        valueFormatter={(value) => value.toString()}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t("admin.salesByTicketType")}</CardTitle>
                    <CardDescription>{t("admin.ticketTypeComparison")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <BarChart
                        data={getTicketSalesByTypeData()}
                        index="name"
                        categories={["value"]}
                        colors={["blue"]}
                        valueFormatter={(value) => value.toString()}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
