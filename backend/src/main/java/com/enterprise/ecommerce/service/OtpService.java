package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.OtpVerification;
import com.enterprise.ecommerce.repository.OtpVerificationRepository;
import com.twilio.Twilio;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private OtpVerificationRepository otpVerificationRepository;

    @Value("${twilio.account.sid}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number}")
    private String twilioPhoneNumber;

    // Helper to secure OTP codes in database using SHA-256
    private String hashOtp(String otp) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(otp.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing OTP: " + e.getMessage());
        }
    }

    @Transactional
    public String generateOtp(String target, String phone, String purpose) {
        String cleanedTarget = target.trim().toLowerCase();
        
        // 1. Rate Limiting & Cooldown Check
        Optional<OtpVerification> lastOtpOpt = otpVerificationRepository
                .findTopByTargetAndPurposeOrderByCreatedAtDesc(cleanedTarget, purpose);

        if (lastOtpOpt.isPresent()) {
            OtpVerification lastOtp = lastOtpOpt.get();
            if (lastOtp.getResendAllowedAfter().isAfter(LocalDateTime.now()) && !lastOtp.isVerified()) {
                throw new RuntimeException("Please wait 60 seconds before requesting another verification code.");
            }
            // Invalidate previous OTP verification records
            if (!lastOtp.isVerified()) {
                lastOtp.setExpiryTime(LocalDateTime.now()); // Expire immediately
                otpVerificationRepository.save(lastOtp);
            }
        }

        // 2. Generate 6-Digit code
        Random random = new Random();
        String code = String.format("%06d", random.nextInt(1000000));
        String hashed = hashOtp(code);

        // 3. Persist Hashed OTP verification
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(5);
        LocalDateTime cooldown = LocalDateTime.now().plusSeconds(60);
        
        OtpVerification otpVerification = new OtpVerification(
                cleanedTarget,
                hashed,
                purpose,
                expiry,
                cooldown
        );
        otpVerification = otpVerificationRepository.save(otpVerification);

        System.out.println("=========================================");
        System.out.println(" OTP GENERATED [" + purpose + "] FOR: " + target);
        System.out.println(" SECURITY CODE: " + code);
        System.out.println("=========================================");

        // 4. Send Email Notification (HTML template)
        if (mailSender != null && cleanedTarget.contains("@")) {
            final OtpVerification finalOtp = otpVerification;
            // Retry wrapper (3 attempts max)
            new Thread(() -> {
                int retryAttempts = 3;
                boolean sent = false;
                while (retryAttempts > 0 && !sent) {
                    try {
                        MimeMessage mimeMessage = mailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
                        helper.setTo(cleanedTarget);
                        helper.setSubject("DualForge Security Verification: " + purpose);
                        
                        String htmlContent = buildHtmlTemplate(purpose, code);
                        helper.setText(htmlContent, true);
                        
                        mailSender.send(mimeMessage);
                        finalOtp.setDeliveryStatus("SENT");
                        otpVerificationRepository.save(finalOtp);
                        System.out.println("OTP email dispatched successfully to " + cleanedTarget);
                        sent = true;
                    } catch (Exception e) {
                        retryAttempts--;
                        System.err.println("Failed to send OTP email. Retries left: " + retryAttempts + ". Error: " + e.getMessage());
                        if (retryAttempts == 0) {
                            finalOtp.setDeliveryStatus("FAILED");
                            otpVerificationRepository.save(finalOtp);
                        }
                        try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                    }
                }
            }).start();
        }

        // 5. Send Twilio SMS Notification
        if (phone != null && !phone.trim().isEmpty() && twilioAccountSid != null && !twilioAccountSid.contains("ACxxxxxx")) {
            final OtpVerification finalOtp = otpVerification;
            new Thread(() -> {
                try {
                    String formattedPhone = phone.trim();
                    if (formattedPhone.length() == 10) {
                        formattedPhone = "+91" + formattedPhone;
                    } else if (!formattedPhone.startsWith("+")) {
                        formattedPhone = "+" + formattedPhone;
                    }

                    Twilio.init(twilioAccountSid, twilioAuthToken);
                    com.twilio.rest.api.v2010.account.Message.creator(
                            new com.twilio.type.PhoneNumber(formattedPhone),
                            new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                            "DualForge " + purpose + " Verification OTP: " + code + ". Valid for 5 minutes."
                    ).create();
                    System.out.println("OTP SMS dispatched successfully to " + formattedPhone);
                } catch (Exception e) {
                    System.err.println("Failed to send real OTP SMS via Twilio. Error: " + e.getMessage());
                }
            }).start();
        }

        return code;
    }

    // Overload for backward compatibility in tests
    public String generateOtp(String target, String phone) {
        return generateOtp(target, phone, "REGISTRATION");
    }

    @Transactional
    public boolean verifyOtp(String target, String purpose, String code) {
        String cleanedTarget = target.trim().toLowerCase();
        Optional<OtpVerification> verificationOpt = otpVerificationRepository
                .findTopByTargetAndPurposeOrderByCreatedAtDesc(cleanedTarget, purpose);

        if (verificationOpt.isEmpty()) {
            return false;
        }

        OtpVerification verification = verificationOpt.get();

        // Check verification states
        if (verification.isVerified()) {
            return false;
        }

        if (verification.getExpiryTime().isBefore(LocalDateTime.now())) {
            return false; // Expired
        }

        if (verification.getAttemptsUsed() >= verification.getMaximumAttempts()) {
            throw new RuntimeException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        // Increment attempts
        verification.setAttemptsUsed(verification.getAttemptsUsed() + 1);
        otpVerificationRepository.save(verification);

        // Compare hashes
        boolean isValid = verification.getHashedOtp().equals(hashOtp(code.trim()));
        if (isValid) {
            verification.setVerified(true);
            otpVerificationRepository.save(verification);
        }

        return isValid;
    }

    // Overload for backward compatibility in tests
    public boolean verifyOtp(String target, String code) {
        return verifyOtp(target, "REGISTRATION", code);
    }

    private String buildHtmlTemplate(String purpose, String code) {
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;\">" +
                "  <div style=\"text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 10px; margin-bottom: 20px;\">" +
                "    <h1 style=\"color: #6366f1; margin: 0;\">DUALFORGE</h1>" +
                "    <p style=\"color: #666666; font-size: 14px; margin: 5px 0 0 0;\">SHOP SMART. PAY SECURE. LIVE BETTER.</p>" +
                "  </div>" +
                "  <div style=\"padding: 10px 0;\">" +
                "    <h2 style=\"color: #333333; margin-top: 0;\">Security Verification</h2>" +
                "    <p style=\"color: #555555; line-height: 1.6;\">You requested a verification code for <strong>" + purpose + "</strong>. Please enter the following 6-digit OTP code on the verification screen:</p>" +
                "    <div style=\"background-color: #f3f4f6; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827; padding: 15px; border-radius: 8px; margin: 25px 0; border: 1px dashed #d1d5db;\">" +
                "      " + code + "" +
                "    </div>" +
                "    <p style=\"color: #999999; font-size: 12px; line-height: 1.4;\">This code is valid for 5 minutes. If you did not request this action, please secure your credentials immediately.</p>" +
                "  </div>" +
                "  <div style=\"text-align: center; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 25px; color: #9aa0a6; font-size: 12px;\">" +
                "    DualForge Platform, Secured Enterprise Gateway" +
                "  </div>" +
                "</div>";
    }

    public void sendEmailAlert(String to, String subject, String body) {
        if (mailSender == null) return;
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
            helper.setTo(to.trim().toLowerCase());
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(mimeMessage);
        } catch (Exception e) {
            System.err.println("Failed to send security email alert to: " + to + ". Error: " + e.getMessage());
        }
    }
}
