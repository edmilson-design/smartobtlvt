
-- 1. Trigger to enforce booking status based on stored approval_limit (prevents client-side bypass)
CREATE OR REPLACE FUNCTION public.enforce_booking_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _approval_limit numeric;
BEGIN
    SELECT COALESCE(approval_limit, 1000) INTO _approval_limit
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NEW.total_cost > _approval_limit THEN
        NEW.status := 'pending';
        NEW.requires_approval := true;
    ELSE
        NEW.status := 'confirmed';
        NEW.requires_approval := false;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_booking_status
BEFORE INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_booking_status();

-- 2. Replace the permissive profile UPDATE policy with one that restricts sensitive columns
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile safe columns"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
    id = auth.uid()
    AND approval_limit IS NOT DISTINCT FROM (SELECT approval_limit FROM public.profiles WHERE id = auth.uid())
    AND manager_id IS NOT DISTINCT FROM (SELECT manager_id FROM public.profiles WHERE id = auth.uid())
);
