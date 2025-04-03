import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import Sidebar from "@/components/admin/Sidebar";
import AnalyticsCard from "@/components/admin/AnalyticsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, DollarSign, CalendarClock, Ticket, BarChart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Fetch analytics data
  const { data: analytics = [] } = useQuery({
    queryKey: ["/api/analytics"],
  });
  
  // Fetch latest tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ["/api/tickets"],
  });
  
  // Fetch latest users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Fetch all exhibitions
  const { data: exhibitions = [] } = useQuery({
    queryKey: ["/api/exhibitions"],
  });
  
  // Get today's data or most recent data
  const latestAnalytics = analytics.length > 0 ? analytics[0] : null;
  
  // Get popular exhibition
  const popularExhibition = latestAnalytics && latestAnalytics.popularExhibitionId 
    ? exhibitions.find(e => e.id === latestAnalytics.popularExhibitionId)
    : null;
  
  // Get recent tickets and users
  const recentTickets = tickets.slice(0, 5);
  const recentUsers = users.slice(0, 5);
  
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        
          {t("meta.adminDashboardTitle")} | MuseumTix</title>
        </Helmet>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            
              <h1 className="text-2xl font-bold text-neutral-900">{t("admin.dashboard")}</h1>
              <p className="text-neutral-500">
                {t("admin.welcome", { name: user?.fullName || user?.username })}
              </p>
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm text-neutral-500">
                {format(new Date(), "EEEE, MMMM do yyyy")}
              </span>
            </div>
          </div>
          
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnalyticsCard
              title={t("admin.todayRevenue")}
              value={latestAnalytics ? `$${latestAnalytics.revenue.toFixed(2)}` : "$0.00"}
              icon={<DollarSign className="h-5 w-5" />}
              trend={latestAnalytics ? { value: 12.5, isPositive: true } : undefined}
              description={t("admin.comparedToYesterday")}
            />
            
            <AnalyticsCard
              title={t("admin.todayVisitors")}
              value={latestAnalytics ? latestAnalytics.visitorCount.toString() : "0"}
              icon={<Users className="h-5 w-5" />}
              trend={latestAnalytics ? { value: 8.2, isPositive: true } : undefined}
              description={t("admin.comparedToYesterday")}
            />
            
            <AnalyticsCard
              title={t("admin.totalBookings")}
              value={tickets.length.toString()}
              icon={<Ticket className="h-5 w-5" />}
            />
            
            <AnalyticsCard
              title={t("admin.popularExhibition")}
              value={popularExhibition ? popularExhibition.title : t("admin.none")}
              icon={<BarChart className="h-5 w-5" />}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                
                  {t("admin.recentBookings")}</CardTitle>
                  {t("admin.latestTicketBookings")}</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/tickets">
                    {t("admin.viewAll")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              
                {tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Ticket className="h-12 w-12 text-neutral-300 mb-2" />
                    <p className="text-neutral-500">{t("admin.noTicketsYet")}</p>
                  </div>
                ) : (
                  
                    
                      
                        {t("admin.id")}</TableHead>
                        {t("admin.user")}</TableHead>
                        {t("admin.date")}</TableHead>
                        {t("admin.status")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    
                      {recentTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">#{ticket.id}</TableCell>
                          User #{ticket.userId}</TableCell>
                          {format(new Date(ticket.visitDate), "MMM d, yyyy")}</TableCell>
                          
                            {ticket.isPaid ? (
                              <Badge variant="default" className="bg-emerald-500">Paid</Badge>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Users */}
            
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                
                  {t("admin.recentUsers")}</CardTitle>
                  {t("admin.newlyRegisteredUsers")}</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/users">
                    {t("admin.viewAll")}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              
                {users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Users className="h-12 w-12 text-neutral-300 mb-2" />
                    <p className="text-neutral-500">{t("admin.noUsersYet")}</p>
                  </div>
                ) : (
                  
                    
                      
                        {t("admin.id")}</TableHead>
                        {t("admin.name")}</TableHead>
                        {t("admin.email")}</TableHead>
                        {t("admin.joined")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    
                      {recentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">#{user.id}</TableCell>
                          {user.fullName || user.username}</TableCell>
                          {user.email}</TableCell>
                          {format(new Date(user.createdAt), "MMM d, yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.totalUsers")}</CardTitle>
              </CardHeader>
              
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 text-neutral-500 mr-1" />
                  <span className="text-xs text-neutral-500">{t("admin.activeAccounts")}</span>
                </div>
              </CardContent>
            </Card>
            
            
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.totalExhibitions")}</CardTitle>
              </CardHeader>
              
                <div className="text-2xl font-bold">{exhibitions.length}</div>
                <div className="flex items-center mt-1">
                  <CalendarClock className="h-4 w-4 text-neutral-500 mr-1" />
                  <span className="text-xs text-neutral-500">{t("admin.currentAndUpcoming")}</span>
                </div>
              </CardContent>
            </Card>
            
            
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("admin.conversionRate")}</CardTitle>
              </CardHeader>
              
                <div className="text-2xl font-bold">
                  {tickets.length > 0 && users.length > 0
                    ? `${Math.round((tickets.length / users.length) * 100)}%`
                    : "0%"}
                </div>
                <div className="flex items-center mt-1">
                  <BarChart className="h-4 w-4 text-neutral-500 mr-1" />
                  <span className="text-xs text-neutral-500">{t("admin.visitorsPerUser")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
