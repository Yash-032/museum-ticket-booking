import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { User } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Mail, User as UserIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserFormData {
  username: string;
  email: string;
  fullName?: string;
  password?: string;
  isAdmin: boolean;
}

const AdminUsers = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    fullName: "",
    password: "",
    isAdmin: false,
  });

  // Fetch users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await apiRequest("POST", "/api/users", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.userCreated"),
        description: t("admin.userCreatedDesc"),
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: t("admin.userCreateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: { id: number; user: Partial<UserFormData> }) => {
      const res = await apiRequest("PUT", `/api/users/${data.id}`, data.user);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: t("admin.userUpdated"),
        description: t("admin.userUpdatedDesc"),
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: t("admin.userUpdateError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("admin.userDeleted"),
        description: t("admin.userDeletedDesc"),
      });
      setDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error) => {
      toast({
        title: t("admin.userDeleteError"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-medium">#{row.getValue("id")}</div>,
    },
    {
      accessorKey: "username",
      header: t("admin.username"),
    },
    {
      accessorKey: "email",
      header: t("admin.email"),
    },
    {
      accessorKey: "fullName",
      header: t("admin.fullName"),
    },
    {
      accessorKey: "isAdmin",
      header: t("admin.role"),
      cell: ({ row }) => (
        <Badge variant={row.original.isAdmin ? "default" : "outline"}>
          {row.original.isAdmin ? t("admin.adminUser") : t("admin.regularUser")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("admin.createdAt"),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditUser(row.original)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">{t("admin.edit")}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteUser(row.original)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">{t("admin.delete")}</span>
          </Button>
        </div>
      ),
    },
  ];

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      fullName: "",
      password: "",
      isAdmin: false,
    });
  };

  const handleCreateUser = () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: t("admin.formError"),
        description: t("admin.requiredFieldsError"),
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(formData);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName || "",
      password: "",
      isAdmin: user.isAdmin,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    if (!formData.username || !formData.email) {
      toast({
        title: t("admin.formError"),
        description: t("admin.requiredFieldsError"),
        variant: "destructive",
      });
      return;
    }

    const updateData: Partial<UserFormData> = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      isAdmin: formData.isAdmin,
    };

    // Only include password if it was entered
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateUserMutation.mutate({
      id: selectedUser.id,
      user: updateData,
    });
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <Helmet>
          <title>{t("admin.users")} | MuseumTix</title>
        </Helmet>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{t("admin.userManagement")}</h1>
              <p className="text-neutral-500">{t("admin.userManagementDesc")}</p>
            </div>
            
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("admin.addUser")}
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <DataTable
              columns={columns}
              data={users}
              isLoading={isLoading}
              searchKey="username"
              searchPlaceholder={t("admin.searchUsers")}
            />
          </div>
        </div>
      </div>
      
      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.addNewUser")}</DialogTitle>
            <DialogDescription>{t("admin.addNewUserDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">{t("admin.username")} *</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">{t("admin.email")} *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("admin.fullName")}</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">{t("admin.password")} *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => handleCheckboxChange("isAdmin", !!checked)}
              />
              <Label htmlFor="isAdmin">{t("admin.isAdmin")}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? t("admin.creating") : t("admin.createUser")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.editUser")}</DialogTitle>
            <DialogDescription>{t("admin.editUserDescription")}</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-username">{t("admin.username")} *</Label>
              <Input
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-email">{t("admin.email")} *</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-fullName">{t("admin.fullName")}</Label>
              <Input
                id="edit-fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-password">{t("admin.newPassword")}</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t("admin.leaveBlankToKeep")}
              />
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="edit-isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => handleCheckboxChange("isAdmin", !!checked)}
              />
              <Label htmlFor="edit-isAdmin">{t("admin.isAdmin")}</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t("admin.cancel")}
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? t("admin.saving") : t("admin.saveChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.confirmDeleteUser")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.deleteUserWarning", { username: selectedUser?.username })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("admin.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? t("admin.deleting") : t("admin.deleteUser")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
