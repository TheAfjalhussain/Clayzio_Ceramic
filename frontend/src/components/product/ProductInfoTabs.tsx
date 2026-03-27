import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Truck, CreditCard, RotateCcw, Sparkles, Ruler, Scale } from 'lucide-react';

interface ProductInfoTabsProps {
  description: string;
  careInstructions?: string;
  materials?: string;
  dimensions?: string;
  weight?: string;
}

const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'details', label: 'Product Details & Care' },
  { id: 'shipping', label: 'Shipping & Payment' },
  { id: 'returns', label: 'Returns & Exchange' },
];

export function ProductInfoTabs({ 
  description, 
  careInstructions, 
  materials, 
  dimensions, 
  weight 
}: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="bg-muted/30 rounded-3xl overflow-hidden">
      {/* Tab Headers */}
      <div className="flex flex-wrap border-b border-soft-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 min-w-[120px] px-4 py-4 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 lg:p-8">
        {activeTab === 'description' && (
          <div className="prose prose-sm max-w-none animate-fade-in">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {description || 'No description available.'}
            </p>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6 animate-fade-in">
            {/* Materials & Dimensions */}
            <div className="grid sm:grid-cols-2 gap-4">
              {materials && (
                <div className="bg-background rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Materials</p>
                    <p className="text-muted-foreground text-sm mt-1">{materials}</p>
                  </div>
                </div>
              )}
              {dimensions && (
                <div className="bg-background rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Ruler className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Dimensions</p>
                    <p className="text-muted-foreground text-sm mt-1">{dimensions}</p>
                  </div>
                </div>
              )}
              {weight && (
                <div className="bg-background rounded-xl p-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Weight</p>
                    <p className="text-muted-foreground text-sm mt-1">{weight}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Care Instructions */}
            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Care Instructions</h4>
              {careInstructions ? (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {careInstructions}
                </p>
              ) : (
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Hand wash recommended with mild soap
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Avoid abrasive scrubbers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Microwave safe (unless gold/metallic details)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Not dishwasher safe for best longevity
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Store with care to prevent chipping
                  </li>
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-background rounded-xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Free Shipping</h5>
                  <p className="text-sm text-muted-foreground">
                    Free delivery on orders above ₹999. Standard shipping charges ₹99 for orders below.
                  </p>
                </div>
              </div>
              <div className="bg-background rounded-xl p-5 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h5 className="font-semibold mb-1">Secure Payment</h5>
                  <p className="text-sm text-muted-foreground">
                    We accept UPI, Cards, Net Banking, and Cash on Delivery (₹50 extra).
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Delivery Information</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Metro Cities:</strong> 3-5 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Other Cities:</strong> 5-7 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span><strong>Remote Areas:</strong> 7-10 business days</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Double-layer packaging to ensure safe delivery</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Track your order via SMS & Email updates</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-background rounded-xl p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <RotateCcw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h5 className="font-semibold mb-1">7-Day Easy Returns</h5>
                <p className="text-sm text-muted-foreground">
                  Not satisfied? Return within 7 days of delivery for a full refund.
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-display text-lg font-semibold mb-4">Return Policy</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Products must be unused and in original packaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Damaged items on delivery - free replacement with proof of damage</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Refund processed within 5-7 business days after pickup</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                  <span>Exchange available for different size/color (subject to availability)</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display text-lg font-semibold mb-4">How to Return</h4>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>Contact us via WhatsApp or Email within 7 days</li>
                <li>Share your order ID and reason for return</li>
                <li>Pack the item securely in original packaging</li>
                <li>Our courier partner will pick up from your address</li>
                <li>Refund initiated after quality check</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
