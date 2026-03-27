import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, UserProfile, UserRole } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, 
  Loader2, 
  Search, 
  Shield, 
  User, 
  UserCog, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Trash2,
  Save,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

const ROLES = [
  { value: "user", label: "User", icon: User, color: "bg-muted text-muted-foreground" },
  { value: "moderator", label: "Moderator", icon: UserCog, color: "bg-secondary text-secondary-foreground" },
  { value: "admin", label: "Admin", icon: Shield, color: "bg-primary text-primary-foreground" },
] as const;

export const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isViewMode, setIsViewMode] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });

  const { data: allRoles } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: () => adminApi.getUserRoles(),
  });

  const addRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) =>
      adminApi.addUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast({ title: "Role added successfully" });
      if (selectedUser) {
        fetchUserRoles(selectedUser.user_id);
      }
    },
    onError: (error: Error) => {
      toast({ title: "Error adding role", description: error.message, variant: "destructive" });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: (roleId: string) => adminApi.removeUserRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast({ title: "Role removed successfully" });
      if (selectedUser) {
        fetchUserRoles(selectedUser.user_id);
      }
      setRoleToDelete(null);
      setDeleteConfirmOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error removing role", description: error.message, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) =>
      adminApi.updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Profile updated successfully" });
      setEditingUser(null);
      setIsViewMode(true);
    },
    onError: (error: Error) => {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    },
  });

  const fetchUserRoles = async (userId: string) => {
    try {
      const roles = await adminApi.getUserRolesById(userId);
      setUserRoles(roles);
    } catch {
      setUserRoles([]);
    }
  };

  const handleViewUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setEditingUser({ ...user });
    setIsViewMode(true);
    await fetchUserRoles(user.user_id);
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setEditingUser({ ...selectedUser });
      setIsViewMode(false);
    }
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateProfileMutation.mutate({
        id: editingUser.user_id,
        data: {
          full_name: editingUser.full_name,
          phone: editingUser.phone,
          address: editingUser.address,
          city: editingUser.city,
          postal_code: editingUser.postal_code,
        },
      });
    }
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setEditingUser(null);
    setIsViewMode(true);
    setUserRoles([]);
  };

  const getUserRoles = (userId: string): UserRole[] => {
    return allRoles?.filter((role) => role.user_id === userId) || [];
  };

  const usersList: UserProfile[] = Array.isArray(users) ? users : [];
  const rolesList: UserRole[] = Array.isArray(allRoles) ? allRoles : [];

  const filteredUsers = usersList.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (roleFilter === "all") return matchesSearch;
    
    const roles = getUserRoles(user.user_id);
    return matchesSearch && roles.some((r) => r.role === roleFilter);
  });

  const getRoleBadgeClass = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role);
    return roleConfig?.color || "bg-muted text-muted-foreground";
  };

  const handleAddRole = (role: string) => {
    if (!selectedUser) return;
    
    const existingRole = userRoles.find((r) => r.role === role);
    if (existingRole) {
      toast({ title: "User already has this role", variant: "destructive" });
      return;
    }
    
    addRoleMutation.mutate({ userId: selectedUser.user_id, role: role as 'admin' | 'moderator' | 'user' });
  };

  const confirmDeleteRole = (role: UserRole) => {
    setRoleToDelete(role);
    setDeleteConfirmOpen(true);
  };

  const totalUsers = usersList.length;
  const adminCount = rolesList.filter(r => r.role === "admin").length;
  const moderatorCount = rolesList.filter(r => r.role === "moderator").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            User Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage all registered users and their access roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{adminCount}</p>
                <p className="text-sm text-muted-foreground">Administrators</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/50">
                <UserCog className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{moderatorCount}</p>
                <p className="text-sm text-muted-foreground">Moderators</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-44 bg-card border-border">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <role.icon className="h-4 w-4" />
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Roles</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const roles = getUserRoles(user.user_id);
                    return (
                      <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                              <span className="text-primary-foreground font-semibold text-lg">
                                {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.full_name || "No name"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {user.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                {user.phone}
                              </div>
                            )}
                            {user.city && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                {user.city}
                              </div>
                            )}
                            {!user.phone && !user.city && (
                              <span className="text-sm text-muted-foreground/60">Not provided</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {roles.length > 0 ? (
                              roles.map((role) => (
                                <Badge
                                  key={role.id}
                                  className={`capitalize ${getRoleBadgeClass(role.role)}`}
                                >
                                  {role.role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground/60">No roles</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="hover:bg-primary/10 hover:text-primary"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No users found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {searchQuery ? "Try a different search term" : "No users have registered yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="font-display text-xl flex items-center gap-3">
              {isViewMode ? (
                <>
                  <Eye className="h-5 w-5 text-primary" />
                  User Details
                </>
              ) : (
                <>
                  <Pencil className="h-5 w-5 text-primary" />
                  Edit User
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && editingUser && (
            <div className="space-y-6 py-4">
              {/* User Avatar & Basic Info */}
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground text-3xl font-semibold">
                    {editingUser.full_name?.charAt(0).toUpperCase() || editingUser.email?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  {isViewMode ? (
                    <>
                      <h3 className="font-display text-xl font-semibold text-foreground">
                        {editingUser.full_name || "No name"}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {editingUser.email}
                      </p>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <Input
                          value={editingUser.full_name || ""}
                          onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                          className="mt-1"
                          placeholder="Enter full name"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {editingUser.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone</Label>
                    {isViewMode ? (
                      <p className="font-medium text-foreground mt-1">
                        {editingUser.phone || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        value={editingUser.phone || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                        className="mt-1"
                        placeholder="Enter phone number"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    {isViewMode ? (
                      <p className="font-medium text-foreground mt-1">
                        {editingUser.city || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        value={editingUser.city || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                        className="mt-1"
                        placeholder="Enter city"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    {isViewMode ? (
                      <p className="font-medium text-foreground mt-1">
                        {editingUser.address || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        value={editingUser.address || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                        className="mt-1"
                        placeholder="Enter address"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Postal Code</Label>
                    {isViewMode ? (
                      <p className="font-medium text-foreground mt-1">
                        {editingUser.postal_code || "Not provided"}
                      </p>
                    ) : (
                      <Input
                        value={editingUser.postal_code || ""}
                        onChange={(e) => setEditingUser({ ...editingUser, postal_code: e.target.value })}
                        className="mt-1"
                        placeholder="Enter postal code"
                      />
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role Management */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Role Management
                </h4>
                
                {/* Current Roles */}
                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground block mb-2">Current Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {userRoles.length > 0 ? (
                      userRoles.map((role) => (
                        <Badge
                          key={role.id}
                          className={`capitalize px-3 py-1.5 ${getRoleBadgeClass(role.role)} group cursor-pointer transition-all hover:opacity-80`}
                          onClick={() => confirmDeleteRole(role)}
                        >
                          {role.role}
                          <Trash2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>
                
                {/* Add Role Buttons */}
                <div>
                  <Label className="text-xs text-muted-foreground block mb-2">Add Role</Label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => {
                      const hasRole = userRoles.some((r) => r.role === role.value);
                      return (
                        <Button
                          key={role.value}
                          variant={hasRole ? "secondary" : "outline"}
                          size="sm"
                          disabled={hasRole || addRoleMutation.isPending}
                          onClick={() => handleAddRole(role.value)}
                          className={`capitalize ${hasRole ? "opacity-50" : "hover:bg-primary/10 hover:text-primary hover:border-primary"}`}
                        >
                          <role.icon className="mr-1.5 h-3.5 w-3.5" />
                          {hasRole ? `Has ${role.label}` : `Add ${role.label}`}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">User ID</span>
                  <code className="font-mono text-xs bg-card px-2 py-1 rounded">
                    {selectedUser.user_id.slice(0, 8)}...
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Joined</span>
                  <span className="text-foreground">
                    {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4 border-t border-border">
            {isViewMode ? (
              <>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button onClick={handleEditUser} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit User
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsViewMode(true)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveUser} 
                  disabled={updateProfileMutation.isPending}
                  className="gap-2"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the <strong className="capitalize">{roleToDelete?.role}</strong> role from this user? This action can be undone by adding the role back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && removeRoleMutation.mutate(roleToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeRoleMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Remove Role"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};












// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { adminApi, UserProfile, UserRole } from "@/lib/api/admin";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Pencil, 
//   Loader2, 
//   Search, 
//   Shield, 
//   User, 
//   UserCog, 
//   Mail, 
//   Phone, 
//   MapPin,
//   Calendar,
//   UserPlus,
//   Trash2,
//   Save,
//   Eye
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// const ROLES = [
//   { value: "user", label: "User", icon: User, color: "bg-muted text-muted-foreground" },
//   { value: "moderator", label: "Moderator", icon: UserCog, color: "bg-secondary text-secondary-foreground" },
//   { value: "admin", label: "Admin", icon: Shield, color: "bg-primary text-primary-foreground" },
// ] as const;

// export const UserManagement = () => {
//   const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
//   const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
//   const [userRoles, setUserRoles] = useState<UserRole[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [roleFilter, setRoleFilter] = useState<string>("all");
//   const [isViewMode, setIsViewMode] = useState(true);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: users, isLoading } = useQuery({
//     queryKey: ["admin-users"],
//     queryFn: () => adminApi.getUsers(),
//   });

//   const { data: allRoles } = useQuery({
//     queryKey: ["admin-all-roles"],
//     queryFn: () => adminApi.getUserRoles(),
//   });

//   const addRoleMutation = useMutation({
//     mutationFn: ({ userId, role }: { userId: string; role: 'admin' | 'moderator' | 'user' }) =>
//       adminApi.addUserRole(userId, role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
//       toast({ title: "Role added successfully" });
//       if (selectedUser) {
//         fetchUserRoles(selectedUser.user_id);
//       }
//     },
//     onError: (error: any) => {
//       toast({ title: "Error adding role", description: error.message, variant: "destructive" });
//     },
//   });

//   const removeRoleMutation = useMutation({
//     mutationFn: (roleId: string) => adminApi.removeUserRole(roleId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
//       toast({ title: "Role removed successfully" });
//       if (selectedUser) {
//         fetchUserRoles(selectedUser.user_id);
//       }
//       setRoleToDelete(null);
//       setDeleteConfirmOpen(false);
//     },
//     onError: (error: any) => {
//       toast({ title: "Error removing role", description: error.message, variant: "destructive" });
//     },
//   });

//   const updateProfileMutation = useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<UserProfile> }) =>
//       adminApi.updateUserProfile(id, data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
//       toast({ title: "Profile updated successfully" });
//       setEditingUser(null);
//       setIsViewMode(true);
//     },
//     onError: (error: any) => {
//       toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
//     },
//   });

//   const fetchUserRoles = async (userId: string) => {
//     try {
//       const roles = await adminApi.getUserRolesById(userId);
//       setUserRoles(roles);
//     } catch (error) {
//       console.error('Error fetching user roles:', error);
//       setUserRoles([]);
//     }
//   };

//   const handleViewUser = async (user: UserProfile) => {
//     setSelectedUser(user);
//     setEditingUser({ ...user });
//     setIsViewMode(true);
//     await fetchUserRoles(user.user_id);
//   };

//   const handleEditUser = () => {
//     if (selectedUser) {
//       setEditingUser({ ...selectedUser });
//       setIsViewMode(false);
//     }
//   };

//   const handleSaveUser = () => {
//     if (editingUser) {
//       updateProfileMutation.mutate({
//         id: editingUser.id,
//         data: {
//           full_name: editingUser.full_name,
//           phone: editingUser.phone,
//           address: editingUser.address,
//           city: editingUser.city,
//           postal_code: editingUser.postal_code,
//         },
//       });
//     }
//   };

//   const handleCloseDialog = () => {
//     setSelectedUser(null);
//     setEditingUser(null);
//     setIsViewMode(true);
//     setUserRoles([]);
//   };

//   const getUserRoles = (userId: string): UserRole[] => {
//     return allRoles?.filter((role) => role.user_id === userId) || [];
//   };

//   const usersList = Array.isArray(users) ? users : [];
//   const rolesList = Array.isArray(allRoles) ? allRoles : [];

//   const filteredUsers = usersList.filter((user) => {
//     const matchesSearch =
//       user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
//     if (roleFilter === "all") return matchesSearch;
    
//     const roles = getUserRoles(user.user_id);
//     return matchesSearch && roles.some((r) => r.role === roleFilter);
//   });

//   const getRoleBadgeClass = (role: string) => {
//     const roleConfig = ROLES.find(r => r.value === role);
//     return roleConfig?.color || "bg-muted text-muted-foreground";
//   };

//   const handleAddRole = (role: string) => {
//     if (!selectedUser) return;
    
//     const existingRole = userRoles.find((r) => r.role === role);
//     if (existingRole) {
//       toast({ title: "User already has this role", variant: "destructive" });
//       return;
//     }
    
//     addRoleMutation.mutate({ userId: selectedUser.user_id, role: role as 'admin' | 'moderator' | 'user' });
//   };

//   const confirmDeleteRole = (role: UserRole) => {
//     setRoleToDelete(role);
//     setDeleteConfirmOpen(true);
//   };

//   const totalUsers = usersList.length;
//   const adminCount = rolesList.filter(r => r.role === "admin").length;
//   const moderatorCount = rolesList.filter(r => r.role === "moderator").length;

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="font-display text-3xl font-semibold text-foreground">
//             User Management
//           </h2>
//           <p className="text-muted-foreground mt-1">
//             Manage all registered users and their access roles
//           </p>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-5">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-xl bg-primary/10">
//                 <User className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <p className="text-2xl font-semibold text-foreground">{totalUsers}</p>
//                 <p className="text-sm text-muted-foreground">Total Users</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-5">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-xl bg-primary/10">
//                 <Shield className="h-6 w-6 text-primary" />
//               </div>
//               <div>
//                 <p className="text-2xl font-semibold text-foreground">{adminCount}</p>
//                 <p className="text-sm text-muted-foreground">Administrators</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-5">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-xl bg-secondary/50">
//                 <UserCog className="h-6 w-6 text-secondary-foreground" />
//               </div>
//               <div>
//                 <p className="text-2xl font-semibold text-foreground">{moderatorCount}</p>
//                 <p className="text-sm text-muted-foreground">Moderators</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Users Table */}
//       <Card className="border-border overflow-hidden">
//         <CardHeader className="bg-muted/30 border-b border-border">
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search by name or email..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="pl-10 bg-card border-border"
//               />
//             </div>
//             <Select value={roleFilter} onValueChange={setRoleFilter}>
//               <SelectTrigger className="w-44 bg-card border-border">
//                 <SelectValue placeholder="Filter by role" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Roles</SelectItem>
//                 {ROLES.map((role) => (
//                   <SelectItem key={role.value} value={role.value}>
//                     <div className="flex items-center gap-2">
//                       <role.icon className="h-4 w-4" />
//                       {role.label}
//                     </div>
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>
//         <CardContent className="p-0">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-48">
//               <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//           ) : filteredUsers.length > 0 ? (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-muted/20 hover:bg-muted/20">
//                     <TableHead className="font-semibold">User</TableHead>
//                     <TableHead className="font-semibold">Contact</TableHead>
//                     <TableHead className="font-semibold">Roles</TableHead>
//                     <TableHead className="font-semibold">Joined</TableHead>
//                     <TableHead className="text-right font-semibold">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredUsers.map((user) => {
//                     const roles = getUserRoles(user.user_id);
//                     return (
//                       <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
//                         <TableCell>
//                           <div className="flex items-center gap-3">
//                             <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
//                               <span className="text-primary-foreground font-semibold text-lg">
//                                 {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
//                               </span>
//                             </div>
//                             <div>
//                               <p className="font-medium text-foreground">
//                                 {user.full_name || "No name"}
//                               </p>
//                               <p className="text-sm text-muted-foreground truncate max-w-[200px]">
//                                 {user.email || "No email"}
//                               </p>
//                             </div>
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex flex-col gap-1">
//                             {user.phone && (
//                               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                                 <Phone className="h-3.5 w-3.5" />
//                                 {user.phone}
//                               </div>
//                             )}
//                             {user.city && (
//                               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                                 <MapPin className="h-3.5 w-3.5" />
//                                 {user.city}
//                               </div>
//                             )}
//                             {!user.phone && !user.city && (
//                               <span className="text-sm text-muted-foreground/60">Not provided</span>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex flex-wrap gap-1.5">
//                             {roles.length > 0 ? (
//                               roles.map((role) => (
//                                 <Badge
//                                   key={role.id}
//                                   className={`capitalize ${getRoleBadgeClass(role.role)}`}
//                                 >
//                                   {role.role}
//                                 </Badge>
//                               ))
//                             ) : (
//                               <span className="text-sm text-muted-foreground/60">No roles</span>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
//                             <Calendar className="h-3.5 w-3.5" />
//                             {new Date(user.created_at).toLocaleDateString("en-US", {
//                               year: "numeric",
//                               month: "short",
//                               day: "numeric"
//                             })}
//                           </div>
//                         </TableCell>
//                         <TableCell className="text-right">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleViewUser(user)}
//                             className="hover:bg-primary/10 hover:text-primary"
//                           >
//                             <Eye className="h-4 w-4 mr-1" />
//                             View
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-16 text-center">
//               <div className="p-4 rounded-full bg-muted/50 mb-4">
//                 <User className="h-8 w-8 text-muted-foreground" />
//               </div>
//               <p className="text-muted-foreground font-medium">No users found</p>
//               <p className="text-sm text-muted-foreground/70 mt-1">
//                 {searchQuery ? "Try a different search term" : "No users have registered yet"}
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* User Detail Dialog */}
//       <Dialog open={!!selectedUser} onOpenChange={handleCloseDialog}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader className="pb-4 border-b border-border">
//             <DialogTitle className="font-display text-xl flex items-center gap-3">
//               {isViewMode ? (
//                 <>
//                   <Eye className="h-5 w-5 text-primary" />
//                   User Details
//                 </>
//               ) : (
//                 <>
//                   <Pencil className="h-5 w-5 text-primary" />
//                   Edit User
//                 </>
//               )}
//             </DialogTitle>
//           </DialogHeader>

//           {editingUser && (
//             <div className="space-y-6 py-4">
//               {/* Profile Section */}
//               <div className="flex items-start gap-6">
//                 <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg flex-shrink-0">
//                   <span className="text-primary-foreground font-bold text-3xl">
//                     {editingUser.full_name?.charAt(0).toUpperCase() || editingUser.email?.charAt(0).toUpperCase() || "U"}
//                   </span>
//                 </div>
//                 <div className="flex-1 space-y-4">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
//                       {isViewMode ? (
//                         <p className="text-foreground">{editingUser.full_name || "Not provided"}</p>
//                       ) : (
//                         <Input
//                           id="full_name"
//                           value={editingUser.full_name || ""}
//                           onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
//                         />
//                       )}
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
//                         <Mail className="h-4 w-4" />
//                         Email
//                       </Label>
//                       <p className="text-muted-foreground">{editingUser.email || "Not provided"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Contact Information */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
//                     <Phone className="h-4 w-4" />
//                     Phone
//                   </Label>
//                   {isViewMode ? (
//                     <p className="text-foreground">{editingUser.phone || "Not provided"}</p>
//                   ) : (
//                     <Input
//                       id="phone"
//                       value={editingUser.phone || ""}
//                       onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
//                     />
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="city" className="text-sm font-medium flex items-center gap-2">
//                     <MapPin className="h-4 w-4" />
//                     City
//                   </Label>
//                   {isViewMode ? (
//                     <p className="text-foreground">{editingUser.city || "Not provided"}</p>
//                   ) : (
//                     <Input
//                       id="city"
//                       value={editingUser.city || ""}
//                       onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
//                     />
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="address" className="text-sm font-medium">Address</Label>
//                   {isViewMode ? (
//                     <p className="text-foreground">{editingUser.address || "Not provided"}</p>
//                   ) : (
//                     <Input
//                       id="address"
//                       value={editingUser.address || ""}
//                       onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
//                     />
//                   )}
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="postal_code" className="text-sm font-medium">Postal Code</Label>
//                   {isViewMode ? (
//                     <p className="text-foreground">{editingUser.postal_code || "Not provided"}</p>
//                   ) : (
//                     <Input
//                       id="postal_code"
//                       value={editingUser.postal_code || ""}
//                       onChange={(e) => setEditingUser({ ...editingUser, postal_code: e.target.value })}
//                     />
//                   )}
//                 </div>
//               </div>

//               <Separator />

//               {/* Roles Section */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <Label className="text-sm font-medium flex items-center gap-2">
//                     <Shield className="h-4 w-4" />
//                     User Roles
//                   </Label>
//                   {!isViewMode && (
//                     <Select onValueChange={handleAddRole}>
//                       <SelectTrigger className="w-40">
//                         <UserPlus className="h-4 w-4 mr-2" />
//                         <SelectValue placeholder="Add role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ROLES.map((role) => (
//                           <SelectItem key={role.value} value={role.value}>
//                             <div className="flex items-center gap-2">
//                               <role.icon className="h-4 w-4" />
//                               {role.label}
//                             </div>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   )}
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {userRoles.length > 0 ? (
//                     userRoles.map((role) => (
//                       <Badge
//                         key={role.id}
//                         className={`capitalize ${getRoleBadgeClass(role.role)} ${!isViewMode ? 'pr-1' : ''}`}
//                       >
//                         {role.role}
//                         {!isViewMode && (
//                           <button
//                             onClick={() => confirmDeleteRole(role)}
//                             className="ml-2 hover:bg-white/20 rounded-full p-0.5"
//                           >
//                             <Trash2 className="h-3 w-3" />
//                           </button>
//                         )}
//                       </Badge>
//                     ))
//                   ) : (
//                     <p className="text-sm text-muted-foreground">No roles assigned</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           <DialogFooter className="pt-4 border-t border-border">
//             {isViewMode ? (
//               <>
//                 <Button variant="outline" onClick={handleCloseDialog}>
//                   Close
//                 </Button>
//                 <Button onClick={handleEditUser}>
//                   <Pencil className="h-4 w-4 mr-2" />
//                   Edit User
//                 </Button>
//               </>
//             ) : (
//               <>
//                 <Button variant="outline" onClick={() => setIsViewMode(true)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleSaveUser} disabled={updateProfileMutation.isPending}>
//                   {updateProfileMutation.isPending ? (
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   ) : (
//                     <Save className="h-4 w-4 mr-2" />
//                   )}
//                   Save Changes
//                 </Button>
//               </>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Role Confirmation */}
//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Remove Role</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to remove the "{roleToDelete?.role}" role from this user?
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => roleToDelete && removeRoleMutation.mutate(roleToDelete.id)}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Remove
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };






// // import { useState } from "react";
// // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Card, CardContent, CardHeader } from "@/components/ui/card";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogFooter,
// // } from "@/components/ui/dialog";
// // import {
// //   Table,
// //   TableBody,
// //   TableCell,
// //   TableHead,
// //   TableHeader,
// //   TableRow,
// // } from "@/components/ui/table";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "@/components/ui/select";
// // import { Badge } from "@/components/ui/badge";
// // import { 
// //   Pencil, 
// //   Loader2, 
// //   Search, 
// //   Shield, 
// //   User, 
// //   UserCog, 
// //   Mail, 
// //   Phone, 
// //   MapPin,
// //   Calendar,
// //   UserPlus,
// //   Trash2,
// //   Save,
// //   Eye
// // } from "lucide-react";
// // import { useToast } from "@/hooks/use-toast";
// // import { Label } from "@/components/ui/label";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";

// // interface UserProfile {
// //   id: string;
// //   user_id: string;
// //   full_name: string | null;
// //   email: string | null;
// //   phone: string | null;
// //   address: string | null;
// //   city: string | null;
// //   postal_code: string | null;
// //   created_at: string;
// // }

// // interface UserRole {
// //   id: string;
// //   user_id: string;
// //   role: "admin" | "moderator" | "user";
// //   created_at: string;
// // }

// // const ROLES = [
// //   { value: "user", label: "User", icon: User, color: "bg-muted text-muted-foreground" },
// //   { value: "moderator", label: "Moderator", icon: UserCog, color: "bg-secondary text-secondary-foreground" },
// //   { value: "admin", label: "Admin", icon: Shield, color: "bg-primary text-primary-foreground" },
// // ] as const;

// // export const UserManagement = () => {
// //   const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
// //   const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
// //   const [userRoles, setUserRoles] = useState<UserRole[]>([]);
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [roleFilter, setRoleFilter] = useState<string>("all");
// //   const [isViewMode, setIsViewMode] = useState(true);
// //   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
// //   const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);
// //   const { toast } = useToast();
// //   const queryClient = useQueryClient();

// //   const { data: users, isLoading } = useQuery({
// //     queryKey: ["admin-users"],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("profiles")
// //         .select("*")
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       return data as UserProfile[];
// //     },
// //   });

// //   const { data: allRoles } = useQuery({
// //     queryKey: ["admin-all-roles"],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("user_roles")
// //         .select("*");
// //       if (error) throw error;
// //       return data as UserRole[];
// //     },
// //   });

// //   const addRoleMutation = useMutation({
// //     mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
// //       const { error } = await supabase.from("user_roles").insert({
// //         user_id: userId,
// //         role: role as "admin" | "moderator" | "user",
// //       });
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
// //       toast({ title: "Role added successfully" });
// //       if (selectedUser) {
// //         fetchUserRoles(selectedUser.user_id);
// //       }
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error adding role", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const removeRoleMutation = useMutation({
// //     mutationFn: async (roleId: string) => {
// //       const { error } = await supabase
// //         .from("user_roles")
// //         .delete()
// //         .eq("id", roleId);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
// //       toast({ title: "Role removed successfully" });
// //       if (selectedUser) {
// //         fetchUserRoles(selectedUser.user_id);
// //       }
// //       setRoleToDelete(null);
// //       setDeleteConfirmOpen(false);
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error removing role", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const updateProfileMutation = useMutation({
// //     mutationFn: async ({ id, data }: { id: string; data: Partial<UserProfile> }) => {
// //       const { error } = await supabase
// //         .from("profiles")
// //         .update(data)
// //         .eq("id", id);
// //       if (error) throw error;
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["admin-users"] });
// //       toast({ title: "Profile updated successfully" });
// //       setEditingUser(null);
// //       setIsViewMode(true);
// //     },
// //     onError: (error) => {
// //       toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
// //     },
// //   });

// //   const fetchUserRoles = async (userId: string) => {
// //     const { data } = await supabase
// //       .from("user_roles")
// //       .select("*")
// //       .eq("user_id", userId);
// //     setUserRoles(data || []);
// //   };

// //   const handleViewUser = async (user: UserProfile) => {
// //     setSelectedUser(user);
// //     setEditingUser({ ...user });
// //     setIsViewMode(true);
// //     await fetchUserRoles(user.user_id);
// //   };

// //   const handleEditUser = () => {
// //     if (selectedUser) {
// //       setEditingUser({ ...selectedUser });
// //       setIsViewMode(false);
// //     }
// //   };

// //   const handleSaveUser = () => {
// //     if (editingUser) {
// //       updateProfileMutation.mutate({
// //         id: editingUser.id,
// //         data: {
// //           full_name: editingUser.full_name,
// //           phone: editingUser.phone,
// //           address: editingUser.address,
// //           city: editingUser.city,
// //           postal_code: editingUser.postal_code,
// //         },
// //       });
// //     }
// //   };

// //   const handleCloseDialog = () => {
// //     setSelectedUser(null);
// //     setEditingUser(null);
// //     setIsViewMode(true);
// //     setUserRoles([]);
// //   };

// //   const getUserRoles = (userId: string): UserRole[] => {
// //     return allRoles?.filter((role) => role.user_id === userId) || [];
// //   };

// //   const filteredUsers = users?.filter((user) => {
// //     const matchesSearch =
// //       user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
// //     if (roleFilter === "all") return matchesSearch;
    
// //     const roles = getUserRoles(user.user_id);
// //     return matchesSearch && roles.some((r) => r.role === roleFilter);
// //   });

// //   const getRoleBadgeClass = (role: string) => {
// //     const roleConfig = ROLES.find(r => r.value === role);
// //     return roleConfig?.color || "bg-muted text-muted-foreground";
// //   };

// //   const handleAddRole = (role: string) => {
// //     if (!selectedUser) return;
    
// //     const existingRole = userRoles.find((r) => r.role === role);
// //     if (existingRole) {
// //       toast({ title: "User already has this role", variant: "destructive" });
// //       return;
// //     }
    
// //     addRoleMutation.mutate({ userId: selectedUser.user_id, role });
// //   };

// //   const confirmDeleteRole = (role: UserRole) => {
// //     setRoleToDelete(role);
// //     setDeleteConfirmOpen(true);
// //   };

// //   const totalUsers = users?.length || 0;
// //   const adminCount = allRoles?.filter(r => r.role === "admin").length || 0;
// //   const moderatorCount = allRoles?.filter(r => r.role === "moderator").length || 0;

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
// //         <div>
// //           <h2 className="font-display text-3xl font-semibold text-foreground">
// //             User Management
// //           </h2>
// //           <p className="text-muted-foreground mt-1">
// //             Manage all registered users and their access roles
// //           </p>
// //         </div>
// //       </div>

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-5">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-xl bg-primary/10">
// //                 <User className="h-6 w-6 text-primary" />
// //               </div>
// //               <div>
// //                 <p className="text-2xl font-semibold text-foreground">{totalUsers}</p>
// //                 <p className="text-sm text-muted-foreground">Total Users</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-5">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-xl bg-primary/10">
// //                 <Shield className="h-6 w-6 text-primary" />
// //               </div>
// //               <div>
// //                 <p className="text-2xl font-semibold text-foreground">{adminCount}</p>
// //                 <p className="text-sm text-muted-foreground">Administrators</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //         <Card className="border-border bg-gradient-to-br from-card to-muted/30">
// //           <CardContent className="p-5">
// //             <div className="flex items-center gap-4">
// //               <div className="p-3 rounded-xl bg-secondary/50">
// //                 <UserCog className="h-6 w-6 text-secondary-foreground" />
// //               </div>
// //               <div>
// //                 <p className="text-2xl font-semibold text-foreground">{moderatorCount}</p>
// //                 <p className="text-sm text-muted-foreground">Moderators</p>
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Users Table */}
// //       <Card className="border-border overflow-hidden">
// //         <CardHeader className="bg-muted/30 border-b border-border">
// //           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
// //             <div className="relative flex-1 max-w-md">
// //               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //               <Input
// //                 placeholder="Search by name or email..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="pl-10 bg-card border-border"
// //               />
// //             </div>
// //             <Select value={roleFilter} onValueChange={setRoleFilter}>
// //               <SelectTrigger className="w-44 bg-card border-border">
// //                 <SelectValue placeholder="Filter by role" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 <SelectItem value="all">All Roles</SelectItem>
// //                 {ROLES.map((role) => (
// //                   <SelectItem key={role.value} value={role.value}>
// //                     <div className="flex items-center gap-2">
// //                       <role.icon className="h-4 w-4" />
// //                       {role.label}
// //                     </div>
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>
// //         </CardHeader>
// //         <CardContent className="p-0">
// //           {isLoading ? (
// //             <div className="flex items-center justify-center h-48">
// //               <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //             </div>
// //           ) : filteredUsers && filteredUsers.length > 0 ? (
// //             <div className="overflow-x-auto">
// //               <Table>
// //                 <TableHeader>
// //                   <TableRow className="bg-muted/20 hover:bg-muted/20">
// //                     <TableHead className="font-semibold">User</TableHead>
// //                     <TableHead className="font-semibold">Contact</TableHead>
// //                     <TableHead className="font-semibold">Roles</TableHead>
// //                     <TableHead className="font-semibold">Joined</TableHead>
// //                     <TableHead className="text-right font-semibold">Actions</TableHead>
// //                   </TableRow>
// //                 </TableHeader>
// //                 <TableBody>
// //                   {filteredUsers.map((user) => {
// //                     const roles = getUserRoles(user.user_id);
// //                     return (
// //                       <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
// //                         <TableCell>
// //                           <div className="flex items-center gap-3">
// //                             <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
// //                               <span className="text-primary-foreground font-semibold text-lg">
// //                                 {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
// //                               </span>
// //                             </div>
// //                             <div>
// //                               <p className="font-medium text-foreground">
// //                                 {user.full_name || "No name"}
// //                               </p>
// //                               <p className="text-sm text-muted-foreground truncate max-w-[200px]">
// //                                 {user.email || "No email"}
// //                               </p>
// //                             </div>
// //                           </div>
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex flex-col gap-1">
// //                             {user.phone && (
// //                               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// //                                 <Phone className="h-3.5 w-3.5" />
// //                                 {user.phone}
// //                               </div>
// //                             )}
// //                             {user.city && (
// //                               <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// //                                 <MapPin className="h-3.5 w-3.5" />
// //                                 {user.city}
// //                               </div>
// //                             )}
// //                             {!user.phone && !user.city && (
// //                               <span className="text-sm text-muted-foreground/60">Not provided</span>
// //                             )}
// //                           </div>
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex flex-wrap gap-1.5">
// //                             {roles.length > 0 ? (
// //                               roles.map((role) => (
// //                                 <Badge
// //                                   key={role.id}
// //                                   className={`capitalize ${getRoleBadgeClass(role.role)}`}
// //                                 >
// //                                   {role.role}
// //                                 </Badge>
// //                               ))
// //                             ) : (
// //                               <span className="text-sm text-muted-foreground/60">No roles</span>
// //                             )}
// //                           </div>
// //                         </TableCell>
// //                         <TableCell>
// //                           <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
// //                             <Calendar className="h-3.5 w-3.5" />
// //                             {new Date(user.created_at).toLocaleDateString("en-US", {
// //                               year: "numeric",
// //                               month: "short",
// //                               day: "numeric"
// //                             })}
// //                           </div>
// //                         </TableCell>
// //                         <TableCell className="text-right">
// //                           <Button
// //                             variant="ghost"
// //                             size="sm"
// //                             onClick={() => handleViewUser(user)}
// //                             className="hover:bg-primary/10 hover:text-primary"
// //                           >
// //                             <Eye className="h-4 w-4 mr-1" />
// //                             View
// //                           </Button>
// //                         </TableCell>
// //                       </TableRow>
// //                     );
// //                   })}
// //                 </TableBody>
// //               </Table>
// //             </div>
// //           ) : (
// //             <div className="flex flex-col items-center justify-center py-16 text-center">
// //               <div className="p-4 rounded-full bg-muted/50 mb-4">
// //                 <User className="h-8 w-8 text-muted-foreground" />
// //               </div>
// //               <p className="text-muted-foreground font-medium">No users found</p>
// //               <p className="text-sm text-muted-foreground/70 mt-1">
// //                 {searchQuery ? "Try a different search term" : "No users have registered yet"}
// //               </p>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* User Detail Dialog */}
// //       <Dialog open={!!selectedUser} onOpenChange={handleCloseDialog}>
// //         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
// //           <DialogHeader className="pb-4 border-b border-border">
// //             <DialogTitle className="font-display text-xl flex items-center gap-3">
// //               {isViewMode ? (
// //                 <>
// //                   <Eye className="h-5 w-5 text-primary" />
// //                   User Details
// //                 </>
// //               ) : (
// //                 <>
// //                   <Pencil className="h-5 w-5 text-primary" />
// //                   Edit User
// //                 </>
// //               )}
// //             </DialogTitle>
// //           </DialogHeader>
          
// //           {selectedUser && editingUser && (
// //             <div className="space-y-6 py-4">
// //               {/* User Avatar & Basic Info */}
// //               <div className="flex items-center gap-5">
// //                 <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
// //                   <span className="text-primary-foreground text-3xl font-semibold">
// //                     {editingUser.full_name?.charAt(0).toUpperCase() || editingUser.email?.charAt(0).toUpperCase() || "U"}
// //                   </span>
// //                 </div>
// //                 <div className="flex-1">
// //                   {isViewMode ? (
// //                     <>
// //                       <h3 className="font-display text-xl font-semibold text-foreground">
// //                         {editingUser.full_name || "No name"}
// //                       </h3>
// //                       <p className="text-muted-foreground flex items-center gap-2 mt-1">
// //                         <Mail className="h-4 w-4" />
// //                         {editingUser.email}
// //                       </p>
// //                     </>
// //                   ) : (
// //                     <div className="space-y-3">
// //                       <div>
// //                         <Label className="text-xs text-muted-foreground">Full Name</Label>
// //                         <Input
// //                           value={editingUser.full_name || ""}
// //                           onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
// //                           className="mt-1"
// //                           placeholder="Enter full name"
// //                         />
// //                       </div>
// //                       <p className="text-sm text-muted-foreground flex items-center gap-2">
// //                         <Mail className="h-4 w-4" />
// //                         {editingUser.email}
// //                       </p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <Separator />

// //               {/* Contact Information */}
// //               <div>
// //                 <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
// //                   <Phone className="h-4 w-4 text-primary" />
// //                   Contact Information
// //                 </h4>
// //                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //                   <div>
// //                     <Label className="text-xs text-muted-foreground">Phone</Label>
// //                     {isViewMode ? (
// //                       <p className="font-medium text-foreground mt-1">
// //                         {editingUser.phone || "Not provided"}
// //                       </p>
// //                     ) : (
// //                       <Input
// //                         value={editingUser.phone || ""}
// //                         onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
// //                         className="mt-1"
// //                         placeholder="Enter phone number"
// //                       />
// //                     )}
// //                   </div>
// //                   <div>
// //                     <Label className="text-xs text-muted-foreground">City</Label>
// //                     {isViewMode ? (
// //                       <p className="font-medium text-foreground mt-1">
// //                         {editingUser.city || "Not provided"}
// //                       </p>
// //                     ) : (
// //                       <Input
// //                         value={editingUser.city || ""}
// //                         onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
// //                         className="mt-1"
// //                         placeholder="Enter city"
// //                       />
// //                     )}
// //                   </div>
// //                   <div className="sm:col-span-2">
// //                     <Label className="text-xs text-muted-foreground">Address</Label>
// //                     {isViewMode ? (
// //                       <p className="font-medium text-foreground mt-1">
// //                         {editingUser.address || "Not provided"}
// //                       </p>
// //                     ) : (
// //                       <Input
// //                         value={editingUser.address || ""}
// //                         onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
// //                         className="mt-1"
// //                         placeholder="Enter address"
// //                       />
// //                     )}
// //                   </div>
// //                   <div>
// //                     <Label className="text-xs text-muted-foreground">Postal Code</Label>
// //                     {isViewMode ? (
// //                       <p className="font-medium text-foreground mt-1">
// //                         {editingUser.postal_code || "Not provided"}
// //                       </p>
// //                     ) : (
// //                       <Input
// //                         value={editingUser.postal_code || ""}
// //                         onChange={(e) => setEditingUser({ ...editingUser, postal_code: e.target.value })}
// //                         className="mt-1"
// //                         placeholder="Enter postal code"
// //                       />
// //                     )}
// //                   </div>
// //                 </div>
// //               </div>

// //               <Separator />

// //               {/* Role Management */}
// //               <div>
// //                 <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
// //                   <Shield className="h-4 w-4 text-primary" />
// //                   Role Management
// //                 </h4>
                
// //                 {/* Current Roles */}
// //                 <div className="mb-4">
// //                   <Label className="text-xs text-muted-foreground block mb-2">Current Roles</Label>
// //                   <div className="flex flex-wrap gap-2">
// //                     {userRoles.length > 0 ? (
// //                       userRoles.map((role) => (
// //                         <Badge
// //                           key={role.id}
// //                           className={`capitalize px-3 py-1.5 ${getRoleBadgeClass(role.role)} group cursor-pointer transition-all hover:opacity-80`}
// //                           onClick={() => confirmDeleteRole(role)}
// //                         >
// //                           {role.role}
// //                           <Trash2 className="h-3 w-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
// //                         </Badge>
// //                       ))
// //                     ) : (
// //                       <span className="text-sm text-muted-foreground">No roles assigned</span>
// //                     )}
// //                   </div>
// //                 </div>
                
// //                 {/* Add Role Buttons */}
// //                 <div>
// //                   <Label className="text-xs text-muted-foreground block mb-2">Add Role</Label>
// //                   <div className="flex flex-wrap gap-2">
// //                     {ROLES.map((role) => {
// //                       const hasRole = userRoles.some((r) => r.role === role.value);
// //                       return (
// //                         <Button
// //                           key={role.value}
// //                           variant={hasRole ? "secondary" : "outline"}
// //                           size="sm"
// //                           disabled={hasRole || addRoleMutation.isPending}
// //                           onClick={() => handleAddRole(role.value)}
// //                           className={`capitalize ${hasRole ? "opacity-50" : "hover:bg-primary/10 hover:text-primary hover:border-primary"}`}
// //                         >
// //                           <role.icon className="mr-1.5 h-3.5 w-3.5" />
// //                           {hasRole ? `Has ${role.label}` : `Add ${role.label}`}
// //                         </Button>
// //                       );
// //                     })}
// //                   </div>
// //                 </div>
// //               </div>

// //               <Separator />

// //               {/* Metadata */}
// //               <div className="bg-muted/30 rounded-lg p-4 space-y-2">
// //                 <div className="flex items-center justify-between text-sm">
// //                   <span className="text-muted-foreground">User ID</span>
// //                   <code className="font-mono text-xs bg-card px-2 py-1 rounded">
// //                     {selectedUser.user_id.slice(0, 8)}...
// //                   </code>
// //                 </div>
// //                 <div className="flex items-center justify-between text-sm">
// //                   <span className="text-muted-foreground">Joined</span>
// //                   <span className="text-foreground">
// //                     {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
// //                       year: "numeric",
// //                       month: "long",
// //                       day: "numeric"
// //                     })}
// //                   </span>
// //                 </div>
// //               </div>
// //             </div>
// //           )}
          
// //           <DialogFooter className="pt-4 border-t border-border">
// //             {isViewMode ? (
// //               <>
// //                 <Button variant="outline" onClick={handleCloseDialog}>
// //                   Close
// //                 </Button>
// //                 <Button onClick={handleEditUser} className="gap-2">
// //                   <Pencil className="h-4 w-4" />
// //                   Edit User
// //                 </Button>
// //               </>
// //             ) : (
// //               <>
// //                 <Button variant="outline" onClick={() => setIsViewMode(true)}>
// //                   Cancel
// //                 </Button>
// //                 <Button 
// //                   onClick={handleSaveUser} 
// //                   disabled={updateProfileMutation.isPending}
// //                   className="gap-2"
// //                 >
// //                   {updateProfileMutation.isPending ? (
// //                     <Loader2 className="h-4 w-4 animate-spin" />
// //                   ) : (
// //                     <Save className="h-4 w-4" />
// //                   )}
// //                   Save Changes
// //                 </Button>
// //               </>
// //             )}
// //           </DialogFooter>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Delete Role Confirmation */}
// //       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>Remove Role</AlertDialogTitle>
// //             <AlertDialogDescription>
// //               Are you sure you want to remove the <strong className="capitalize">{roleToDelete?.role}</strong> role from this user? This action can be undone by adding the role back.
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>Cancel</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={() => roleToDelete && removeRoleMutation.mutate(roleToDelete.id)}
// //               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// //             >
// //               {removeRoleMutation.isPending ? (
// //                 <Loader2 className="h-4 w-4 animate-spin" />
// //               ) : (
// //                 "Remove Role"
// //               )}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </div>
// //   );
// // };