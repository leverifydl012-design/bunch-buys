-- Drop existing INSERT policy for purchase_orders
DROP POLICY IF EXISTS "Purchasing/Admin can create POs" ON public.purchase_orders;

-- Create new policy allowing all org members to create POs
CREATE POLICY "Members can create POs"
ON public.purchase_orders
FOR INSERT
WITH CHECK (
  organization_id IN (SELECT get_user_org_ids(auth.uid()))
  AND created_by = auth.uid()
);

-- Drop existing INSERT policy for purchase_order_items
DROP POLICY IF EXISTS "Purchasing/Admin can manage PO items" ON public.purchase_order_items;

-- Create new policy allowing members to insert PO items for their own POs
CREATE POLICY "Members can manage their PO items"
ON public.purchase_order_items
FOR ALL
USING (
  purchase_order_id IN (
    SELECT id FROM purchase_orders 
    WHERE created_by = auth.uid()
  )
);

-- Keep the existing policy for admins/purchasing to manage all PO items
CREATE POLICY "Admins/Purchasing can manage all PO items"
ON public.purchase_order_items
FOR ALL
USING (
  purchase_order_id IN (
    SELECT id FROM purchase_orders 
    WHERE has_org_role(auth.uid(), organization_id, ARRAY['admin'::app_role, 'purchasing'::app_role])
  )
);

-- Drop existing INSERT policy for inbound_shipments
DROP POLICY IF EXISTS "Admins can create shipments" ON public.inbound_shipments;

-- Create new policy allowing members to create shipments for approved POs they own
CREATE POLICY "Members can create shipments for approved POs"
ON public.inbound_shipments
FOR INSERT
WITH CHECK (
  organization_id IN (SELECT get_user_org_ids(auth.uid()))
  AND created_by = auth.uid()
  AND purchase_order_id IN (
    SELECT id FROM purchase_orders 
    WHERE status = 'approved' AND created_by = auth.uid()
  )
);

-- Allow admins to create shipments for any approved PO
CREATE POLICY "Admins can create any shipment"
ON public.inbound_shipments
FOR INSERT
WITH CHECK (
  has_org_role(auth.uid(), organization_id, ARRAY['admin'::app_role])
);

-- Drop existing UPDATE policy for inbound_shipments
DROP POLICY IF EXISTS "Admins can update shipments" ON public.inbound_shipments;

-- Allow members to update their own shipments
CREATE POLICY "Members can update their shipments"
ON public.inbound_shipments
FOR UPDATE
USING (created_by = auth.uid());

-- Allow admins to update any shipment
CREATE POLICY "Admins can update any shipment"
ON public.inbound_shipments
FOR UPDATE
USING (has_org_role(auth.uid(), organization_id, ARRAY['admin'::app_role]));