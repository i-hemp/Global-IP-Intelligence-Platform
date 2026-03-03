import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Profile = () => {

  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    if (!token) {
      navigate("/login");
      return;
    }

    try {

      let endpoint = "";

      // 🔥 Role-based endpoint
      if (role === "ADMIN") {
        endpoint = "http://localhost:8081/api/admin/me";
      } else if (role === "ANALYST") {
        endpoint = "http://localhost:8081/api/analyst/me";
      } else {
        endpoint = "http://localhost:8081/api/user/me";
      }

      const res = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);

    } catch (error) {

      console.error(error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Access denied.");
      } else {
        toast.error("Failed to load profile.");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.info("Logged out successfully 👋");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="text-white p-10">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-white p-10">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white p-10">

      <h2 className="text-3xl font-bold text-indigo-400 mb-8">
        My Profile
      </h2>

      <div className="bg-slate-800 p-8 rounded-xl shadow-lg max-w-3xl">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Info label="Username" value={user.username} />
          <Info label="Email" value={user.email} />
          <Info label="Role" value={role} />

          {user.phone && <Info label="Phone" value={user.phone} />}
          {user.gender && <Info label="Gender" value={user.gender} />}
          {user.organization && <Info label="Organization" value={user.organization} />}
          {user.purpose && <Info label="Purpose" value={user.purpose} />}

        </div>

        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>

      </div>

    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-slate-700 p-4 rounded-xl">
    <strong className="block text-gray-400 text-sm mb-1">
      {label}
    </strong>
    <p className="font-medium text-white">
      {value}
    </p>
  </div>
);

export default Profile;