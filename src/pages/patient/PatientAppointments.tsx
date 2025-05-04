import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface Appointment {
  id: string;
  doctorName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  reason: string;
}

const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        throw new Error("User not logged in");
      }

      const res = await fetch(
        `http://localhost:5002/api/appointments?email=${encodeURIComponent(
          user.email
        )}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(data);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      setError(error.message || "Failed to fetch appointments");
      if (error.message === "User not logged in") {
        navigate("/patient/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]); // Re-fetch if user changes

  const handleCancel = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const res = await fetch(
        `http://localhost:5002/api/appointments/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Cancellation failed");
      }

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: "cancelled" } : app
        )
      );
    } catch (error: any) {
      console.error("Cancel error:", error);
      setError(error.message || "Failed to cancel appointment");
    }
  };

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((app) => app.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock size={16} className="text-primary-500" />;
      case "completed":
        return <CheckCircle2 size={16} className="text-success-500" />;
      case "cancelled":
        return <XCircle size={16} className="text-error-500" />;
      default:
        return null;
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="mt-1 text-gray-600">
          View and manage all your appointments.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "upcoming", "completed", "cancelled"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(status as typeof filter)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <div className="mb-3 sm:mb-0">
                    <div className="flex items-center">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(appointment.status)}
                        <h4 className="font-medium text-gray-900">
                          {appointment.doctorName}
                        </h4>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {appointment.reason}
                    </p>
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

                  {appointment.status === "upcoming" && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="error"
                        onClick={() => handleCancel(appointment.id)}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">
              No {filter !== "all" ? filter : ""} appointments found.
            </p>
            <div className="mt-4">
              <Link to="/patient/book-appointment">
                <Button>Book New Appointment</Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientAppointments;
