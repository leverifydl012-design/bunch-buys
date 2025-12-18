-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'purchasing', 'warehouse', 'accounting', 'viewer');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- USER PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- USER ROLES (separate table for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ORG MEMBERS
CREATE TABLE public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

-- WAREHOUSES
CREATE TABLE public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  location text,
  created_at timestamptz DEFAULT now()
);

-- SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  contact_email text,
  payment_terms text,
  created_at timestamptz DEFAULT now()
);

-- PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  brand text,
  created_at timestamptz DEFAULT now()
);

-- SKUS
CREATE TABLE public.skus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  sku text NOT NULL UNIQUE,
  asin text,
  fnsku text,
  cost numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- INVENTORY
CREATE TABLE public.inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_id uuid REFERENCES public.skus(id) ON DELETE CASCADE NOT NULL,
  warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (sku_id, warehouse_id)
);

-- PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  supplier_id uuid REFERENCES public.suppliers(id) NOT NULL,
  status text CHECK (status IN ('draft','submitted','approved','received','cancelled')) DEFAULT 'draft',
  total_cost numeric(12,2) DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- PURCHASE ORDER ITEMS
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  sku_id uuid REFERENCES public.skus(id) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost numeric(10,2) DEFAULT 0
);

-- APPROVALS
CREATE TABLE public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  requested_by uuid REFERENCES auth.users(id) NOT NULL,
  approved_by uuid REFERENCES auth.users(id),
  status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- AUDIT LOGS
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  created_at timestamptz DEFAULT now()
);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text DEFAULT 'inactive',
  current_period_end timestamptz
);

-- Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Security definer function to check org membership
CREATE OR REPLACE FUNCTION public.get_user_org_role(_user_id uuid, _org_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.organization_members
  WHERE user_id = _user_id AND organization_id = _org_id
  LIMIT 1
$$;

-- Security definer function to get user's org ids
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = _user_id
$$;

-- Check if user has specific role in org
CREATE OR REPLACE FUNCTION public.has_org_role(_user_id uuid, _org_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
    AND organization_id = _org_id
    AND role = ANY(_roles)
  )
$$;

-- Update inventory timestamp trigger
CREATE OR REPLACE FUNCTION public.update_inventory_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_timestamp();

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ORGANIZATIONS POLICIES
CREATE POLICY "Org members can view their orgs" ON public.organizations
  FOR SELECT USING (id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can create orgs" ON public.organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update orgs" ON public.organizations
  FOR UPDATE USING (public.has_org_role(auth.uid(), id, ARRAY['admin']::app_role[]));

-- ORGANIZATION MEMBERS POLICIES
CREATE POLICY "Members can view org members" ON public.organization_members
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can manage org members" ON public.organization_members
  FOR ALL USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin']::app_role[]));

-- WAREHOUSES POLICIES
CREATE POLICY "Members can view warehouses" ON public.warehouses
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins/Managers can manage warehouses" ON public.warehouses
  FOR ALL USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','manager']::app_role[]));

-- SUPPLIERS POLICIES
CREATE POLICY "Members can view suppliers" ON public.suppliers
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins/Purchasing can manage suppliers" ON public.suppliers
  FOR ALL USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','purchasing']::app_role[]));

-- PRODUCTS POLICIES
CREATE POLICY "Members can view products" ON public.products
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins/Purchasing can manage products" ON public.products
  FOR ALL USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','purchasing']::app_role[]));

-- SKUS POLICIES
CREATE POLICY "Members can view SKUs" ON public.skus
  FOR SELECT USING (
    product_id IN (
      SELECT id FROM public.products WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "Admins/Purchasing can manage SKUs" ON public.skus
  FOR ALL USING (
    product_id IN (
      SELECT id FROM public.products WHERE public.has_org_role(auth.uid(), organization_id, ARRAY['admin','purchasing']::app_role[])
    )
  );

-- INVENTORY POLICIES
CREATE POLICY "Members can view inventory" ON public.inventory
  FOR SELECT USING (
    warehouse_id IN (
      SELECT id FROM public.warehouses WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "Warehouse/Admin can manage inventory" ON public.inventory
  FOR ALL USING (
    warehouse_id IN (
      SELECT id FROM public.warehouses WHERE public.has_org_role(auth.uid(), organization_id, ARRAY['admin','warehouse']::app_role[])
    )
  );

-- PURCHASE ORDERS POLICIES
CREATE POLICY "Members can view POs" ON public.purchase_orders
  FOR SELECT USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Purchasing/Admin can create POs" ON public.purchase_orders
  FOR INSERT WITH CHECK (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','purchasing']::app_role[]));

CREATE POLICY "Manager/Admin can update POs" ON public.purchase_orders
  FOR UPDATE USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin','manager','purchasing']::app_role[]));

-- PURCHASE ORDER ITEMS POLICIES
CREATE POLICY "Members can view PO items" ON public.purchase_order_items
  FOR SELECT USING (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders WHERE organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
    )
  );

CREATE POLICY "Purchasing/Admin can manage PO items" ON public.purchase_order_items
  FOR ALL USING (
    purchase_order_id IN (
      SELECT id FROM public.purchase_orders WHERE public.has_org_role(auth.uid(), organization_id, ARRAY['admin','purchasing']::app_role[])
    )
  );

-- APPROVALS POLICIES
CREATE POLICY "Members can view approvals" ON public.approvals
  FOR SELECT USING (requested_by = auth.uid() OR approved_by = auth.uid());

CREATE POLICY "Users can create approval requests" ON public.approvals
  FOR INSERT WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Managers/Admins can update approvals" ON public.approvals
  FOR UPDATE USING (true);

-- AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin']::app_role[]));

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- SUBSCRIPTIONS POLICIES
CREATE POLICY "Admins can view subscriptions" ON public.subscriptions
  FOR SELECT USING (public.has_org_role(auth.uid(), organization_id, ARRAY['admin']::app_role[]));

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);