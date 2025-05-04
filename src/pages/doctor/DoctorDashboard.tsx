import React, { useState, useEffect } from "react";
import { Calendar, Clock, Users, CheckCircle } from "lucide-react";
import Card from "../../components/ui/Card";
import { useAuth } from "../../contexts/AuthContext";

interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled";
  reason: string;
}

const DoctorDashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5002/api/appointments/doctor/today",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load");
        setTodayAppointments(data);
      } catch (err) {
        console.error("Error fetching today's appointments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, Dr. {user?.name}
        </h1>
        <p className="mt-1 text-gray-600">
          Here's your schedule for today and patient appointments.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card title="Quick Stats" className="h-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todayAppointments.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-secondary-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {todayAppointments.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-accent-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-accent-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Hours This Week</p>
                  <p className="text-2xl font-bold text-gray-900">20</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {
                      todayAppointments.filter(
                        (app) => app.status === "completed"
                      ).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DoctorDashboard;
