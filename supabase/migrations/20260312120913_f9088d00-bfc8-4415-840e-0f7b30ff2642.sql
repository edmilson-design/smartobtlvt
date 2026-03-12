
ALTER TABLE public.bookings 
  ADD COLUMN passenger_first_name text,
  ADD COLUMN passenger_last_name text,
  ADD COLUMN passenger_email text,
  ADD COLUMN passenger_phone text,
  ADD COLUMN passenger_cpf text;
