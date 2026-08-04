package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.*;
import com.enterprise.ecommerce.model.RefreshToken;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.service.AuthService;
import com.enterprise.ecommerce.service.RefreshTokenService;
import com.enterprise.ecommerce.security.JwtUtils;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.enterprise.ecommerce.service.OtpService otpService;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.enterprise.ecommerce.repository.UserRepository userRepository;

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean exists = userRepository.existsByUsernameIgnoreCase(username.trim());
        if (exists) {
            return ResponseEntity.badRequest().body(new MessageResponse("Username '" + username + "' is already taken!"));
        }
        return ResponseEntity.ok(new MessageResponse("Username is available!"));
    }

    @GetMapping("/check-phone")
    public ResponseEntity<?> checkPhone(@RequestParam String phone) {
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() < 10) {
            return ResponseEntity.badRequest().body(new MessageResponse("Invalid phone number! Must be at least 10 digits."));
        }
        boolean exists = userRepository.existsByPhone(phone.trim()) || userRepository.existsByPhone(cleanPhone);
        if (exists) {
            return ResponseEntity.badRequest().body(new MessageResponse("Phone number is already registered with another account!"));
        }
        return ResponseEntity.ok(new MessageResponse("Phone number is valid and available!"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestParam String target, @RequestParam(required = false) String phone) {
        String cleanedTarget = target != null ? target.trim() : "";
        if (cleanedTarget.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Target email or phone number is required."));
        }

        // If target looks like phone number, validate format first
        if (!cleanedTarget.contains("@")) {
            String digits = cleanedTarget.replaceAll("[^0-9]", "");
            if (digits.length() < 10) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Please provide a valid 10-digit phone number."));
            }
            if (userRepository.existsByPhone(cleanedTarget) || userRepository.existsByPhone(digits)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Phone number is already registered."));
            }
        }

        try {
            String code = otpService.generateOtp(cleanedTarget, phone != null ? phone : cleanedTarget, "REGISTRATION");
            return ResponseEntity.ok(new MessageResponse("OTP verification code dispatched to " + cleanedTarget + "! [DEMO CODE: " + code + "]"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest, ipAddress, userAgent);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            User registered = authService.registerUser(signUpRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully as " + registered.getRole().name()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        try {
            authService.forgotPassword(email);
            return ResponseEntity.ok(new MessageResponse("Security recovery OTP dispatched to your registered email!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        try {
            authService.resetPassword(request);
            return ResponseEntity.ok(new MessageResponse("Password reset successful! All other active sessions have been invalidated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request, HttpServletRequest httpRequest) {
        String requestRefreshToken = request.getRefreshToken();
        String ipAddress = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty()) {
            ipAddress = httpRequest.getRemoteAddr();
        }
        String userAgent = httpRequest.getHeader("User-Agent");

        try {
            RefreshToken rotatedToken = refreshTokenService.rotateRefreshToken(requestRefreshToken, userAgent, ipAddress);
            String token = jwtUtils.generateTokenFromUsername(rotatedToken.getUser().getUsername());
            return ResponseEntity.ok(new TokenRefreshResponse(token, rotatedToken.getToken()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
