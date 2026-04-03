
-- Add cost_center and project to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cost_center text,
  ADD COLUMN IF NOT EXISTS project text;

-- Create approval_steps table for multi-level sequential approval
CREATE TABLE public.approval_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 1,
  approver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decided_at timestamp with time zone,
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (booking_id, step_order)
);

-- Enable RLS
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;

-- Booking owner can view their approval steps
CREATE POLICY "Booking owner can view approval steps"
ON public.approval_steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = approval_steps.booking_id
      AND b.user_id = auth.uid()
  )
);

-- Approver can view steps assigned to them
CREATE POLICY "Approver can view own steps"
ON public.approval_steps
FOR SELECT
USING (approver_id = auth.uid());

-- Approver can update their pending step
CREATE POLICY "Approver can update own pending step"
ON public.approval_steps
FOR UPDATE
USING (approver_id = auth.uid() AND status = 'pending')
WITH CHECK (approver_id = auth.uid());

-- Admins have full access
CREATE POLICY "Admins have full access to approval_steps"
ON public.approval_steps
FOR ALL
USING (public.is_admin());

-- System can insert approval steps (via trigger/function)
CREATE POLICY "Authenticated users can insert approval steps for own bookings"
ON public.approval_steps
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = approval_steps.booking_id
      AND b.user_id = auth.uid()
  )
);

-- Timestamp trigger
CREATE TRIGGER update_approval_steps_updated_at
BEFORE UPDATE ON public.approval_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to advance approval flow when a step is approved
CREATE OR REPLACE FUNCTION public.handle_approval_step_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _next_step_exists boolean;
  _all_approved boolean;
BEGIN
  -- Only act when status changes to approved or rejected
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'rejected' THEN
    -- Reject the booking
    UPDATE public.bookings SET status = 'rejected', rejection_reason = COALESCE(NEW.comments, 'Rejeitado na etapa ' || NEW.step_order)
    WHERE id = NEW.booking_id;
    NEW.decided_at := now();
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    NEW.decided_at := now();
    
    -- Check if there are more steps
    SELECT EXISTS (
      SELECT 1 FROM public.approval_steps
      WHERE booking_id = NEW.booking_id AND step_order > NEW.step_order
    ) INTO _next_step_exists;

    IF NOT _next_step_exists THEN
      -- All steps done, confirm booking
      UPDATE public.bookings SET status = 'approved', approved_by = NEW.approver_id, approved_at = now()
      WHERE id = NEW.booking_id;
    END IF;
    
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_approval_step_update
BEFORE UPDATE ON public.approval_steps
FOR EACH ROW
EXECUTE FUNCTION public.handle_approval_step_update();
