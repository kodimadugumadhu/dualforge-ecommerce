import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, CheckCircle, Shield, ArrowLeft, Key } from 'lucide-react';
import { API_AUTH_URL } from '../apiConfig';

const LoginRegister = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1 = Enter email, 2 = Verify OTP & Reset
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sign In & Registration Fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Forgot Password Fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const [usernameStatus, setUsernameStatus] = useState('');
  const [phoneStatus, setPhoneStatus] = useState('');

  // Password Strength Popup Modal State
  const [showWeakPasswordModal, setShowWeakPasswordModal] = useState(false);
  const [weakPasswordReasons, setWeakPasswordReasons] = useState([]);

  const validatePasswordStrength = (pw) => {
    if (!pw) return { valid: false, reasons: ["Password is required."] };

    const reasons = [];
    const lower = pw.toLowerCase();

    if (pw.length < 8) {
      reasons.push("Must be at least 8 characters long");
    }

    const sequentialPatterns = [
      "1234", "2345", "3456", "4567", "5678", "6789", "7890", "0123",
      "4321", "5432", "6543", "7654", "8765", "9876", "3210",
      "qwerty", "asdfgh", "zxcvbn", "password"
    ];
    if (sequentialPatterns.some(pattern => lower.includes(pattern))) {
      reasons.push("Must NOT contain continuous numbers (e.g. 123456) or sequential keys");
    }

    if (/^(.)\1+$/.test(pw)) {
      reasons.push("Must NOT consist of repeated single characters (e.g. 000000)");
    }

    if (!/[A-Z]/.test(pw)) {
      reasons.push("Must include at least 1 uppercase letter (A-Z)");
    }
    if (!/[a-z]/.test(pw)) {
      reasons.push("Must include at least 1 lowercase letter (a-z)");
    }
    if (!/[0-9]/.test(pw)) {
      reasons.push("Must include at least 1 number (0-9)");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)) {
      reasons.push("Must include at least 1 special character (!@#$%^&*)");
    }

    return { valid: reasons.length === 0, reasons };
  };

  const checkUsernameAvailability = async (val) => {
    if (!val || val.trim().length < 3) {
      setUsernameStatus('');
      return;
    }
    try {
      const res = await fetch(`${API_AUTH_URL}/check-username?username=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setUsernameStatus(data.message || 'Username already taken');
      } else {
        setUsernameStatus('✓ Username is available');
      }
    } catch (err) {
      setUsernameStatus('');
    }
  };

  const validateAndCheckPhone = async (val) => {
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setPhoneStatus('Please enter a valid 10-digit mobile number');
      return false;
    }
    try {
      const res = await fetch(`${API_AUTH_URL}/check-phone?phone=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setPhoneStatus(data.message || 'Phone number already registered');
        return false;
      } else {
        setPhoneStatus('✓ Phone number valid and available');
        return true;
      }
    } catch (err) {
      setPhoneStatus('');
      return true;
    }
  };

  const sendPhoneOtp = async () => {
    if (!phone) {
      alert("Please enter a valid phone number first.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile phone number (e.g. 9876543210).");
      return;
    }

    setSendingOtp(true);
    try {
      const url = `${API_AUTH_URL}/send-otp?target=${encodeURIComponent(phone)}&phone=${encodeURIComponent(phone)}`;
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        alert(data.message || "OTP Code sent to your phone number!");
      } else {
        alert(data.message || "Failed to send OTP to phone number.");
      }
    } catch (err) {
      alert("Server connection error when sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const sendEmailOtp = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    setSendingOtp(true);
    try {
      const url = `${API_AUTH_URL}/send-otp?target=${encodeURIComponent(email)}` + 
                  (phone ? `&phone=${encodeURIComponent(phone)}` : '');
      const res = await fetch(url, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        alert(data.message || "OTP Code sent to your email!");
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (err) {
      alert("Server connection error when sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const fillDemoAccount = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      await login(username, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid username or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !firstName || !lastName || !phone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    const pwCheck = validatePasswordStrength(password);
    if (!pwCheck.valid) {
      setWeakPasswordReasons(pwCheck.reasons);
      setShowWeakPasswordModal(true);
      return;
    }

    if (!otpSent) {
      setErrorMsg('Please request a Verification OTP first to verify your details.');
      return;
    }
    if (!otpCode) {
      setErrorMsg('Please enter the 6-digit OTP code dispatched to your email.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await register({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        otpCode
      });
      setSuccessMsg('Account registered successfully! Switching to login tab...');
      setUsername('');
      setPassword('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setOtpCode('');
      setOtpSent(false);
      
      setTimeout(() => {
        setIsLoginTab(true);
        setSuccessMsg('');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Check if your verification code is correct.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    if (!resetEmail) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_AUTH_URL}/forgot-password?email=${encodeURIComponent(resetEmail)}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "OTP code generated! Check your email.");
        setForgotPasswordStep(2);
      } else {
        setErrorMsg(data.message || "Failed to trigger recovery flow.");
      }
    } catch (err) {
      setErrorMsg("Connection failure to server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetOtpCode || !newPassword) return;

    const pwCheck = validatePasswordStrength(newPassword);
    if (!pwCheck.valid) {
      setWeakPasswordReasons(pwCheck.reasons);
      setShowWeakPasswordModal(true);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_AUTH_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          otpCode: resetOtpCode,
          newPassword: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Password reset successfully! Redirecting to login tab...");
        setTimeout(() => {
          setIsForgotPasswordMode(false);
          setIsLoginTab(true);
          setForgotPasswordStep(1);
          setResetEmail('');
          setResetOtpCode('');
          setNewPassword('');
          setSuccessMsg('');
        }, 2000);
      } else {
        setErrorMsg(data.message || "Password reset failed. Verify your inputs.");
      }
    } catch (err) {
      setErrorMsg("Connection failure to server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-register-page container animate-fade-in">
      <div className="auth-card-wrapper">
        <div className="auth-card glass-card">
          
          {isForgotPasswordMode ? (
            /* FORGOT PASSWORD WIZARD */
            <div className="auth-form animate-fade-in">
              <button 
                type="button" 
                onClick={() => { setIsForgotPasswordMode(false); setForgotPasswordStep(1); setErrorMsg(''); setSuccessMsg(''); }} 
                className="btn-back-link margin-bottom-15"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </button>

              <div className="auth-form-header">
                <h2>Account Recovery</h2>
                <p>Verify your details to securely establish a new account password.</p>
              </div>

              {errorMsg && <div className="auth-alert badge badge-error animate-fade-in">{errorMsg}</div>}
              {successMsg && <div className="auth-alert badge badge-success animate-fade-in">{successMsg}</div>}

              {forgotPasswordStep === 1 ? (
                <form onSubmit={handleForgotPasswordRequest} className="margin-top-15">
                  <div className="form-group-full">
                    <label>Email Address</label>
                    <div className="input-with-icon">
                      <Mail className="input-icon" size={16} />
                      <input 
                        type="email" 
                        placeholder="Enter your registered email" 
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary auth-submit-btn margin-top-25" disabled={submitting}>
                    <span>{submitting ? 'Sending Code...' : 'Request Verification OTP'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordResetSubmit} className="margin-top-15">
                  <div className="form-group-full">
                    <label>Verification OTP Code</label>
                    <input 
                      type="text" 
                      placeholder="******" 
                      value={resetOtpCode}
                      onChange={(e) => setResetOtpCode(e.target.value)}
                      className="form-input text-center font-bold tracking-widest"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div className="form-group-full margin-top-15">
                    <label>New Security Password</label>
                    <div className="input-with-icon">
                      <Lock className="input-icon" size={16} />
                      <input 
                        type="password" 
                        placeholder="Uppercase, number & special char" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary auth-submit-btn margin-top-25" disabled={submitting}>
                    <span>{submitting ? 'Resetting Password...' : 'Establish New Password'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* SIGN IN & REGISTER TABS */
            <>
              <div className="auth-card-tabs">
                <button 
                  className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
                  onClick={() => { setIsLoginTab(true); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Sign In
                </button>
                <button 
                  className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
                  onClick={() => { setIsLoginTab(false); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Register
                </button>
              </div>

              {errorMsg && <div className="auth-alert badge badge-error animate-fade-in">{errorMsg}</div>}
              {successMsg && <div className="auth-alert badge badge-success animate-fade-in">{successMsg}</div>}

              {isLoginTab ? (
                /* SIGN IN FORM */
                <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                  <div className="auth-form-header">
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your secure profile & check cart items.</p>
                  </div>

                  <div className="form-group-full">
                    <label>Username or Email</label>
                    <div className="input-with-icon">
                      <User className="input-icon" size={16} />
                      <input 
                        type="text" 
                        placeholder="Enter username or email" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-full margin-top-15">
                    <div className="flex-justify-between">
                      <label>Password</label>
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPasswordMode(true); setForgotPasswordStep(1); setErrorMsg(''); setSuccessMsg(''); }} 
                        className="forgot-pw-link"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="input-with-icon">
                      <Lock className="input-icon" size={16} />
                      <input 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary auth-submit-btn margin-top-25"
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
                  </button>

                  <div className="demo-credentials-helper" style={{ marginTop: '20px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}><strong>Quick Demo Logins:</strong></p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => fillDemoAccount('admin', 'adminpassword')}
                      >
                        ⚡ Fill Admin Login
                      </button>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => fillDemoAccount('customer', 'customerpassword')}
                      >
                        ⚡ Fill Customer Login
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* REGISTER FORM */
                <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade-in">
                  <div className="auth-form-header">
                    <h2>Create Account</h2>
                    <p>Set up a secure profile for personalized premium experiences.</p>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        placeholder="Madhu" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        placeholder="Teja" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group-full">
                      <label>Username</label>
                      <div className="input-with-icon">
                        <User className="input-icon" size={16} />
                        <input 
                          type="text" 
                          placeholder="Choose a unique username" 
                          value={username}
                          onChange={(e) => {
                            setUsername(e.target.value);
                            checkUsernameAvailability(e.target.value);
                          }}
                          onBlur={(e) => checkUsernameAvailability(e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                      {usernameStatus && (
                        <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block', color: usernameStatus.startsWith('✓') ? '#10b981' : '#ef4444' }}>
                          {usernameStatus}
                        </span>
                      )}
                    </div>

                    <div className="form-group-full">
                      <label>Phone Number (10-digit mobile)</label>
                      <div className="input-with-button-flex">
                        <div className="input-with-icon flex-1">
                          <Phone className="input-icon" size={16} />
                          <input 
                            type="tel" 
                            placeholder="9491562284" 
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value);
                              validateAndCheckPhone(e.target.value);
                            }}
                            onBlur={(e) => validateAndCheckPhone(e.target.value)}
                            className="form-input"
                            required
                          />
                        </div>
                        <button type="button" onClick={sendPhoneOtp} disabled={sendingOtp} className="btn-secondary btn-send-otp">
                          {sendingOtp ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send Phone OTP')}
                        </button>
                      </div>
                      {phoneStatus && (
                        <span style={{ fontSize: '0.75rem', marginTop: '4px', display: 'block', color: phoneStatus.startsWith('✓') ? '#10b981' : '#ef4444' }}>
                          {phoneStatus}
                        </span>
                      )}
                    </div>

                    <div className="form-group-full">
                      <label>Email Address</label>
                      <div className="input-with-button-flex">
                        <div className="input-with-icon flex-1">
                          <Mail className="input-icon" size={16} />
                          <input 
                            type="email" 
                            placeholder="madhu@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            required
                          />
                        </div>
                        <button type="button" onClick={sendEmailOtp} disabled={sendingOtp} className="btn-secondary btn-send-otp">
                          {sendingOtp ? 'Sending...' : (otpSent ? 'Resend' : 'Send Email OTP')}
                        </button>
                      </div>
                    </div>

                    {otpSent && (
                      <div className="form-group-full animate-fade-in">
                        <label>Verification OTP Code</label>
                        <input 
                          type="text" 
                          placeholder="******" 
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="form-input font-bold text-center tracking-widest"
                          maxLength="6"
                          required
                        />
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', display: 'block' }}>
                          Enter the 6-digit OTP code sent to your phone number or email.
                        </span>
                      </div>
                    )}
                    <div className="form-group-full">
                      <label>Password</label>
                      <div className="input-with-icon">
                        <Lock className="input-icon" size={16} />
                        <input 
                          type="password" 
                          placeholder="At least 6 characters" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group-full demo-role-select-box">
                      <label><Shield size={14} /> Assign Account Role (Demo helper)</label>
                      <div className="demo-role-radios">
                        <label>
                          <input 
                            type="radio" 
                            name="demoRole" 
                            value="customer" 
                            checked={role === 'customer'} 
                            onChange={() => setRole('customer')} 
                          />
                          <span>Customer</span>
                        </label>
                        <label>
                          <input 
                            type="radio" 
                            name="demoRole" 
                            value="seller" 
                            checked={role === 'seller'} 
                            onChange={() => setRole('seller')} 
                          />
                          <span>Seller</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary auth-submit-btn margin-top-20"
                    disabled={submitting}
                  >
                    <span>{submitting ? 'Registering...' : 'Register Account'}</span>
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </div>

      {/* WEAK PASSWORD POPUP ALERT MODAL */}
      {showWeakPasswordModal && (
        <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-scale-up" style={{ maxWidth: '480px', width: '100%', padding: '32px', borderRadius: '16px', background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.5)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)' }}>
            <div className="text-center margin-bottom-15">
              <Shield style={{ color: '#ef4444', width: '54px', height: '54px', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Keep a Strong Password!</h3>
              <p style={{ color: '#9ca3af', fontSize: '13.5px', marginTop: '8px', lineHeight: '1.5' }}>
                Selecting continuous numbers (e.g. <strong>123456</strong>, <strong>987654</strong>) or repetitive single digits is strictly prohibited for your security.
              </p>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '16px', borderRadius: '12px', margin: '20px 0', borderLeft: '4px solid #ef4444' }}>
              <strong style={{ fontSize: '13px', color: '#f87171', display: 'block', marginBottom: '8px' }}>Required Password Improvements:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '12.5px', lineHeight: '1.6' }}>
                {weakPasswordReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            <button 
              type="button" 
              onClick={() => setShowWeakPasswordModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '10px', fontSize: '14.5px', fontWeight: '600', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px', cursor: 'pointer' }}
            >
              Got it! I will enter a strong password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
