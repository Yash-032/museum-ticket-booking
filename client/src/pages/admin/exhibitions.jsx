import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Exhibition } from "@shared/schema";
import Sidebar from "@/components/admin/Sidebar";
import { DataTable } from "@/components/admin/DataTable";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, CalendarIcon, Image } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface ExhibitionFormData {
  title: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  isFeatured: boolean;
  isNew: boolean;
}

const AdminExhibitions = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    isFeatured: false,
    isNew: false,
  });

  // Fetch exhibitions
  const { data: exhibitions = [], isLoading } = useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
  });

  // Create exhibition mutation
  const createExhibitionMutation = useMutation({
    mutationFn: async (data: ExhibitionFormData) => {
      const res = await apiRequest("POST", "/api/exhibitions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.exhibitionCreated"),
        description: t("admin.exhibitionCreatedDesc"),
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t("admin.exhibitionCreateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update exhibition mutation
  const updateExhibitionMutation = useMutation({
    mutationFn: async (data: { id: number; exhibition: ExhibitionFormData }) => {
      const res = await apiRequest("PUT", `/api/exhibitions/${data.id}`, data.exhibition);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.exhibitionUpdated"),
        description: t("admin.exhibitionUpdatedDesc"),
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
    },
    onError: (error) => {
      toast({
        title: t("admin.exhibitionUpdateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete exhibition mutation
  const deleteExhibitionMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exhibitions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("admin.exhibitionDeleted"),
        description: t("admin.exhibitionDeletedDesc"),
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/exhibitions"] });
    },
    onError: (error) => {
      toast({
        title: t("admin.exhibitionDeleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Table columns
  const columns: ColumnDef[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "title",
      header: t("admin.title"),
    },
    {
      accessorKey: "startDate",
      header: t("admin.startDate"),
      cell: ({ row }) => format(new Date(row.getValue("startDate")), "MMM d, yyyy"),
    },
    {
      accessorKey: "endDate",
      header: t("admin.endDate"),
      cell: ({ row }) => format(new Date(row.getValue("endDate")), "MMM d, yyyy"),
    },
    {
      accessorKey: "isFeatured",
      header: t("admin.featured"),
      cell: ({ row }) => (
        row.getValue("isFeatured") ? (
          <Badge variant="default">{t("admin.yes")}</Badge>
        ) : (
          <Badge variant="outline">{t("admin.no")}</Badge>
        )
      ),
    },
    {
      accessorKey: "isNew",
      header: t("admin.new"),
      cell: ({ row }) => (
        row.getValue("isNew") ? (
          <Badge variant="secondary" className="bg-emerald-500 text-white hover:bg-emerald-600">{t("admin.yes")}</Badge>
        ) : (
          <Badge variant="outline">{t("admin.no")}</Badge>
        )
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditExhibition(row.original)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t("admin.edit")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteExhibition(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">{t("admin.delete")}</span>
          </Button>
        </div>
      ),
    },
  ];

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleDateChange = (name: 'startDate' | 'endDate', date?: Date) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      isFeatured: false,
      isNew: false,
    });
  };

  const handleCreateExhibition = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: t("admin.formError"),
        description: t("admin.requiredFieldsError"),
        variant: "destructive",
      });
      return;
    }
    
    // Check date validity
    if (formData.startDate > formData.endDate) {
      toast({
        title: t("admin.dateError"),
        description: t("admin.endDateBeforeStartDate"),
        variant: "destructive",
      });
      return;
    }
    
    createExhibitionMutation.mutate(formData);
  };

  const handleEditExhibition = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setFormData({
      title: exhibition.title,
      description: exhibition.description,
      imageUrl: exhibition.imageUrl || "",
      startDate: new Date(exhibition.startDate),
      endDate: new Date(exhibition.endDate),
      isFeatured: exhibition.isFeatured,
      isNew: exhibition.isNew,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateExhibition = () => {
    if (!selectedExhibition) return;
    if (!formData.title || !formData.description) {
      toast({
        title: t("admin.formError"),
        description: t("admin.requiredFieldsError"),
        variant: "destructive",
      });
      return;
    }
    
    // Check date validity
    if (formData.startDate > formData.endDate) {
      toast({
        title: t("admin.dateError"),
        description: t("admin.endDateBeforeStartDate"),
        variant: "destructive",
      });
      return;
    }
    
    updateExhibitionMutation.mutate({
      id: selectedExhibition.id,
      exhibition: formData,
    });
  };

  const handleDeleteExhibition = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteExhibition = () => {
    if (selectedExhibition) {
      deleteExhibitionMutation.mutate(selectedExhibition.id);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        
          {t("admin.exhibitions")} | MuseumTix</title>
        </Helmet>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            
              <h1 className="text-2xl font-bold text-neutral-900">{t("admin.exhibitionManagement")}</h1>
              <p className="text-neutral-500">{t("admin.exhibitionManagementDesc")}</p>
            </div>
            
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.addExhibition")}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              columns={columns}
              data={exhibitions}
              isLoading={isLoading}
              searchKey="title"
              searchPlaceholder={t("admin.searchExhibitions")}
            />
          </div>
        </div>
      </div>
      
      {/* Exhibition Form - used for both Create and Edit */}
      {(createDialogOpen || editDialogOpen) && (
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              createDialogOpen ? setCreateDialogOpen(false) : setEditDialogOpen(false);
            }
          }}
        >
          <DialogContent className="max-w-xl">
            
              
                {createDialogOpen ? t("admin.addExhibition") : t("admin.editExhibition")}
              </DialogTitle>
              
                {createDialogOpen
                  ? t("admin.addExhibitionDescription")
                  : t("admin.editExhibitionDescription")}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">{t("admin.title")} *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">{t("admin.description")} *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">{t("admin.imageUrl")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <div className="w-10 h-10 rounded-md overflow-hidden border border-neutral-200 flex-shrink-0">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = "https://placehold.co/40x40?text=Error")}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  {t("admin.startDate")} *</Label>
                  
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.startDate ? (
                          format(formData.startDate, "PPP")
                        ) : (
                          {t("admin.pickDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleDateChange('startDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  {t("admin.endDate")} *</Label>
                  
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.endDate ? (
                          format(formData.endDate, "PPP")
                        ) : (
                          {t("admin.pickDate")}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => handleDateChange('endDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => handleCheckboxChange("isFeatured", !!checked)}
                  />
                  <Label htmlFor="isFeatured">{t("admin.isFeatured")}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) => handleCheckboxChange("isNew", !!checked)}
                  />
                  <Label htmlFor="isNew">{t("admin.isNew")}</Label>
                </div>
              </div>
            </div>
            
            
              <Button
                variant="outline"
                onClick={() => {
                  createDialogOpen ? setCreateDialogOpen(false) : setEditDialogOpen(false);
                }}
              >
                {t("admin.cancel")}
              </Button>
              <Button
                onClick={createDialogOpen ? handleCreateExhibition : handleUpdateExhibition}
                disabled={createExhibitionMutation.isPending || updateExhibitionMutation.isPending}
              >
                {createDialogOpen
                  ? createExhibitionMutation.isPending
                    ? t("admin.creating")
                    : t("admin.createExhibition")
                  : updateExhibitionMutation.isPending
                  ? t("admin.saving")
                  : t("admin.saveChanges")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Exhibition Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        
          
            {t("admin.confirmDeleteExhibition")}</AlertDialogTitle>
            
              {t("admin.deleteExhibitionWarning", { title: selectedExhibition?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
            {t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteExhibition}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExhibitionMutation.isPending}
            >
              {deleteExhibitionMutation.isPending ? t("admin.deleting") : t("admin.deleteExhibition")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExhibitions;
