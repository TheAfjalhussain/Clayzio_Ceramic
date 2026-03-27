import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Loader2, 
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Badge } from "@/components/ui/badge";

export const AdminOverview = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: () => adminApi.getRecentOrders(5),
  });

  const { data: salesData } = useQuery({
    queryKey: ["admin-sales-chart"],
    queryFn: () => adminApi.getSalesData(7),
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toFixed(0) || "0"}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      gradient: "from-primary to-primary/70",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      gradient: "from-secondary to-secondary/70",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: "+3",
      trend: "up",
      icon: Package,
      gradient: "from-primary to-primary/70",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+15.3%",
      trend: "up",
      icon: Users,
      gradient: "from-secondary to-secondary/70",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>;
      case "pending":
        return <Badge className="bg-secondary text-secondary-foreground border-0">Pending</Badge>;
      case "processing":
        return <Badge className="bg-muted text-muted-foreground border-0">Processing</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive border-0">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const salesChartData = Array.isArray(salesData) ? salesData : [];
  const recentOrdersList = Array.isArray(recentOrders) ? recentOrders : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" 
                   style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }} />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span className={`text-sm font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center justify-between">
              Sales Overview
              <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(0)}`, "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#salesGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-lg flex items-center justify-between">
              Revenue Trend
              <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value: number) => [`₹${value.toFixed(0)}`, "Revenue"]}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--secondary))" 
                    radius={[8, 8, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-secondary">
                <Clock className="h-5 w-5 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Orders</p>
                <p className="text-2xl font-bold text-foreground">{stats?.completedOrders || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.totalOrders && stats.totalUsers 
                    ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-primary">
                <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="font-display text-lg flex items-center justify-between">
            Recent Orders
            <Badge variant="outline" className="font-normal">
              {recentOrdersList.length} orders
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentOrdersList.length > 0 ? (
            <div className="divide-y divide-border">
              {recentOrdersList.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Order #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-foreground text-lg">
                        ₹{Number(order.total_amount).toFixed(0)}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Orders will appear here once customers start shopping
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};









// import { useQuery } from "@tanstack/react-query";
// import { adminApi } from "@/lib/api/admin";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { 
//   DollarSign, 
//   Package, 
//   ShoppingCart, 
//   TrendingUp, 
//   Loader2, 
//   Users,
//   ArrowUpRight,
//   ArrowDownRight,
//   Clock
// } from "lucide-react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
// import { Badge } from "@/components/ui/badge";

// export const AdminOverview = () => {
//   const { data: stats, isLoading: statsLoading } = useQuery({
//     queryKey: ["admin-stats"],
//     queryFn: () => adminApi.getStats(),
//   });

//   const { data: recentOrders, isLoading: ordersLoading } = useQuery({
//     queryKey: ["admin-recent-orders"],
//     queryFn: () => adminApi.getRecentOrders(5),
//   });

//   const { data: salesData } = useQuery({
//     queryKey: ["admin-sales-chart"],
//     queryFn: () => adminApi.getSalesData(7),
//   });

//   if (statsLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   const statCards = [
//     {
//       title: "Total Revenue",
//       value: `₹${stats?.totalRevenue?.toFixed(0) || "0"}`,
//       change: "+12.5%",
//       trend: "up",
//       icon: DollarSign,
//       gradient: "from-primary to-primary/70",
//     },
//     {
//       title: "Total Orders",
//       value: stats?.totalOrders || 0,
//       change: "+8.2%",
//       trend: "up",
//       icon: ShoppingCart,
//       gradient: "from-secondary to-secondary/70",
//     },
//     {
//       title: "Total Products",
//       value: stats?.totalProducts || 0,
//       change: "+3",
//       trend: "up",
//       icon: Package,
//       gradient: "from-primary to-primary/70",
//     },
//     {
//       title: "Total Users",
//       value: stats?.totalUsers || 0,
//       change: "+15.3%",
//       trend: "up",
//       icon: Users,
//       gradient: "from-secondary to-secondary/70",
//     },
//   ];

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case "completed":
//       case "delivered":
//         return <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>;
//       case "pending":
//         return <Badge className="bg-secondary text-secondary-foreground border-0">Pending</Badge>;
//       case "processing":
//         return <Badge className="bg-muted text-muted-foreground border-0">Processing</Badge>;
//       case "cancelled":
//         return <Badge className="bg-destructive/20 text-destructive border-0">Cancelled</Badge>;
//       default:
//         return <Badge variant="secondary">{status}</Badge>;
//     }
//   };

//   const ordersList = Array.isArray(recentOrders) ? recentOrders : [];
//   const salesDataList = Array.isArray(salesData) ? salesData : [];

//   return (
//     <div className="space-y-8">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h2 className="font-display text-3xl font-semibold text-foreground">
//             Dashboard Overview
//           </h2>
//           <p className="text-muted-foreground mt-1">
//             Welcome back! Here's what's happening with your store today.
//           </p>
//         </div>
//         <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
//           <Clock className="h-4 w-4" />
//           <span>Last updated: {new Date().toLocaleTimeString()}</span>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {statCards.map((stat) => (
//           <Card key={stat.title} className="border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <CardContent className="p-6 relative">
//               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" 
//                    style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }} />
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
//                   <p className="text-3xl font-bold text-foreground tracking-tight">
//                     {stat.value}
//                   </p>
//                   <div className="flex items-center gap-1 mt-2">
//                     {stat.trend === "up" ? (
//                       <ArrowUpRight className="h-4 w-4 text-primary" />
//                     ) : (
//                       <ArrowDownRight className="h-4 w-4 text-destructive" />
//                     )}
//                     <span className={`text-sm font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
//                       {stat.change}
//                     </span>
//                     <span className="text-xs text-muted-foreground">vs last month</span>
//                   </div>
//                 </div>
//                 <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
//                   <stat.icon className="h-6 w-6 text-primary-foreground" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card className="border-border">
//           <CardHeader className="pb-2">
//             <CardTitle className="font-display text-lg flex items-center justify-between">
//               Sales Overview
//               <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-72">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={salesDataList}>
//                   <defs>
//                     <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
//                       <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//                   <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
//                   <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "0.75rem",
//                       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                     }}
//                     formatter={(value: number) => [`₹${value?.toFixed(0) || 0}`, "Revenue"]}
//                   />
//                   <Area 
//                     type="monotone" 
//                     dataKey="amount" 
//                     stroke="hsl(var(--primary))" 
//                     strokeWidth={2}
//                     fill="url(#salesGradient)" 
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="border-border">
//           <CardHeader className="pb-2">
//             <CardTitle className="font-display text-lg flex items-center justify-between">
//               Revenue Trend
//               <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="h-72">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={salesDataList}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
//                   <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
//                   <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
//                   <Tooltip
//                     contentStyle={{
//                       backgroundColor: "hsl(var(--card))",
//                       border: "1px solid hsl(var(--border))",
//                       borderRadius: "0.75rem",
//                       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                     }}
//                     formatter={(value: number) => [`₹${value?.toFixed(0) || 0}`, "Revenue"]}
//                   />
//                   <Bar 
//                     dataKey="amount" 
//                     fill="hsl(var(--secondary))" 
//                     radius={[8, 8, 0, 0]} 
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Quick Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
//           <CardContent className="p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Pending Orders</p>
//                 <p className="text-2xl font-bold text-foreground">{stats?.pendingOrders || 0}</p>
//               </div>
//               <div className="p-3 rounded-xl bg-secondary">
//                 <Clock className="h-5 w-5 text-secondary-foreground" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
//           <CardContent className="p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Completed Orders</p>
//                 <p className="text-2xl font-bold text-foreground">{stats?.completedOrders || 0}</p>
//               </div>
//               <div className="p-3 rounded-xl bg-primary/20">
//                 <TrendingUp className="h-5 w-5 text-primary" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
//           <CardContent className="p-5">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-muted-foreground">Conversion Rate</p>
//                 <p className="text-2xl font-bold text-foreground">
//                   {stats?.totalOrders && stats.totalUsers 
//                     ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) 
//                     : 0}%
//                 </p>
//               </div>
//               <div className="p-3 rounded-xl bg-primary">
//                 <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Orders */}
//       <Card className="border-border">
//         <CardHeader className="border-b border-border bg-muted/30">
//           <CardTitle className="font-display text-lg flex items-center justify-between">
//             Recent Orders
//             <Badge variant="outline" className="font-normal">
//               {ordersList.length} orders
//             </Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="p-0">
//           {ordersLoading ? (
//             <div className="flex items-center justify-center h-40">
//               <Loader2 className="h-6 w-6 animate-spin text-primary" />
//             </div>
//           ) : ordersList.length > 0 ? (
//             <div className="divide-y divide-border">
//               {ordersList.map((order) => (
//                 <div
//                   key={order.id}
//                   className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
//                       <ShoppingCart className="h-5 w-5 text-primary" />
//                     </div>
//                     <div>
//                       <p className="font-semibold text-foreground">
//                         Order #{order.id?.slice(0, 8)}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {order.created_at && new Date(order.created_at).toLocaleDateString("en-US", {
//                           year: "numeric",
//                           month: "short",
//                           day: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit"
//                         })}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="text-right flex items-center gap-4">
//                     <div>
//                       <p className="font-bold text-foreground text-lg">
//                         ₹{Number(order.total_amount).toFixed(0)}
//                       </p>
//                     </div>
//                     {getStatusBadge(order.status)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center py-12 text-center">
//               <div className="p-4 rounded-full bg-muted/50 mb-4">
//                 <ShoppingCart className="h-8 w-8 text-muted-foreground" />
//               </div>
//               <p className="text-muted-foreground font-medium">No orders yet</p>
//               <p className="text-sm text-muted-foreground/70 mt-1">
//                 Orders will appear here once customers start shopping
//               </p>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };





// // import { useQuery } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { 
// //   DollarSign, 
// //   Package, 
// //   ShoppingCart, 
// //   TrendingUp, 
// //   Loader2, 
// //   Users,
// //   ArrowUpRight,
// //   ArrowDownRight,
// //   Clock
// // } from "lucide-react";
// // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
// // import { Badge } from "@/components/ui/badge";

// // export const AdminOverview = () => {
// //   const { data: stats, isLoading: statsLoading } = useQuery({
// //     queryKey: ["admin-stats"],
// //     queryFn: async () => {
// //       const [ordersRes, productsRes, usersRes] = await Promise.all([
// //         supabase.from("orders").select("*"),
// //         supabase.from("products").select("*"),
// //         supabase.from("profiles").select("*"),
// //       ]);

// //       const orders = ordersRes.data || [];
// //       const products = productsRes.data || [];
// //       const users = usersRes.data || [];

// //       const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
// //       const totalOrders = orders.length;
// //       const totalProducts = products.length;
// //       const totalUsers = users.length;
// //       const pendingOrders = orders.filter(o => o.status === "pending").length;
// //       const completedOrders = orders.filter(o => o.status === "completed").length;

// //       return { totalRevenue, totalOrders, totalProducts, totalUsers, pendingOrders, completedOrders };
// //     },
// //   });

// //   const { data: recentOrders, isLoading: ordersLoading } = useQuery({
// //     queryKey: ["admin-recent-orders"],
// //     queryFn: async () => {
// //       const { data } = await supabase
// //         .from("orders")
// //         .select("*")
// //         .order("created_at", { ascending: false })
// //         .limit(5);
// //       return data || [];
// //     },
// //   });

// //   const { data: salesData } = useQuery({
// //     queryKey: ["admin-sales-chart"],
// //     queryFn: async () => {
// //       const { data } = await supabase
// //         .from("orders")
// //         .select("created_at, total_amount")
// //         .order("created_at", { ascending: true });

// //       if (!data) return [];

// //       const grouped = data.reduce((acc, order) => {
// //         const date = new Date(order.created_at).toLocaleDateString("en-US", {
// //           month: "short",
// //           day: "numeric",
// //         });
// //         acc[date] = (acc[date] || 0) + Number(order.total_amount);
// //         return acc;
// //       }, {} as Record<string, number>);

// //       return Object.entries(grouped).slice(-7).map(([date, amount]) => ({
// //         date,
// //         amount,
// //       }));
// //     },
// //   });

// //   if (statsLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-64">
// //         <Loader2 className="h-8 w-8 animate-spin text-primary" />
// //       </div>
// //     );
// //   }

// //   const statCards = [
// //     {
// //       title: "Total Revenue",
// //       value: `₹${stats?.totalRevenue.toFixed(0) || "0"}`,
// //       change: "+12.5%",
// //       trend: "up",
// //       icon: DollarSign,
// //       gradient: "from-primary to-primary/70",
// //     },
// //     {
// //       title: "Total Orders",
// //       value: stats?.totalOrders || 0,
// //       change: "+8.2%",
// //       trend: "up",
// //       icon: ShoppingCart,
// //       gradient: "from-secondary to-secondary/70",
// //     },
// //     {
// //       title: "Total Products",
// //       value: stats?.totalProducts || 0,
// //       change: "+3",
// //       trend: "up",
// //       icon: Package,
// //       gradient: "from-primary to-primary/70",
// //     },
// //     {
// //       title: "Total Users",
// //       value: stats?.totalUsers || 0,
// //       change: "+15.3%",
// //       trend: "up",
// //       icon: Users,
// //       gradient: "from-secondary to-secondary/70",
// //     },
// //   ];

// //   const getStatusBadge = (status: string) => {
// //     switch (status) {
// //       case "completed":
// //         return <Badge className="bg-primary/20 text-primary border-0">Completed</Badge>;
// //       case "pending":
// //         return <Badge className="bg-secondary text-secondary-foreground border-0">Pending</Badge>;
// //       case "processing":
// //         return <Badge className="bg-muted text-muted-foreground border-0">Processing</Badge>;
// //       case "cancelled":
// //         return <Badge className="bg-destructive/20 text-destructive border-0">Cancelled</Badge>;
// //       default:
// //         return <Badge variant="secondary">{status}</Badge>;
// //     }
// //   };

// //   return (
// //     <div className="space-y-8">
// //       {/* Header */}
// //       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
// //         <div>
// //           <h2 className="font-display text-3xl font-semibold text-foreground">
// //             Dashboard Overview
// //           </h2>
// //           <p className="text-muted-foreground mt-1">
// //             Welcome back! Here's what's happening with your store today.
// //           </p>
// //         </div>
// //         <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
// //           <Clock className="h-4 w-4" />
// //           <span>Last updated: {new Date().toLocaleTimeString()}</span>
// //         </div>
// //       </div>

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
// //         {statCards.map((stat) => (
// //           <Card key={stat.title} className="border-border overflow-hidden group hover:shadow-lg transition-all duration-300">
// //             <CardContent className="p-6 relative">
// //               <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full" 
// //                    style={{ background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)` }} />
// //               <div className="flex items-start justify-between">
// //                 <div className="flex-1">
// //                   <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
// //                   <p className="text-3xl font-bold text-foreground tracking-tight">
// //                     {stat.value}
// //                   </p>
// //                   <div className="flex items-center gap-1 mt-2">
// //                     {stat.trend === "up" ? (
// //                       <ArrowUpRight className="h-4 w-4 text-primary" />
// //                     ) : (
// //                       <ArrowDownRight className="h-4 w-4 text-destructive" />
// //                     )}
// //                     <span className={`text-sm font-medium ${stat.trend === "up" ? "text-primary" : "text-destructive"}`}>
// //                       {stat.change}
// //                     </span>
// //                     <span className="text-xs text-muted-foreground">vs last month</span>
// //                   </div>
// //                 </div>
// //                 <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
// //                   <stat.icon className="h-6 w-6 text-primary-foreground" />
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         ))}
// //       </div>

// //       {/* Charts */}
// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //         <Card className="border-border">
// //           <CardHeader className="pb-2">
// //             <CardTitle className="font-display text-lg flex items-center justify-between">
// //               Sales Overview
// //               <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="h-72">
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <AreaChart data={salesData}>
// //                   <defs>
// //                     <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
// //                       <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
// //                       <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
// //                     </linearGradient>
// //                   </defs>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
// //                   <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
// //                   <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
// //                   <Tooltip
// //                     contentStyle={{
// //                       backgroundColor: "hsl(var(--card))",
// //                       border: "1px solid hsl(var(--border))",
// //                       borderRadius: "0.75rem",
// //                       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
// //                     }}
// //                     formatter={(value: number) => [`₹${value.toFixed(0)}`, "Revenue"]}
// //                   />
// //                   <Area 
// //                     type="monotone" 
// //                     dataKey="amount" 
// //                     stroke="hsl(var(--primary))" 
// //                     strokeWidth={2}
// //                     fill="url(#salesGradient)" 
// //                   />
// //                 </AreaChart>
// //               </ResponsiveContainer>
// //             </div>
// //           </CardContent>
// //         </Card>

// //         <Card className="border-border">
// //           <CardHeader className="pb-2">
// //             <CardTitle className="font-display text-lg flex items-center justify-between">
// //               Revenue Trend
// //               <Badge variant="outline" className="font-normal text-xs">Last 7 days</Badge>
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <div className="h-72">
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <BarChart data={salesData}>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
// //                   <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
// //                   <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
// //                   <Tooltip
// //                     contentStyle={{
// //                       backgroundColor: "hsl(var(--card))",
// //                       border: "1px solid hsl(var(--border))",
// //                       borderRadius: "0.75rem",
// //                       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
// //                     }}
// //                     formatter={(value: number) => [`₹${value.toFixed(0)}`, "Revenue"]}
// //                   />
// //                   <Bar 
// //                     dataKey="amount" 
// //                     fill="hsl(var(--secondary))" 
// //                     radius={[8, 8, 0, 0]} 
// //                   />
// //                 </BarChart>
// //               </ResponsiveContainer>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Quick Stats */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
// //           <CardContent className="p-5">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Pending Orders</p>
// //                 <p className="text-2xl font-bold text-foreground">{stats?.pendingOrders || 0}</p>
// //               </div>
// //               <div className="p-3 rounded-xl bg-secondary">
// //                 <Clock className="h-5 w-5 text-secondary-foreground" />
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
// //           <CardContent className="p-5">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Completed Orders</p>
// //                 <p className="text-2xl font-bold text-foreground">{stats?.completedOrders || 0}</p>
// //               </div>
// //               <div className="p-3 rounded-xl bg-primary/20">
// //                 <TrendingUp className="h-5 w-5 text-primary" />
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //         <Card className="border-border bg-gradient-to-br from-primary/5 to-transparent">
// //           <CardContent className="p-5">
// //             <div className="flex items-center justify-between">
// //               <div>
// //                 <p className="text-sm text-muted-foreground">Conversion Rate</p>
// //                 <p className="text-2xl font-bold text-foreground">
// //                   {stats?.totalOrders && stats.totalUsers 
// //                     ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) 
// //                     : 0}%
// //                 </p>
// //               </div>
// //               <div className="p-3 rounded-xl bg-primary">
// //                 <ArrowUpRight className="h-5 w-5 text-primary-foreground" />
// //               </div>
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* Recent Orders */}
// //       <Card className="border-border">
// //         <CardHeader className="border-b border-border bg-muted/30">
// //           <CardTitle className="font-display text-lg flex items-center justify-between">
// //             Recent Orders
// //             <Badge variant="outline" className="font-normal">
// //               {recentOrders?.length || 0} orders
// //             </Badge>
// //           </CardTitle>
// //         </CardHeader>
// //         <CardContent className="p-0">
// //           {ordersLoading ? (
// //             <div className="flex items-center justify-center h-40">
// //               <Loader2 className="h-6 w-6 animate-spin text-primary" />
// //             </div>
// //           ) : recentOrders && recentOrders.length > 0 ? (
// //             <div className="divide-y divide-border">
// //               {recentOrders.map((order) => (
// //                 <div
// //                   key={order.id}
// //                   className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
// //                 >
// //                   <div className="flex items-center gap-4">
// //                     <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
// //                       <ShoppingCart className="h-5 w-5 text-primary" />
// //                     </div>
// //                     <div>
// //                       <p className="font-semibold text-foreground">
// //                         Order #{order.id.slice(0, 8)}
// //                       </p>
// //                       <p className="text-sm text-muted-foreground">
// //                         {new Date(order.created_at).toLocaleDateString("en-US", {
// //                           year: "numeric",
// //                           month: "short",
// //                           day: "numeric",
// //                           hour: "2-digit",
// //                           minute: "2-digit"
// //                         })}
// //                       </p>
// //                     </div>
// //                   </div>
// //                   <div className="text-right flex items-center gap-4">
// //                     <div>
// //                       <p className="font-bold text-foreground text-lg">
// //                         ₹{Number(order.total_amount).toFixed(0)}
// //                       </p>
// //                     </div>
// //                     {getStatusBadge(order.status)}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="flex flex-col items-center justify-center py-12 text-center">
// //               <div className="p-4 rounded-full bg-muted/50 mb-4">
// //                 <ShoppingCart className="h-8 w-8 text-muted-foreground" />
// //               </div>
// //               <p className="text-muted-foreground font-medium">No orders yet</p>
// //               <p className="text-sm text-muted-foreground/70 mt-1">
// //                 Orders will appear here once customers start shopping
// //               </p>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };