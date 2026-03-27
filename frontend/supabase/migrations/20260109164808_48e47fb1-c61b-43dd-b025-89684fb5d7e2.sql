-- Create product_variants table for size/color options
CREATE TABLE public.product_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL, -- 'size' or 'color'
  variant_value TEXT NOT NULL,
  price_adjustment NUMERIC DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, read, responded, archived
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to products table for extended info
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS materials TEXT,
ADD COLUMN IF NOT EXISTS dimensions TEXT,
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Enable RLS on all new tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Product variants policies
CREATE POLICY "Anyone can view product variants" ON public.product_variants
FOR SELECT USING (true);

CREATE POLICY "Admins can manage product variants" ON public.product_variants
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON public.reviews
FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own reviews" ON public.reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON public.reviews
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Contact submissions policies
CREATE POLICY "Anyone can submit contact form" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all submissions" ON public.contact_submissions
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update submissions" ON public.contact_submissions
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete submissions" ON public.contact_submissions
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();