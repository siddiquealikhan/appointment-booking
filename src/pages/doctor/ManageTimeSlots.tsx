import React, { useState, useEffect } from "react";
import { Calendar, Clock, PlusCircle, Trash2 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

const ManageTimeSlots: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Format date for the date picker
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0];

  useEffect(() => {
    // Simulate API call to fetch time slots
    setTimeout(() => {
      setTimeSlots([
        {
          id: "1",
          date: "2025-06-15",
          startTime: "09:00",
          endTime: "10:00",
          isBooked: false,
        },
        {
          id: "2",
          date: "2025-06-15",
          startTime: "10:30",
          endTime: "11:30",
          isBooked: true,
        },
        {
          id: "3",
          date: "2025-06-15",
          startTime: "13:00",
          endTime: "14:00",
          isBooked: false,
        },
        {
          id: "4",
          date: "2025-06-16",
          startTime: "09:00",
          endTime: "10:00",
          isBooked: false,
        },
        {
          id: "5",
          date: "2025-06-16",
          startTime: "10:30",
          endTime: "11:30",
          isBooked: false,
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAddTimeSlot = () => {
    if (!selectedDate || !startTime || !endTime) return;

    setIsAdding(true);

    // Simulate API call to add time slot
    setTimeout(() => {
      const newSlot: TimeSlot = {
        id: `slot-${Date.now()}`,
        date: selectedDate,
        startTime,
        endTime,
        isBooked: false,
      };

      setTimeSlots([...timeSlots, newSlot]);
      setIsAdding(false);
      setStartTime("");
      setEndTime("");
    }, 1000);
  };

  const handleDeleteTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  // Group time slots by date
  const groupedSlots: Record<string, TimeSlot[]> = {};
  timeSlots.forEach((slot) => {
    if (!groupedSlots[slot.date]) {
      groupedSlots[slot.date] = [];
    }
    groupedSlots[slot.date].push(slot);
  });

  // Sort dates
  const sortedDates = Object.keys(groupedSlots).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Time Slots</h1>
        <p className="mt-1 text-gray-600">
          Add and manage available time slots for appointments.
        </p>
      </div>

      <Card title="Add New Time Slot" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              min={formattedToday}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleAddTimeSlot}
            disabled={!selectedDate || !startTime || !endTime || isAdding}
            isLoading={isAdding}
            leftIcon={<PlusCircle size={18} />}
          >
            Add Time Slot
          </Button>
        </div>
      </Card>

      <Card title="Your Time Slots">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : sortedDates.length > 0 ? (
          <div className="space-y-6">
            {sortedDates.map((date) => (
              <div key={date}>
                <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <Calendar size={18} className="mr-2 text-primary-500" />
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupedSlots[date].map((slot) => (
                    <div
                      key={slot.id}
                      className={`p-3 border rounded-lg flex justify-between items-center ${
                        slot.isBooked
                          ? "bg-gray-50 border-gray-300"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <Clock size={16} className="text-gray-500 mr-2" />
                        <div>
                          <span className="text-sm font-medium">
                            {convertTo12HourFormat(slot.startTime)} -{" "}
                            {convertTo12HourFormat(slot.endTime)}
                          </span>
                          {slot.isBooked && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                              Booked
                            </span>
                          )}
                        </div>
                      </div>

                      {!slot.isBooked && (
                        <button
                          onClick={() => handleDeleteTimeSlot(slot.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              You haven't added any time slots yet.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Add time slots above to make them available for booking.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

// Helper function to convert 24h time to 12h format
function convertTo12HourFormat(time24h: string): string {
  const [hours, minutes] = time24h.split(":");
  const hour = parseInt(hours, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${suffix}`;
}

export default ManageTimeSlots;
