import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { ProductManagement } from "@/components/admin/ProductManagement";
import { OrderManagement } from "@/components/admin/OrderManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { ReviewsManagement } from "@/components/admin/ReviewsManagement";
import { ContactManagement } from "@/components/admin/ContactManagement";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminView = "overview" | "products" | "orders" | "users" | "reviews" | "contacts";

const AdminDashboard = () => {
  const { isAdmin, isLoading } = useAdminAuth();
  const [activeView, setActiveView] = useState<AdminView>("overview");

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-primary-foreground font-bold text-2xl">C</span>
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <ProductManagement />;
      case "orders":
        return <OrderManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "contacts":
        return <ContactManagement />;
      case "users":
        return <UserManagement />;
      default:
        return <AdminOverview />;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "overview":
        return "Dashboard";
      case "products":
        return "Products";
      case "orders":
        return "Orders";
      case "reviews":
        return "Reviews";
      case "contacts":
        return "Contact Submissions";
      case "users":
        return "Users";
      default:
        return "Dashboard";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SidebarTrigger>
              <div>
                <h1 className="font-display text-lg font-semibold text-foreground">
                  {getViewTitle()}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Welcome, Admin
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">A</span>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gradient-to-br from-background to-muted/20">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;