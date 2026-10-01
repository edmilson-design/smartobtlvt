CREATE OR REPLACE FUNCTION public.prevent_manager_cycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _cur uuid := NEW.manager_id; _depth int := 0;
BEGIN
  IF NEW.manager_id IS NULL THEN RETURN NEW; END IF;
  IF NEW.manager_id = NEW.id THEN RAISE EXCEPTION 'Um usuário não pode ser gestor de si mesmo'; END IF;
  WHILE _cur IS NOT NULL AND _depth < 50 LOOP
    IF _cur = NEW.id THEN RAISE EXCEPTION 'Hierarquia circular não permitida'; END IF;
    SELECT manager_id INTO _cur FROM public.profiles WHERE id = _cur;
    _depth := _depth + 1;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_prevent_manager_cycle ON public.profiles;
CREATE TRIGGER trg_prevent_manager_cycle BEFORE INSERT OR UPDATE OF manager_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_manager_cycle();

CREATE OR REPLACE FUNCTION public.get_manager_approval_stats()
RETURNS TABLE(manager_id uuid, manager_name text, approved bigint, rejected bigint, pending bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.approver_id, COALESCE(p.full_name, '—'),
    count(*) FILTER (WHERE s.status = 'approved'),
    count(*) FILTER (WHERE s.status = 'rejected'),
    count(*) FILTER (WHERE s.status = 'pending')
  FROM public.approval_steps s
  LEFT JOIN public.profiles p ON p.id = s.approver_id
  WHERE public.is_admin() OR s.approver_id = auth.uid()
  GROUP BY s.approver_id, p.full_name
  ORDER BY 2;
$$;
REVOKE EXECUTE ON FUNCTION public.get_manager_approval_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_manager_approval_stats() TO authenticated;