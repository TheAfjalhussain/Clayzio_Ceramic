import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="section-padding bg-background min-h-[60vh] flex items-center">
        <div className="container-custom text-center max-w-lg mx-auto">
          <h1 className="font-display text-8xl font-semibold text-primary mb-4">404</h1>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 btn-sage px-8 py-3 rounded-full font-medium"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
