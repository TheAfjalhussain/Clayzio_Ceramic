import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, Heart, User, ChevronDown, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import clayzioLogo from '@/assets/clayzio-logo.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    {
      name: 'Shop',
      href: '/shop',
      dropdown: [
        { name: 'All Products', href: '/shop' },
        { name: 'Mugs & Cups', href: '/shop?category=mugs-cups' },
        { name: 'Bowls & Plates', href: '/shop?category=bowls-plates' },
        { name: 'Vases & Décor', href: '/shop?category=vases-decor' },
        { name: 'Aroma & Diffusers', href: '/shop?category=aroma-diffusers' },
        { name: 'Planters', href: '/shop?category=planters' },
        { name: 'Gift Sets', href: '/shop?category=gift-sets' },
      ],
    },
    { name: 'Collections', href: '/collections' },
    { name: 'About', href: '/about' },
    { name: 'Business', href: '/business' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur-md shadow-soft' 
        : 'bg-background'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -ml-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={clayzioLogo} 
              alt="Clayzio" 
              className="h-8 lg:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
  {navLinks.map((link) => (
    <div
      key={link.name}
      className="relative"
      onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      {/* Nav Item */}
      <Link
        to={link.href}
        className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
      >
        {link.name}
        {link.dropdown && <ChevronDown className="w-4 h-4" />}
      </Link>

      {/* Mega Dropdown */}
      {link.dropdown && activeDropdown === link.name && (
        <div className="absolute left-1/2 top-full z-50 mt-6 -translate-x-1/2">
          <div
            className="
              bg-white
              rounded-3xl
              shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]
              border border-soft-line
              p-8
              min-w-[620px]
              animate-dropdown
            "
          >
            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-8">
              {link.dropdown.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-4 group"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text */}
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition">
                      {item.name}
                    </p>
                    
                  </div>
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-soft-line" />

            {/* Footer */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition"
            >
              View All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  ))}
</nav>


          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2.5 rounded-full hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2.5 rounded-full hover:bg-muted transition-colors relative">
                  <User className="w-5 h-5" />
                  {user && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/wishlist')}>
                      Wishlist
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/admin')}>
                          Admin Dashboard
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/auth')}>
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/auth?mode=register')}>
                      Create Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 rounded-full hover:bg-muted transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-soft-line">
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 bg-muted rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-soft-line">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {link.name}
                  </Link>
                  {link.dropdown && (
                    <div className="ml-4 mt-1 space-y-1">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
