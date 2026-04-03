
CREATE OR REPLACE FUNCTION public.create_approval_steps_for_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _manager_id uuid;
  _director_id uuid;
  _step integer := 1;
BEGIN
  -- Only create steps for bookings that require approval
  IF NOT COALESCE(NEW.requires_approval, false) THEN
    RETURN NEW;
  END IF;

  -- Get the user's manager
  SELECT manager_id INTO _manager_id
  FROM public.profiles
  WHERE id = NEW.user_id;

  IF _manager_id IS NOT NULL THEN
    INSERT INTO public.approval_steps (booking_id, step_order, approver_id, status)
    VALUES (NEW.id, _step, _manager_id, 'pending');
    _step := _step + 1;

    -- Get the manager's manager (director)
    SELECT manager_id INTO _director_id
    FROM public.profiles
    WHERE id = _manager_id;

    IF _director_id IS NOT NULL AND _director_id <> _manager_id THEN
      INSERT INTO public.approval_steps (booking_id, step_order, approver_id, status)
      VALUES (NEW.id, _step, _director_id, 'pending');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger on bookings
CREATE TRIGGER trg_create_approval_steps
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_approval_steps_for_booking();
