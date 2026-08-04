package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_verifications")
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String target; // email or mobile

    @Column(nullable = false)
    private String hashedOtp;

    @Column(nullable = false)
    private String purpose; // REGISTRATION, LOGIN, RESET_PASSWORD

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private LocalDateTime resendAllowedAfter;

    private int maximumAttempts = 5;

    private int attemptsUsed = 0;

    private LocalDateTime createdAt = LocalDateTime.now();

    private boolean verified = false;

    private String deliveryStatus = "PENDING"; // SENT, FAILED, PENDING

    public OtpVerification() {
    }

    public OtpVerification(String target, String hashedOtp, String purpose, LocalDateTime expiryTime, LocalDateTime resendAllowedAfter) {
        this.target = target;
        this.hashedOtp = hashedOtp;
        this.purpose = purpose;
        this.expiryTime = expiryTime;
        this.resendAllowedAfter = resendAllowedAfter;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public String getHashedOtp() { return hashedOtp; }
    public void setHashedOtp(String hashedOtp) { this.hashedOtp = hashedOtp; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public LocalDateTime getResendAllowedAfter() { return resendAllowedAfter; }
    public void setResendAllowedAfter(LocalDateTime resendAllowedAfter) { this.resendAllowedAfter = resendAllowedAfter; }

    public int getMaximumAttempts() { return maximumAttempts; }
    public void setMaximumAttempts(int maximumAttempts) { this.maximumAttempts = maximumAttempts; }

    public int getAttemptsUsed() { return attemptsUsed; }
    public void setAttemptsUsed(int attemptsUsed) { this.attemptsUsed = attemptsUsed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }
}
