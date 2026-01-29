-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('employee', 'manager', 'admin');

-- Create enum for booking types
CREATE TYPE public.booking_type AS ENUM ('flight', 'hotel', 'car_rental');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'approved', 'rejected', 'confirmed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company_name TEXT,
    department TEXT,
    cost_center TEXT,
    approval_limit NUMERIC DEFAULT 1000,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    UNIQUE (user_id, role)
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    booking_type booking_type NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    
    -- Common fields
    origin TEXT,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    total_cost NUMERIC NOT NULL,
    currency TEXT DEFAULT 'BRL',
    
    -- Flight specific
    airline TEXT,
    flight_number TEXT,
    departure_time TIME,
    arrival_time TIME,
    cabin_class TEXT,
    
    -- Hotel specific
    hotel_name TEXT,
    room_type TEXT,
    check_in_time TIME,
    check_out_time TIME,
    
    -- Car rental specific
    car_company TEXT,
    car_category TEXT,
    pickup_location TEXT,
    dropoff_location TEXT,
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Reference
    confirmation_code TEXT,
    notes TEXT
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Helper function to check if user is manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'admin')
$$;

-- Helper function to get user's manager
CREATE OR REPLACE FUNCTION public.get_manager_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT manager_id FROM public.profiles WHERE id = _user_id
$$;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "Managers can view their reports profiles"
    ON public.profiles FOR SELECT
    USING (manager_id = auth.uid());

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.is_admin());

-- User roles RLS policies
CREATE POLICY "Users can view own roles"
    ON public.user_roles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.is_admin());

-- Bookings RLS policies
CREATE POLICY "Users can view own bookings"
    ON public.bookings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own bookings"
    ON public.bookings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending bookings"
    ON public.bookings FOR UPDATE
    USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Users can delete own pending bookings"
    ON public.bookings FOR DELETE
    USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Managers can view reports bookings"
    ON public.bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = public.bookings.user_id
            AND p.manager_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update reports bookings for approval"
    ON public.bookings FOR UPDATE
    USING (
        public.is_manager_or_admin() AND
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = public.bookings.user_id
            AND p.manager_id = auth.uid()
        )
    );

CREATE POLICY "Admins have full access to bookings"
    ON public.bookings FOR ALL
    USING (public.is_admin());

-- Create trigger for profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();