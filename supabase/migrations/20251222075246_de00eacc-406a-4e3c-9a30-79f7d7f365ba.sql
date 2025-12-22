-- 1) Ensure every logged-in user has at least one organization + membership
-- This function runs as SECURITY DEFINER so it can create the org + membership even if the user
-- doesn't yet have membership (bootstrap problem). It only ever creates an org for auth.uid().
CREATE OR REPLACE FUNCTION public.ensure_user_organization()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_org_id uuid;
  new_org_id uuid;
  display_name text;
BEGIN
  -- If user already has an org, return the first one
  SELECT om.organization_id
    INTO existing_org_id
  FROM public.organization_members om
  WHERE om.user_id = auth.uid()
  ORDER BY om.created_at NULLS LAST
  LIMIT 1;

  IF existing_org_id IS NOT NULL THEN
    RETURN existing_org_id;
  END IF;

  -- Get a friendly org name from profile (falls back safely)
  SELECT p.full_name INTO display_name
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF display_name IS NULL OR btrim(display_name) = '' THEN
    display_name := 'My';
  END IF;

  INSERT INTO public.organizations (name)
  VALUES (display_name || ' Organization')
  RETURNING id INTO new_org_id;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, auth.uid(), 'admin');

  RETURN new_org_id;
END;
$$;

-- Allow any authenticated user to call the bootstrap function
GRANT EXECUTE ON FUNCTION public.ensure_user_organization() TO authenticated;


-- 2) Add carrier + tracking fields to inbound shipments
ALTER TABLE public.inbound_shipments
  ADD COLUMN IF NOT EXISTS carrier text NULL,
  ADD COLUMN IF NOT EXISTS tracking_number text NULL;