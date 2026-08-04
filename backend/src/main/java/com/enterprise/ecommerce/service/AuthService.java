package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.JwtResponse;
import com.enterprise.ecommerce.dto.LoginRequest;
import com.enterprise.ecommerce.dto.SignupRequest;
import com.enterprise.ecommerce.dto.PasswordResetRequest;
import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import com.enterprise.ecommerce.security.JwtUtils;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private LoginHistoryRepository loginHistoryRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private OtpService otpService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest, String ipAddress, String userAgent) {
        // Support lookup by username OR email
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername())
                .or(() -> userRepository.findByEmail(loginRequest.getUsername()));

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Error: Invalid credentials.");
        }

        User user = userOpt.get();

        // 1. Lockout & Status Checks
        if (user.getAccountStatus() == AccountStatus.LOCKED || 
           (user.getLockoutExpiry() != null && user.getLockoutExpiry().isAfter(LocalDateTime.now()))) {
            user.setAccountStatus(AccountStatus.LOCKED);
            userRepository.save(user);
            
            // Record failure to login history
            recordLoginHistory(user.getId(), ipAddress, userAgent, "FAILED", "ACCOUNT LOCKED");
            throw new RuntimeException("Account is locked temporarily due to repeated login failures. Lockout expires at: " + user.getLockoutExpiry());
        }

        if (user.getAccountStatus() == AccountStatus.DISABLED) {
            recordLoginHistory(user.getId(), ipAddress, userAgent, "FAILED", "ACCOUNT DISABLED");
            throw new RuntimeException("Account is disabled. Please contact administrator support.");
        }

        // 2. Email Verification Check
        if (!user.isEmailVerified()) {
            recordLoginHistory(user.getId(), ipAddress, userAgent, "FAILED", "EMAIL NOT VERIFIED");
            throw new RuntimeException("Please verify your email Address first using the registration OTP code.");
        }

        try {
            // Must authenticate using the canonical username retrieved from database
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String role = userDetails.getAuthorities().iterator().next().getAuthority();

            // Clear login failures on successful authentication
            user.setFailedLoginAttempts(0);
            user.setLockoutExpiry(null);
            user.setAccountStatus(AccountStatus.ACTIVE);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Create refresh token
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId(), userAgent, ipAddress);

            // Record log events
            recordLoginHistory(user.getId(), ipAddress, userAgent, "SUCCESS", null);
            
            activityLogRepository.save(new ActivityLog(
                    user.getId(),
                    user.getUsername(),
                    "LOGIN",
                    "User authenticated successfully via JWT token. Session active.",
                    ipAddress,
                    LocalDateTime.now()
            ));

            // Send Security alert email
            otpService.sendEmailAlert(
                    user.getEmail(), 
                    "DualForge Security Alert: New Login Detected", 
                    "Hello " + user.getFirstName() + ",\n\nWe detected a new login to your DualForge account from IP: " + ipAddress + " using device: " + userAgent + ".\nIf this wasn't you, please secure your password immediately."
            );

            return new JwtResponse(
                    jwt,
                    refreshToken.getToken(),
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    role,
                    user.getFirstName(),
                    user.getLastName()
            );

        } catch (Exception e) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            
            if (attempts >= 5) {
                user.setLockoutExpiry(LocalDateTime.now().plusMinutes(15));
                user.setAccountStatus(AccountStatus.LOCKED);
                userRepository.save(user);
                recordLoginHistory(user.getId(), ipAddress, userAgent, "FAILED", "ACCOUNT LOCKED ON BRUTE FORCE");
                throw new RuntimeException("Account locked! Too many incorrect password entries. Try again in 15 minutes.");
            } else {
                userRepository.save(user);
                recordLoginHistory(user.getId(), ipAddress, userAgent, "FAILED", "BAD CREDENTIALS");
                throw new RuntimeException("Invalid credentials. Remaining attempts: " + (5 - attempts));
            }
        }
    }

    // Overload for backward compatibility in tests
    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        return authenticateUser(loginRequest, "127.0.0.1", "Mock Agent");
    }

    @Transactional
    public User registerUser(SignupRequest signUpRequest) {
        String username = signUpRequest.getUsername() != null ? signUpRequest.getUsername().trim() : "";
        String email = signUpRequest.getEmail() != null ? signUpRequest.getEmail().trim().toLowerCase() : "";
        String phone = signUpRequest.getPhone() != null ? signUpRequest.getPhone().trim() : "";

        if (username.isEmpty()) {
            throw new RuntimeException("Error: Username is required!");
        }

        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw new RuntimeException("Error: Username '" + username + "' is already taken! Users cannot use the same username.");
        }

        if (email.isEmpty() || userRepository.existsByEmail(email)) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Validate phone number format (must be valid 10-digit mobile number)
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            throw new RuntimeException("Error: Please provide a valid 10-digit mobile phone number!");
        }

        if (userRepository.existsByPhone(phone) || userRepository.existsByPhone(cleanPhone)) {
            throw new RuntimeException("Error: Phone number is already registered with another account!");
        }

        // Verify Registration OTP (supports verification via phone OR email)
        boolean otpVerified = false;
        if (signUpRequest.getOtpCode() != null && !signUpRequest.getOtpCode().trim().isEmpty()) {
            otpVerified = otpService.verifyOtp(phone, "REGISTRATION", signUpRequest.getOtpCode()) ||
                          otpService.verifyOtp(cleanPhone, "REGISTRATION", signUpRequest.getOtpCode()) ||
                          otpService.verifyOtp(email, "REGISTRATION", signUpRequest.getOtpCode());
        }

        if (!otpVerified) {
            throw new RuntimeException("Error: Invalid or expired OTP verification code! Please verify your phone number via OTP.");
        }

        // Validate password strength & continuous number patterns
        validatePasswordStrength(signUpRequest.getPassword());

        // Determine user role (Default to Customer, public Admin creation prohibited)
        Role userRole = Role.ROLE_CUSTOMER;
        if (signUpRequest.getRole() != null) {
            if (signUpRequest.getRole().equalsIgnoreCase("admin")) {
                throw new RuntimeException("Public registration of Super Admin accounts is strictly prohibited. Admin accounts are system-provisioned only.");
            } else if (signUpRequest.getRole().equalsIgnoreCase("seller")) {
                userRole = Role.ROLE_SELLER;
            }
        }

        // Create new user's account
        User user = new User(
                username,
                email,
                encoder.encode(signUpRequest.getPassword()),
                userRole,
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                phone
        );

        // Verification flags active after registration OTP passes
        user.setEmailVerified(true);
        user.setMobileVerified(true);
        user.setEnabled(true);
        user.setAccountStatus(AccountStatus.ACTIVE);

        // Save password history
        user.setPasswordHistory(user.getPassword());

        User savedUser = userRepository.save(user);

        // Create cart and wishlist for customer
        cartRepository.save(new Cart(savedUser));
        wishlistRepository.save(new Wishlist(savedUser));

        // If registered as seller, create pending seller profile for admin review
        if (userRole == Role.ROLE_SELLER) {
            Seller sellerProfile = new Seller(
                savedUser, 
                (signUpRequest.getFirstName() != null ? signUpRequest.getFirstName() : username) + "'s Store", 
                "PENDING_VERIFICATION", 
                "Pending Account Verification", 
                "Pending Business Address"
            );
            sellerProfile.setApprovalStatus("PENDING");
            sellerProfile.setStoreVerified(false);
            sellerRepository.save(sellerProfile);
        }

        return savedUser;
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account associated with email: " + email));

        // Generate OTP for Password Reset
        otpService.generateOtp(email, user.getPhone(), "PASSWORD_RESET");
    }

    @Transactional
    public void resetPassword(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account associated with email: " + request.getEmail()));

        // 1. Verify OTP purpose
        if (!otpService.verifyOtp(request.getEmail(), "PASSWORD_RESET", request.getOtpCode())) {
            throw new RuntimeException("Invalid or expired password reset OTP code.");
        }

        // 2. Validate password strength
        validatePasswordStrength(request.getNewPassword());

        // 3. Validate password history (max 3 passwords)
        String history = user.getPasswordHistory() != null ? user.getPasswordHistory() : "";
        String[] oldPasswords = history.split(",");
        for (String oldPw : oldPasswords) {
            if (!oldPw.trim().isEmpty() && encoder.matches(request.getNewPassword(), oldPw)) {
                throw new RuntimeException("Cannot reuse any of your last 3 passwords.");
            }
        }

        // 4. Update password
        String hashedNew = encoder.encode(request.getNewPassword());
        user.setPassword(hashedNew);

        // Update history
        StringBuilder newHistory = new StringBuilder(hashedNew);
        int count = 1;
        for (String oldPw : oldPasswords) {
            if (count < 3 && !oldPw.trim().isEmpty()) {
                newHistory.append(",").append(oldPw);
                count++;
            }
        }
        user.setPasswordHistory(newHistory.toString());
        userRepository.save(user);

        // 5. Revoke all active sessions and refresh tokens
        refreshTokenService.deleteByUserId(user.getId());

        // 6. Send security alert email
        otpService.sendEmailAlert(
                user.getEmail(),
                "DualForge Security Alert: Password Updated",
                "Hello " + user.getFirstName() + ",\n\nYour account password has been updated successfully. All other active sessions have been logged out.\nIf you did not request this, contact support immediately."
        );
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.trim().length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters long.");
        }

        String pw = password.trim();
        String lower = pw.toLowerCase();

        // Reject continuous/sequential number patterns (e.g. 123456, 987654)
        String[] sequentialPatterns = {
            "1234", "2345", "3456", "4567", "5678", "6789", "7890", "0123",
            "4321", "5432", "6543", "7654", "8765", "9876", "3210",
            "qwerty", "asdfgh", "zxcvbn", "password"
        };
        for (String pattern : sequentialPatterns) {
            if (lower.contains(pattern)) {
                throw new RuntimeException("Weak password! Passwords cannot contain continuous numbers (e.g. 123456) or sequential key patterns. Please select a stronger password.");
            }
        }

        // Reject repeated single characters (e.g. 000000, 111111)
        if (pw.matches("^(.)\\1+$")) {
            throw new RuntimeException("Weak password! Passwords cannot consist of repeated single characters. Please select a stronger password.");
        }

        boolean hasUppercase = !pw.equals(lower);
        boolean hasLowercase = !pw.equals(pw.toUpperCase());
        boolean hasDigit = pw.matches(".*\\d.*");
        boolean hasSpecial = pw.matches(".*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?].*");

        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecial) {
            throw new RuntimeException("Strong password required! Your password must contain a combination of uppercase letters, lowercase letters, numbers, and special characters (!@#$%^&*).");
        }
    }

    private void recordLoginHistory(Long userId, String ipAddress, String userAgent, String status, String failureReason) {
        // Parse User-Agent
        String browser = "Unknown";
        String os = "Unknown";
        String device = "Desktop";

        if (userAgent != null) {
            String uaLower = userAgent.toLowerCase();
            if (uaLower.contains("chrome")) browser = "Chrome";
            else if (uaLower.contains("firefox")) browser = "Firefox";
            else if (uaLower.contains("safari")) browser = "Safari";
            else if (uaLower.contains("edge")) browser = "Edge";
            else if (uaLower.contains("postman")) browser = "Postman Runtime";

            if (uaLower.contains("windows")) os = "Windows";
            else if (uaLower.contains("macintosh") || uaLower.contains("mac os")) os = "macOS";
            else if (uaLower.contains("iphone")) { os = "iOS"; device = "Mobile"; }
            else if (uaLower.contains("android")) { os = "Android"; device = "Mobile"; }
            else if (uaLower.contains("linux")) os = "Linux";
        }

        LoginHistory history = new LoginHistory(
                userId,
                ipAddress,
                "India",
                "Madhyapradesh",
                browser,
                os,
                device,
                LocalDateTime.now(),
                status,
                failureReason
        );
        loginHistoryRepository.save(history);
    }
}
