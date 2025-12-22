-- Create function to auto-create organization for admin users
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  user_name text;
BEGIN
  -- Only create org if this is an admin role
  IF NEW.role = 'admin' THEN
    -- Get user's name from profiles
    SELECT full_name INTO user_name FROM public.profiles WHERE id = NEW.user_id;
    IF user_name IS NULL OR user_name = '' THEN
      user_name := 'Admin';
    END IF;
    
    -- Create organization
    INSERT INTO public.organizations (name)
    VALUES (user_name || '''s Organization')
    RETURNING id INTO new_org_id;
    
    -- Add user as admin member of the organization
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.user_id, 'admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to fire after inserting an admin role
CREATE TRIGGER on_admin_role_created
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin_user();

-- For regular users, we need to add them to an existing org
-- This will be handled in the frontend by allowing admins to invite users