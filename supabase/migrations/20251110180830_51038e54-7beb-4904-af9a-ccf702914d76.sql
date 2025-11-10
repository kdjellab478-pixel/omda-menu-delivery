-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  image_url TEXT,
  phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dishes table
CREATE TABLE public.dishes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  name_fr TEXT,
  description TEXT,
  description_ar TEXT,
  description_fr TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_users table for admin authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Public read access for all users
CREATE POLICY "Anyone can view restaurants"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view dishes"
  ON public.dishes FOR SELECT
  USING (true);

-- Admin policies - only authenticated admins can modify
CREATE POLICY "Admins can manage restaurants"
  ON public.restaurants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage dishes"
  ON public.dishes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view admin_users"
  ON public.admin_users FOR SELECT
  USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dishes_updated_at
  BEFORE UPDATE ON public.dishes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories (Algerian cuisine)
INSERT INTO public.categories (name, name_ar, name_fr, display_order) VALUES
  ('Couscous', 'كسكس', 'Couscous', 1),
  ('Tagine', 'طاجين', 'Tajine', 2),
  ('Grillades', 'مشويات', 'Grillades', 3),
  ('Soupes', 'حساء', 'Soupes', 4),
  ('Salades', 'سلطات', 'Salades', 5),
  ('Desserts', 'حلويات', 'Desserts', 6),
  ('Boissons', 'مشروبات', 'Boissons', 7);