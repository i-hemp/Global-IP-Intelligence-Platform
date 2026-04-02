import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { BACKEND_URL } from "../config";

const GOOGLE_CLIENT_ID =
  "268780669175-b9ai4tt1rcing8mejqes71o702ull04k.apps.googleusercontent.com";

function RegisterInner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER",
    documentType: "AADHAAR_CARD",
    proofFile: null,
  });

  // Password strength check
  const getPasswordStrength = (pwd) => {
    if (!pwd) return "";
    if (pwd.length < 6) return "Weak";
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
      return "Strong";
    return "Medium";
  };

  const handleRegister = async () => {
    try {
      if (!form.username || !form.email || !form.password) {
        toast.error("All fields are required");
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);

      // USER Registration
      if (form.role === "USER") {
        await axios.post(`${BACKEND_URL}/api/user/register`, {
          username: form.username,
          email: form.email,
          password: form.password,
        });

        toast.success("Account created successfully");
        navigate("/login");
        return;
      }

      // ANALYST Registration
      if (!form.proofFile) {
        toast.error("Identity proof file is required");
        return;
      }

      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("name", form.username);
      formData.append("documentType", form.documentType);
      formData.append("purpose", "Research access");
      formData.append("organization", "Independent");
      formData.append("document", form.proofFile);

      await axios.post(`${BACKEND_URL}/api/analyst/register`, formData);

      toast.success("Analyst request submitted. Wait for admin approval.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-Up ──────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    if (!tokenResponse?.access_token) {
      toast.error("Google sign-up failed: No token received");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND_URL}/api/user/google`, {
        token: tokenResponse.access_token,
      });
      const data = res.data;
      const cleanRole = data.role ? data.role.replace("ROLE_", "") : "USER";

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("role", cleanRole);

      toast.success("Signed up with Google successfully 🚀");
      setTimeout(() => navigate("/user"), 800);
    } catch (err) {
      toast.error(err.response?.data?.error || "Google sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const googleSignUp = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error("Google sign-up failed"),
  });

  return (
    <div className="wrapper">
      {/* Background Pattern */}
      <div className="bg-pattern"></div>

      {/* Split Layout */}
      <div className="split-container">
        {/* Left Side - Animated Content */}
        <div className="left-panel">
          <div className="hero-content">
            <div className="floating-card">
              <div className="shield-icon">🛡️</div>
              <h1 className="hero-title">IP Intelligence</h1>
              <p className="hero-subtitle">
                Join our advanced threat detection platform for enterprise
                security
              </p>
            </div>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>Real-time Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔍</div>
                <span>Threat Intelligence</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <span>Instant Alerts</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🔐</div>
                <span>Advanced Encryption</span>
              </div>
            </div>

            {/* Animated Particles */}
            <div className="particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="right-panel">
          <div className="login-card">
            <div className="card-header">
              <div className="logo">
                <div className="logo-icon">✨</div>
                <div className="logo-text">
                  <h2>Create Account</h2>
                  <span className="tagline">Join IP Intelligence Platform</span>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Form Fields */}
              <div className="form-group">
                <div className="input-wrapper">
                  <label>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div className="input-wrapper">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                <div className="input-wrapper">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Create strong password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="input-field"
                  />
                  {form.password && (
                    <p className="password-strength">
                      Strength:{" "}
                      <span
                        className={`strength-${getPasswordStrength(
                          form.password
                        ).toLowerCase()}`}
                      >
                        {getPasswordStrength(form.password)}
                      </span>
                    </p>
                  )}
                </div>

                <div className="input-wrapper">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className={`input-field ${
                      form.confirmPassword &&
                      form.confirmPassword !== form.password
                        ? "error"
                        : ""
                    }`}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="role-selector">
                <label>Select your role</label>
                <div className="role-grid">
                  {[
                    { value: "USER", label: "User", icon: "👤" },
                    { value: "ANALYST", label: "Analyst", icon: "📊" },
                  ].map(({ value, label, icon }) => (
                    <div
                      key={value}
                      onClick={() => setForm({ ...form, role: value })}
                      className={`role-option ${
                        form.role === value ? "selected" : ""
                      }`}
                    >
                      <span className="role-icon">{icon}</span>
                      <span className="role-label">{label}</span>
                      {form.role === value && (
                        <div className="check-mark">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Analyst Section - Conditional */}
              {form.role === "ANALYST" && (
                <div className="analyst-section">
                  <div className="input-wrapper">
                    <label>Document Type</label>
                    <select
                      className="input-field"
                      value={form.documentType}
                      onChange={(e) =>
                        setForm({ ...form, documentType: e.target.value })
                      }
                    >
                      <option value="AADHAAR_CARD">Aadhaar Card</option>
                      <option value="PAN_CARD">PAN Card</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="VOTER_ID">Voter ID</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div className="input-wrapper">
                    <label>Upload Proof</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      className="file-input"
                      onChange={(e) =>
                        setForm({ ...form, proofFile: e.target.files[0] })
                      }
                    />
                    {form.proofFile && (
                      <p className="file-name">{form.proofFile.name}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Google Sign-Up - Only for USER */}
              {form.role === "USER" && (
                <>
                  <button
                    onClick={() => googleSignUp()}
                    className="google-btn"
                    disabled={loading}
                  >
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="google-icon"
                    />
                    Continue with Google
                  </button>
                  <div className="divider-section">
                    <div className="divider-line"></div>
                    <span>or</span>
                    <div className="divider-line"></div>
                  </div>
                </>
              )}

              {/* Register Button */}
              <button
                onClick={handleRegister}
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading">
                    <div className="spinner"></div>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Back to Login */}
              <div className="back-section">
                <button
                  className="register-btn"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <button className="footer-link">Privacy Policy</button>
          <button className="footer-link">Terms of Service</button>
          <button className="footer-link">Support</button>
        </div>
        <p>&copy; 2026 IP Intelligence Platform. All rights reserved.</p>
      </footer>

      {/* Exact same styles as Login page */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(
            135deg,
            #0f0f23 0%,
            #1a1a2e 50%,
            #16213e 100%
          );
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
            "Oxygen", "Ubuntu", sans-serif;
          position: relative;
          overflow: hidden;
        }

        .bg-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: radial-gradient(
              circle at 20% 20%,
              rgba(0, 229, 255, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(255, 107, 107, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 40% 80%,
              rgba(120, 119, 198, 0.06) 0%,
              transparent 50%
            );
          pointer-events: none;
          animation: bgShift 25s ease-in-out infinite;
        }

        @keyframes bgShift {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
          }
          50% {
            transform: scale(1.05) rotate(0.5deg);
          }
        }

        .split-container {
          display: flex;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
          flex: 1;
          align-items: center;
          position: relative;
          z-index: 1;
        }

        /* Left Panel - Animated Content (SAME AS LOGIN) */
        .left-panel {
          flex: 1;
          min-width: 500px;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: slideInLeft 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-content {
          position: relative;
          color: #e2e8f0;
          text-align: center;
        }

        .floating-card {
          background: rgba(15, 15, 35, 0.6);
          backdrop-filter: blur(25px);
          border-radius: 24px;
          padding: 48px 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .shield-icon {
          font-size: 80px;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.5));
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .hero-title {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(135deg, #00e5ff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px rgba(0, 229, 255, 0.3);
        }

        .hero-subtitle {
          font-size: 18px;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 48px;
          color: #cbd5e1;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          max-width: 400px;
          margin: 0 auto;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(26, 26, 46, 0.6);
          border-radius: 16px;
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
          animation: fadeInUp 0.8s ease forwards;
          opacity: 0;
          color: #e2e8f0;
        }

        .feature-item:nth-child(1) {
          animation-delay: 0.2s;
        }
        .feature-item:nth-child(2) {
          animation-delay: 0.3s;
        }
        .feature-item:nth-child(3) {
          animation-delay: 0.4s;
        }
        .feature-item:nth-child(4) {
          animation-delay: 0.5s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-item:hover {
          transform: translateY(-8px);
          background: rgba(26, 26, 46, 0.9);
          border-color: rgba(0, 229, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0, 229, 255, 0.2);
        }

        .feature-icon {
          font-size: 24px;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(0, 229, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00e5ff;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);
        }

        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          animation: particleFloat 8s infinite linear;
        }

        .particle-1 {
          width: 12px;
          height: 12px;
          background: rgba(0, 229, 255, 0.6);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .particle-2 {
          width: 8px;
          height: 8px;
          background: rgba(255, 107, 107, 0.6);
          top: 60%;
          right: 20%;
          animation-delay: 2s;
        }
        .particle-3 {
          width: 16px;
          height: 16px;
          background: rgba(120, 119, 198, 0.6);
          bottom: 30%;
          left: 30%;
          animation-delay: 4s;
        }
        .particle-4 {
          width: 10px;
          height: 10px;
          background: rgba(0, 229, 255, 0.4);
          top: 40%;
          right: 10%;
          animation-delay: 6s;
        }

        @keyframes particleFloat {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Right Panel - Registration Form (SAME AS LOGIN) */
        .right-panel {
          flex: 0 0 420px;
          animation: slideInRight 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .login-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(30px);
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #e2e8f0;
        }

        .card-header {
          background: rgba(15, 15, 35, 0.8);
          backdrop-filter: blur(20px);
          padding: 40px 32px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .logo-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #00e5ff, #667eea);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          box-shadow: 0 10px 25px rgba(0, 229, 255, 0.4);
        }

        .logo-text h2 {
          font-size: 28px;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 4px;
        }

        .tagline {
          font-size: 14px;
          color: #94a3b8;
          font-weight: 400;
        }

        .card-body {
          padding: 32px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .input-wrapper {
          margin-bottom: 20px;
        }

        .input-wrapper label {
          display: block;
          font-weight: 600;
          color: #f1ff5f9;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .input-field {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }

        .input-field:focus {
          outline: none;
          border-color: #00e5ff;
          box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        /* DROPDOWN FIX - Add this entire block */
        select.input-field {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23e2e8f0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 12px center;
          background-repeat: no-repeat;
          background-size: 16px;
          padding-right: 48px;
        }

        select.input-field option {
          background: #1a1a2e !important;
          color: #e2e8f0 !important;
          padding: 12px 16px !important;
          font-size: 14px !important;
        }

        select.input-field option:checked {
          background: linear-gradient(135deg, #00e5ff, #667eea) !important;
          color: #0f0f23 !important;
          font-weight: 600 !important;
        }

        select.input-field option:hover {
          background: rgba(0, 229, 255, 0.3) !important;
          color: #e2e8f0 !important;
        }

        .input-field::placeholder {
          color: #64748b;
        }

        .input-field.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.2);
        }

        .password-strength {
          font-size: 13px;
          margin-top: 4px;
        }

        .strength-weak {
          color: #ef4444;
        }
        .strength-medium {
          color: #f59e0b;
        }
        .strength-strong {
          color: #10b981;
        }

        .file-input {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
          font-size: 14px;
        }

        .file-name {
          font-size: 13px;
          color: #10b981;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .file-name::before {
          content: "✅";
        }

        .analyst-section {
          background: rgba(255, 255, 255, 0.03);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
        }

        .role-selector {
          margin-bottom: 28px;
        }

        .role-selector label {
          display: block;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 16px;
          font-size: 14px;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .role-option {
          padding: 16px 12px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #e2e8f0;
        }

        .role-option:hover {
          border-color: #00e5ff;
          background: rgba(0, 229, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 229, 255, 0.2);
        }

        .role-option.selected {
          border-color: #00e5ff;
          background: linear-gradient(135deg, #00e5ff, #667eea);
          color: white;
          box-shadow: 0 10px 25px rgba(0, 229, 255, 0.4);
        }

        .role-icon {
          font-size: 20px;
        }

        .role-label {
          font-weight: 600;
          font-size: 14px;
        }

        .check-mark {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .login-btn {
          width: 100%;
          padding: 18px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #00e5ff 0%, #667eea 100%);
          color: #0f0f23;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 35px rgba(0, 229, 255, 0.5);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(15, 15, 35, 0.3);
          border-top: 2px solid #0f0f23;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 12px;
          display: inline-block;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .google-btn {
          width: 100%;
          padding: 16px 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          color: #e2e8f0;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
        }

        .google-btn:hover:not(:disabled) {
          border-color: #00e5ff;
          background: rgba(0, 229, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(0, 229, 255, 0.2);
        }

        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .google-icon {
          width: 22px;
          height: 22px;
          filter: brightness(1.2);
        }

        .divider-section {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 10px 0;
          position: relative;
        }

        .divider-line {
          flex: 1;
          height: 0.5px;
          background: rgba(255, 255, 255, 0.1);
        }

        .divider-section span {
          color: #94a3b8;
          font-weight: 500;
          font-size: 14px;
          white-space: nowrap;
        }

        .back-section {
          text-align: center;
          padding: 20px 0;
        }

        .register-btn {
          background: none;
          border: none;
          color: #00e5ff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .register-btn:hover {
          background: rgba(0, 229, 255, 0.1);
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(0, 229, 255, 0.3);
        }

        .footer {
          margin-top: 40px;
          text-align: center;
          color: rgba(226, 232, 240, 0.8);
          padding-top: 40px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .footer-link {
          background: none;
          border: none;
          color: rgba(226, 232, 240, 0.8);
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .footer-link:hover {
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.1);
        }

        .footer p {
          font-size: 13px;
          opacity: 0.7;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .split-container {
            flex-direction: column;
            gap: 40px;
          }
          .left-panel {
            min-width: auto;
            height: auto;
            max-width: 600px;
          }
          .right-panel {
            flex: none;
            max-width: 420px;
          }
        }

        @media (max-width: 768px) {
          .wrapper {
            padding: 16px;
          }
          .split-container {
            gap: 24px;
          }
          .left-panel {
            text-align: center;
          }
          .hero-title {
            font-size: 32px;
          }
          .features-grid {
            grid-template-columns: 1fr;
            max-width: 100%;
          }
          .right-panel {
            width: 100%;
            max-width: 420px;
          }
          .role-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 28px;
          }
          .floating-card {
            padding: 32px 24px;
          }
          .card-body {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default function Register() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterInner />
    </GoogleOAuthProvider>
  );
}
