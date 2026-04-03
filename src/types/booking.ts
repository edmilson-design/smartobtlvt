export type BookingType = 'flight' | 'hotel' | 'car_rental';
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'confirmed' | 'cancelled';

export interface Flight {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  price: number;
  stops: number;
}

export interface Hotel {
  id: string;
  name: string;
  image: string;
  location: string;
  city: string;
  rating: number;
  stars: number;
  roomType: string;
  amenities: string[];
  pricePerNight: number;
  totalPrice: number;
}

export interface CarRental {
  id: string;
  company: string;
  companyLogo: string;
  category: string;
  model: string;
  image: string;
  transmission: string;
  passengers: number;
  bags: number;
  airConditioning: boolean;
  pricePerDay: number;
  totalPrice: number;
  pickupLocation: string;
  dropoffLocation: string;
}

export interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  booking_type: BookingType;
  status: BookingStatus;
  origin?: string;
  destination: string;
  start_date: string;
  end_date?: string;
  total_cost: number;
  currency: string;
  airline?: string;
  flight_number?: string;
  departure_time?: string;
  arrival_time?: string;
  cabin_class?: string;
  hotel_name?: string;
  room_type?: string;
  car_company?: string;
  car_category?: string;
  pickup_location?: string;
  dropoff_location?: string;
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  confirmation_code?: string;
  notes?: string;
  passenger_first_name?: string;
  passenger_last_name?: string;
  passenger_email?: string;
  passenger_phone?: string;
  passenger_cpf?: string;
  cost_center?: string;
  project?: string;
}

export interface ApprovalStep {
  id: string;
  booking_id: string;
  step_order: number;
  approver_id: string;
  status: string;
  decided_at?: string;
  comments?: string;
  created_at: string;
  approver_name?: string;
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  full_name: string;
  email: string;
  company_name?: string;
  department?: string;
  cost_center?: string;
  approval_limit: number;
  manager_id?: string;
}
