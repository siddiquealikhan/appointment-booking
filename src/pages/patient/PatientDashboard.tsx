import React, { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface Appointment {
  _id: string;
  doctorId: { name: string }; // Populated doctor name from backend
  date: string;
  time: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
}

const PatientDashboard: React.FC = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, please log in");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:5002/api/appointments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Filter for upcoming appointments only
        const upcoming = response.data.filter(
          (appt: Appointment) => appt.status === "upcoming"
        );
        setUpcomingAppointments(upcoming);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name}
        </h1>
        <p className="mt-1 text-gray-600">
          Here's an overview of your upcoming appointments and health status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Quick Stats" className="h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {upcomingAppointments.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-secondary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-accent-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-warning-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Reminders</p>
                  <p className="text-2xl font-bold text-gray-900">2</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Upcoming Appointments" className="h-full">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {appointment.doctorId.name}
                      </h4>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="mx-1">•</span>
                        <Clock size={14} className="mr-1" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <div>{getStatusBadge(appointment.status)}</div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link to="/patient/appointments">
                  <Button variant="text" size="sm" rightIcon={<span>→</span>}>
                    View all appointments
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-600 mb-4">
                You don't have any upcoming appointments.
              </p>
              <Link to="/patient/book-appointment">
                <Button>Book an Appointment</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div>
        <Card title="Health Reminders">
          <div className="space-y-3">
            <div className="p-3 border-l-4 border-warning-500 bg-warning-50 rounded-r-md">
              <h4 className="font-medium text-gray-900">
                Annual Physical Check-up
              </h4>
              <p className="text-sm text-gray-600">
                Your annual physical is due in 2 weeks. Schedule an appointment
                soon.
              </p>
            </div>

            <div className="p-3 border-l-4 border-primary-500 bg-primary-50 rounded-r-md">
              <h4 className="font-medium text-gray-900">Prescription Refill</h4>
              <p className="text-sm text-gray-600">
                Your prescription will need to be refilled next week.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PatientDashboard;
