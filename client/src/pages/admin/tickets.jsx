import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Ticket, TicketType, User, Exhibition } from "@shared/schema";
import Sidebar from "@/components/admin/Sidebar";
import { DataTable } from "@/components/admin/DataTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Download,
  Calendar,
  Clock,
  User ,
  Ticket ,
  Image,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { QRCodeSVG } from "qrcode.react";

const AdminTickets = () => {
  const { t } = useTranslation();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketDetailsOpen, setTicketDetailsOpen] = useState(false);
  
  // Fetch tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });
  
  // Fetch ticket types for reference
  const { data: ticketTypes = [] } = useQuery<TicketType[]>({
    queryKey: ["/api/ticket-types"],
  });
  
  // Fetch users for reference
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Fetch exhibitions for reference
  const { data: exhibitions = [] } = useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
  });
  
  // Helper functions to find related entities
  const getTicketType = (ticketTypeId: number) => {
    return ticketTypes.find(type => type.id === ticketTypeId);
  };
  
  const getUser = (userId: number) => {
    return users.find(user => user.id === userId);
  };
  
  const getExhibition = (exhibitionId: number | null) => {
    if (!exhibitionId) return null;
    return exhibitions.find(exhibition => exhibition.id === exhibitionId);
  };
  
  // Table columns
  const columns: ColumnDef[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "userId",
      header: t("admin.user"),
      cell: ({ row }) => {
        const user = getUser(row.getValue("userId"));
        return user ? (
          <div className="flex items-center space-x-2">
            <UserIcon className="h-4 w-4 text-neutral-500" />
            {user.username}</span>
          </div>
        ) : (
          <span className="text-neutral-500">Unknown User</span>
        );
      },
    },
    {
      accessorKey: "ticketTypeId",
      header: t("admin.ticketType"),
      cell: ({ row }) => {
        const ticketType = getTicketType(row.getValue("ticketTypeId"));
        return ticketType ? (
          <div className="flex items-center space-x-2">
            <TicketIcon className="h-4 w-4 text-neutral-500" />
            {ticketType.name}</span>
          </div>
        ) : (
          <span className="text-neutral-500">Unknown Ticket Type</span>
        );
      },
    },
    {
      accessorKey: "exhibitionId",
      header: t("admin.exhibition"),
      cell: ({ row }) => {
        const exhibitionId = row.original.exhibitionId;
        if (!exhibitionId) return <span className="text-neutral-500">General Admission</span>;
        
        const exhibition = getExhibition(exhibitionId);
        return exhibition ? (
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4 text-neutral-500" />
            {exhibition.title}</span>
          </div>
        ) : (
          <span className="text-neutral-500">Unknown Exhibition</span>
        );
      },
    },
    {
      accessorKey: "visitDate",
      header: t("admin.visitDate"),
      cell: ({ row }) => format(new Date(row.original.visitDate), "MMM d, yyyy"),
    },
    {
      accessorKey: "totalPrice",
      header: t("admin.price"),
      cell: ({ row }) => (
        <div className="font-medium">${row.original.totalPrice.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "isPaid",
      header: t("admin.status"),
      cell: ({ row }) => {
        if (row.original.isUsed) {
          return <Badge variant="secondary">{t("myTickets.used")}</Badge>;
        }
        
        if (row.original.isPaid) {
          return <Badge variant="default" className="bg-emerald-500">{t("admin.paid")}</Badge>;
        }
        
        return <Badge variant="outline">{t("admin.unpaid")}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: t("admin.bookedOn"),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleViewTicket(row.original)}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">{t("admin.view")}</span>
        </Button>
      ),
    },
  ];
  
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailsOpen(true);
  };
  
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        
          {t("admin.tickets")} | MuseumTix</title>
        </Helmet>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            
              <h1 className="text-2xl font-bold text-neutral-900">{t("admin.ticketManagement")}</h1>
              <p className="text-neutral-500">{t("admin.ticketManagementDesc")}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              columns={columns}
              data={tickets}
              isLoading={isLoadingTickets}
              searchKey="id"
              searchPlaceholder={t("admin.searchTickets")}
            />
          </div>
        </div>
      </div>
      
      {/* Ticket Details Dialog */}
      <Dialog open={ticketDetailsOpen} onOpenChange={setTicketDetailsOpen}>
        <DialogContent className="max-w-3xl">
          
            {t("admin.ticketDetails")}</DialogTitle>
            
              {t("admin.ticketDetailsDescription")}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                
                  <h3 className="text-lg font-medium">{t("admin.ticketInfo")}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-neutral-500">{t("admin.ticketId")}:</div>
                    <div className="font-medium">#{selectedTicket.id}</div>
                    
                    <div className="text-neutral-500">{t("admin.ticketType")}:</div>
                    <div className="font-medium">
                      {getTicketType(selectedTicket.ticketTypeId)?.name || "Unknown"}
                    </div>
                    
                    <div className="text-neutral-500">{t("admin.quantity")}:</div>
                    <div className="font-medium">{selectedTicket.quantity}</div>
                    
                    <div className="text-neutral-500">{t("admin.price")}:</div>
                    <div className="font-medium">${selectedTicket.totalPrice.toFixed(2)}</div>
                    
                    <div className="text-neutral-500">{t("admin.status")}:</div>
                    
                      {selectedTicket.isUsed ? (
                        <Badge variant="secondary" className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("myTickets.used")}
                        </Badge>
                      ) : selectedTicket.isPaid ? (
                        <Badge className="bg-emerald-500 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t("admin.paid")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center">
                          <XCircle className="h-3 w-3 mr-1" />
                          {t("admin.unpaid")}
                        </Badge>
                      )}
                    </div>
                    
                    {selectedTicket.paymentIntentId && (
                      <>
                        <div className="text-neutral-500">{t("admin.paymentId")}:</div>
                        <div className="font-medium">{selectedTicket.paymentIntentId}</div>
                      </>
                    )}
                  </div>
                </div>
                
                
                  <h3 className="text-lg font-medium">{t("admin.visitDetails")}</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                      
                        <div className="font-medium">{format(new Date(selectedTicket.visitDate), "EEEE, MMMM do, yyyy")}</div>
                        <div className="text-sm text-neutral-500">{t("admin.visitDate")}</div>
                      </div>
                    </div>
                    
                    {selectedTicket.exhibitionId && (
                      <div className="flex items-start">
                        <Image className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                        
                          <div className="font-medium">
                            {getExhibition(selectedTicket.exhibitionId)?.title || "Unknown Exhibition"}
                          </div>
                          <div className="text-sm text-neutral-500">{t("admin.exhibition")}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                      
                        <div className="font-medium">{format(new Date(selectedTicket.createdAt), "MMMM do, yyyy")}</div>
                        <div className="text-sm text-neutral-500">{t("admin.bookedOn")}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                
                  <h3 className="text-lg font-medium">{t("admin.customerInfo")}</h3>
                  <div className="mt-2">
                    {(() => {
                      const user = getUser(selectedTicket.userId);
                      if (!user) return User not found</div>;
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <UserIcon className="h-5 w-5 text-neutral-500 mr-2 mt-0.5" />
                            
                              <div className="font-medium">{user.fullName || user.username}</div>
                              <div className="text-sm text-neutral-500">{user.email}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-neutral-50">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-medium">{t("admin.ticketQrCode")}</h3>
                  <p className="text-sm text-neutral-500 mt-1">{t("admin.scanToVerify")}</p>
                </div>
                
                {selectedTicket.qrCodeData ? (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <QRCodeSVG value={selectedTicket.qrCodeData} size={200} />
                  </div>
                ) : (
                  <div className="bg-neutral-100 p-8 rounded-lg flex flex-col items-center justify-center">
                    <TicketIcon className="h-16 w-16 text-neutral-300 mb-4" />
                    <p className="text-neutral-500 text-center">
                      {selectedTicket.isPaid 
                        ? t("admin.qrCodeProcessing") 
                        : t("admin.qrCodeUnavailable")}
                    </p>
                  </div>
                )}
                
                <div className="mt-8 w-full space-y-2">
                  {selectedTicket.isPaid && (
                    <Button className="w-full" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      {t("admin.downloadTicket")}
                    </Button>
                  )}
                  
                  {!selectedTicket.isPaid && (
                    <Button className="w-full">
                      <DollarSign className="mr-2 h-4 w-4" />
                      {t("admin.markAsPaid")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTickets;
