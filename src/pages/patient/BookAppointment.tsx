import React, { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useAuth } from "../../contexts/AuthContext";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

interface TimeSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors from backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5002/api/doctors");
        if (!res.ok) throw new Error("Failed to load doctors");
        const data = await res.json();
        setDoctors(
          data.map((doc: any) => ({
            id: doc._id,
            name: doc.name,
            specialty: doc.specialty,
          }))
        );
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchDoctors();
  }, []);

  // Generate available slots (placeholder logic)
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setAvailableSlots([
        {
          id: "slot1",
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: "09:00 AM",
          isAvailable: true,
        },
        {
          id: "slot2",
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: "11:00 AM",
          isAvailable: true,
        },
        {
          id: "slot3",
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: "02:00 PM",
          isAvailable: true,
        },
      ]);
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = async () => {
    if (!user || !selectedDoctor || !selectedSlot || !reason) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5002/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: selectedDate,
          time: selectedSlot.time,
          reason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedSlot(null);
        setReason("");
        setBookingSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(err.message || "Failed to book appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Book an Appointment</h1>
        <p className="text-gray-600">Select a doctor, date, and time.</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>
      )}

      {bookingSuccess && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded">
          Appointment booked successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doctor List */}
        <div className="lg:col-span-1">
          <Card title="Select Doctor">
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedDoctor?.id === doc.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setSelectedSlot(null);
                  }}
                >
                  <h3 className="font-medium">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.specialty}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Appointment Details */}
        <div className="lg:col-span-2">
          <Card title="Appointment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={!selectedDoctor}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Reason</label>
                <Input
                  placeholder="Reason for visit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={!selectedDoctor || !selectedDate}
                  fullWidth
                />
              </div>
            </div>

            {selectedDoctor && selectedDate ? (
              <>
                <h3 className="text-sm font-medium mb-2">Time Slots</h3>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {availableSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-2 border rounded text-center cursor-pointer ${
                        selectedSlot?.id === slot.id
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      <Clock size={16} className="inline-block mr-1" />
                      {slot.time}
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleBookAppointment}
                  disabled={isSubmitting || !selectedSlot || !reason}
                  isLoading={isSubmitting}
                  fullWidth
                >
                  Book Appointment
                </Button>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500">
                Please select a doctor and date.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
