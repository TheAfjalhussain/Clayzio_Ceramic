import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, ContactSubmission } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  Trash2, 
  Loader2, 
  Search,
  MessageSquare,
  Eye,
  Inbox,
  CheckCircle,
  Archive
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export const ContactManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewSubmission, setViewSubmission] = useState<ContactSubmission | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => adminApi.getContactSubmissions(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Submission deleted" });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({ title: "Error deleting submission", description: error.message, variant: "destructive" });
    },
  });

  const submissionsList = Array.isArray(submissions) ? submissions : [];
  
  const filteredSubmissions = submissionsList.filter((sub) =>
    sub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newCount = submissionsList.filter(s => s.status === 'new')?.length || 0;
  const respondedCount = submissionsList.filter(s => s.status === 'responded')?.length || 0;
  const archivedCount = submissionsList.filter(s => s.status === 'archived')?.length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'read':
        return <Badge variant="secondary">Read</Badge>;
      case 'responded':
        return <Badge className="bg-green-500 text-white">Responded</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-100">
                <Inbox className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-display font-semibold text-foreground">{newCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responded</p>
                <p className="text-2xl font-display font-semibold text-foreground">{respondedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gray-100">
                <Archive className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-display font-semibold text-foreground">{archivedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">Contact Submissions</h2>
          <p className="text-muted-foreground">Manage customer inquiries</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search submissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden lg:table-cell">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{submission.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{submission.email}</span>
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{submission.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="capitalize">{submission.subject || "General"}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-[200px]">
                    <p className="truncate text-muted-foreground">{submission.message}</p>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={submission.status}
                      onValueChange={(value) => updateStatusMutation.mutate({ id: submission.id, status: value })}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue>{getStatusBadge(submission.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="read">Read</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {format(new Date(submission.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewSubmission(submission)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(submission.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No submissions found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewSubmission} onOpenChange={() => setViewSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {viewSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{viewSubmission.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${viewSubmission.email}`} className="font-medium text-primary hover:underline">
                    {viewSubmission.email}
                  </a>
                </div>
                {viewSubmission.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${viewSubmission.phone}`} className="font-medium text-primary hover:underline">
                      {viewSubmission.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium capitalize">{viewSubmission.subject || "General"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(viewSubmission.created_at), "PPP p")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(viewSubmission.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-muted rounded-xl p-4">
                  <p className="whitespace-pre-wrap">{viewSubmission.message}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button asChild className="flex-1">
                  <a href={`mailto:${viewSubmission.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
                {viewSubmission.phone && (
                  <Button variant="outline" asChild>
                    <a href={`https://wa.me/${viewSubmission.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this contact submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};









// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
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
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { 
//   Mail, 
//   Phone, 
//   Trash2, 
//   Loader2, 
//   Search,
//   MessageSquare,
//   Eye,
//   Inbox,
//   CheckCircle,
//   Archive
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { Input } from "@/components/ui/input";
// import { format } from "date-fns";

// interface ContactSubmission {
//   id: string;
//   name: string;
//   email: string;
//   phone: string | null;
//   subject: string | null;
//   message: string;
//   status: string;
//   created_at: string;
// }

// export const ContactManagement = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [viewSubmission, setViewSubmission] = useState<ContactSubmission | null>(null);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const { data: submissions, isLoading } = useQuery({
//     queryKey: ["admin-contacts"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("contact_submissions")
//         .select("*")
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data as ContactSubmission[];
//     },
//   });

//   const updateStatusMutation = useMutation({
//     mutationFn: async ({ id, status }: { id: string; status: string }) => {
//       const { error } = await supabase
//         .from("contact_submissions")
//         .update({ status })
//         .eq("id", id);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
//       toast({ title: "Status updated" });
//     },
//     onError: (error) => {
//       toast({ title: "Error updating status", description: error.message, variant: "destructive" });
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
//       toast({ title: "Submission deleted" });
//       setDeleteId(null);
//     },
//     onError: (error) => {
//       toast({ title: "Error deleting submission", description: error.message, variant: "destructive" });
//     },
//   });

//   const filteredSubmissions = submissions?.filter((sub) =>
//     sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     sub.message.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const newCount = submissions?.filter(s => s.status === 'new')?.length || 0;
//   const respondedCount = submissions?.filter(s => s.status === 'responded')?.length || 0;
//   const archivedCount = submissions?.filter(s => s.status === 'archived')?.length || 0;

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'new':
//         return <Badge variant="default" className="bg-blue-500">New</Badge>;
//       case 'read':
//         return <Badge variant="secondary">Read</Badge>;
//       case 'responded':
//         return <Badge className="bg-green-500 text-white">Responded</Badge>;
//       case 'archived':
//         return <Badge variant="outline">Archived</Badge>;
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-blue-100">
//                 <Inbox className="h-6 w-6 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">New</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{newCount}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-green-100">
//                 <CheckCircle className="h-6 w-6 text-green-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Responded</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{respondedCount}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
        
//         <Card className="border-0 shadow-soft bg-gradient-to-br from-card to-muted/30">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 rounded-2xl bg-gray-100">
//                 <Archive className="h-6 w-6 text-gray-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Archived</p>
//                 <p className="text-2xl font-display font-semibold text-foreground">{archivedCount}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="font-display text-3xl font-semibold text-foreground">Contact Submissions</h2>
//           <p className="text-muted-foreground">Manage customer inquiries</p>
//         </div>
//         <div className="relative w-full sm:w-80">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search submissions..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//       </div>

//       {/* Table */}
//       <Card className="border-0 shadow-soft overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow className="bg-muted/50">
//                 <TableHead>Name</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead className="hidden md:table-cell">Subject</TableHead>
//                 <TableHead className="hidden lg:table-cell">Message</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead className="hidden sm:table-cell">Date</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredSubmissions?.map((submission) => (
//                 <TableRow key={submission.id} className="hover:bg-muted/30">
//                   <TableCell className="font-medium">{submission.name}</TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       <div className="flex items-center gap-1 text-sm">
//                         <Mail className="w-3 h-3 text-muted-foreground" />
//                         <span className="truncate max-w-[150px]">{submission.email}</span>
//                       </div>
//                       {submission.phone && (
//                         <div className="flex items-center gap-1 text-sm text-muted-foreground">
//                           <Phone className="w-3 h-3" />
//                           <span>{submission.phone}</span>
//                         </div>
//                       )}
//                     </div>
//                   </TableCell>
//                   <TableCell className="hidden md:table-cell">
//                     <span className="capitalize">{submission.subject || "General"}</span>
//                   </TableCell>
//                   <TableCell className="hidden lg:table-cell max-w-[200px]">
//                     <p className="truncate text-muted-foreground">{submission.message}</p>
//                   </TableCell>
//                   <TableCell>
//                     <Select
//                       value={submission.status}
//                       onValueChange={(value) => updateStatusMutation.mutate({ id: submission.id, status: value })}
//                     >
//                       <SelectTrigger className="w-[120px] h-8">
//                         <SelectValue>{getStatusBadge(submission.status)}</SelectValue>
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="new">New</SelectItem>
//                         <SelectItem value="read">Read</SelectItem>
//                         <SelectItem value="responded">Responded</SelectItem>
//                         <SelectItem value="archived">Archived</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </TableCell>
//                   <TableCell className="hidden sm:table-cell text-muted-foreground">
//                     {format(new Date(submission.created_at), "MMM d, yyyy")}
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center justify-end gap-2">
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setViewSubmission(submission)}
//                         className="h-8 w-8"
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => setDeleteId(submission.id)}
//                         className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {filteredSubmissions?.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} className="text-center py-12">
//                     <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
//                     <p className="text-muted-foreground">No submissions found</p>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       </Card>

//       {/* View Dialog */}
//       <Dialog open={!!viewSubmission} onOpenChange={() => setViewSubmission(null)}>
//         <DialogContent className="max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Contact Submission</DialogTitle>
//           </DialogHeader>
//           {viewSubmission && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Name</p>
//                   <p className="font-medium">{viewSubmission.name}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Email</p>
//                   <a href={`mailto:${viewSubmission.email}`} className="font-medium text-primary hover:underline">
//                     {viewSubmission.email}
//                   </a>
//                 </div>
//                 {viewSubmission.phone && (
//                   <div>
//                     <p className="text-sm text-muted-foreground">Phone</p>
//                     <a href={`tel:${viewSubmission.phone}`} className="font-medium text-primary hover:underline">
//                       {viewSubmission.phone}
//                     </a>
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm text-muted-foreground">Subject</p>
//                   <p className="font-medium capitalize">{viewSubmission.subject || "General"}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Date</p>
//                   <p className="font-medium">{format(new Date(viewSubmission.created_at), "PPP p")}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-muted-foreground">Status</p>
//                   {getStatusBadge(viewSubmission.status)}
//                 </div>
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground mb-2">Message</p>
//                 <div className="bg-muted rounded-xl p-4">
//                   <p className="whitespace-pre-wrap">{viewSubmission.message}</p>
//                 </div>
//               </div>
//               <div className="flex gap-2 pt-4">
//                 <Button asChild className="flex-1">
//                   <a href={`mailto:${viewSubmission.email}`}>
//                     <Mail className="w-4 h-4 mr-2" />
//                     Reply via Email
//                   </a>
//                 </Button>
//                 {viewSubmission.phone && (
//                   <Button variant="outline" asChild>
//                     <a href={`https://wa.me/${viewSubmission.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
//                       WhatsApp
//                     </a>
//                   </Button>
//                 )}
//               </div>
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Delete Dialog */}
//       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Submission</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete this contact submission? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => deleteId && deleteMutation.mutate(deleteId)}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// };
