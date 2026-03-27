import { BarChart3, Package, ShoppingCart, Home, LogOut, Users, ChevronRight, Star, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type AdminView = "overview" | "products" | "orders" | "users" | "reviews" | "contacts";

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const menuItems = [
  { title: "Overview", icon: BarChart3, view: "overview" as AdminView, description: "Dashboard stats" },
  { title: "Products", icon: Package, view: "products" as AdminView, description: "Manage inventory" },
  { title: "Orders", icon: ShoppingCart, view: "orders" as AdminView, description: "Track orders" },
  { title: "Reviews", icon: Star, view: "reviews" as AdminView, description: "Manage reviews" },
  { title: "Contacts", icon: MessageSquare, view: "contacts" as AdminView, description: "Customer inquiries" },
  { title: "Users", icon: Users, view: "users" as AdminView, description: "Manage users" },
];

export const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <Sidebar className="border-r border-border bg-gradient-to-b from-card to-background">
      <SidebarHeader className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground leading-tight">
                Clayzio
              </h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <SidebarTrigger className="lg:hidden text-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.view)}
                    className={`w-full justify-start px-3 py-3 rounded-xl transition-all duration-200 group ${
                      activeView === item.view
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${activeView === item.view ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <div className="flex flex-col items-start ml-3 flex-1">
                      <span className="font-medium">{item.title}</span>
                      <span className={`text-xs ${activeView === item.view ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {item.description}
                      </span>
                    </div>
                    {activeView === item.view && (
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
          onClick={() => navigate("/")}
        >
          <Home className="mr-3 h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Back to Store</span>
        </Button>
        <Separator className="my-2" />
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2.5 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};








// import { BarChart3, Package, ShoppingCart, Home, LogOut, Users, Settings, ChevronRight, Star, MessageSquare } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
//   SidebarHeader,
//   SidebarFooter,
//   SidebarTrigger,
// } from "@/components/ui/sidebar";
// import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";

// type AdminView = "overview" | "products" | "orders" | "users" | "reviews" | "contacts";

// interface AdminSidebarProps {
//   activeView: AdminView;
//   setActiveView: (view: AdminView) => void;
// }

// const menuItems = [
//   { title: "Overview", icon: BarChart3, view: "overview" as AdminView, description: "Dashboard stats" },
//   { title: "Products", icon: Package, view: "products" as AdminView, description: "Manage inventory" },
//   { title: "Orders", icon: ShoppingCart, view: "orders" as AdminView, description: "Track orders" },
//   { title: "Reviews", icon: Star, view: "reviews" as AdminView, description: "Manage reviews" },
//   { title: "Contacts", icon: MessageSquare, view: "contacts" as AdminView, description: "Customer inquiries" },
//   { title: "Users", icon: Users, view: "users" as AdminView, description: "Manage users" },
// ];

// export const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigate("/");
//   };

//   return (
//     <Sidebar className="border-r border-border bg-gradient-to-b from-card to-background">
//       <SidebarHeader className="p-5 border-b border-border">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
//               <span className="text-primary-foreground font-bold text-lg">C</span>
//             </div>
//             <div>
//               <h1 className="font-display text-lg font-semibold text-foreground leading-tight">
//                 Clayzio
//               </h1>
//               <p className="text-xs text-muted-foreground">Admin Panel</p>
//             </div>
//           </div>
//           <SidebarTrigger className="lg:hidden text-foreground" />
//         </div>
//       </SidebarHeader>

//       <SidebarContent className="px-3 py-4">
//         <SidebarGroup>
//           <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
//             Management
//           </SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu className="space-y-1">
//               {menuItems.map((item) => (
//                 <SidebarMenuItem key={item.title}>
//                   <SidebarMenuButton
//                     onClick={() => setActiveView(item.view)}
//                     className={`w-full justify-start px-3 py-3 rounded-xl transition-all duration-200 group ${
//                       activeView === item.view
//                         ? "bg-primary text-primary-foreground shadow-md"
//                         : "text-foreground hover:bg-muted"
//                     }`}
//                   >
//                     <item.icon className={`h-5 w-5 ${activeView === item.view ? "" : "text-muted-foreground group-hover:text-foreground"}`} />
//                     <div className="flex flex-col items-start ml-3 flex-1">
//                       <span className="font-medium">{item.title}</span>
//                       <span className={`text-xs ${activeView === item.view ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
//                         {item.description}
//                       </span>
//                     </div>
//                     {activeView === item.view && (
//                       <ChevronRight className="h-4 w-4 opacity-70" />
//                     )}
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//       </SidebarContent>

//       <SidebarFooter className="p-4 border-t border-border space-y-2">
//         <Button
//           variant="ghost"
//           className="w-full justify-start px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
//           onClick={() => navigate("/")}
//         >
//           <Home className="mr-3 h-5 w-5 text-muted-foreground" />
//           <span className="font-medium">Back to Store</span>
//         </Button>
//         <Separator className="my-2" />
//         <Button
//           variant="ghost"
//           className="w-full justify-start px-3 py-2.5 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
//           onClick={handleLogout}
//         >
//           <LogOut className="mr-3 h-5 w-5" />
//           <span className="font-medium">Logout</span>
//         </Button>
//       </SidebarFooter>
//     </Sidebar>
//   );
// };