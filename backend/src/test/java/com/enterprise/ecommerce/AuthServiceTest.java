package com.enterprise.ecommerce;

import com.enterprise.ecommerce.dto.LoginRequest;
import com.enterprise.ecommerce.model.Role;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.service.AuthService;
import com.enterprise.ecommerce.service.RefreshTokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenService refreshTokenService;

    private User testUser;
    private String uniqueUsername;

    @BeforeEach
    public void setup() {
        uniqueUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);
        testUser = new User(
                uniqueUsername,
                uniqueUsername + "@test.com",
                passwordEncoder.encode("securepassword"),
                Role.ROLE_CUSTOMER,
                "Lockout",
                "Test",
                "1234567890"
        );
        testUser.setEmailVerified(true);
        userRepository.save(testUser);
    }

    @Test
    public void testFailedLoginAttemptsIncrementAndLockout() {
        LoginRequest badRequest = new LoginRequest();
        badRequest.setUsername(uniqueUsername);
        badRequest.setPassword("wrongpassword");

        // Attempt 1 to 4 should increment count
        for (int i = 1; i <= 4; i++) {
            try {
                authService.authenticateUser(badRequest, "127.0.0.1", "JUnit-Test-Agent");
            } catch (Exception e) {
                // Ignore credential errors
            }
            User updatedUser = userRepository.findByUsername(uniqueUsername).orElseThrow();
            assertEquals(i, updatedUser.getFailedLoginAttempts());
            assertNull(updatedUser.getLockoutExpiry());
        }

        // Attempt 5 triggers lockout
        try {
            authService.authenticateUser(badRequest, "127.0.0.1", "JUnit-Test-Agent");
        } catch (Exception e) {
            // Expected lockout error
        }

        User lockedUser = userRepository.findByUsername(uniqueUsername).orElseThrow();
        assertEquals(5, lockedUser.getFailedLoginAttempts());
        assertNotNull(lockedUser.getLockoutExpiry());
        assertTrue(lockedUser.getLockoutExpiry().isAfter(LocalDateTime.now()));
    }

    @Test
    public void testRefreshTokenGenerationAndExpiryVerification() {
        // Create refresh token
        var refreshToken = refreshTokenService.createRefreshToken(testUser.getId(), "JUnit-Test-Agent", "127.0.0.1");
        assertNotNull(refreshToken);
        assertNotNull(refreshToken.getToken());
        assertEquals(testUser.getId(), refreshToken.getUser().getId());

        // Verify valid token does not throw expiration
        assertDoesNotThrow(() -> refreshTokenService.verifyExpiration(refreshToken));
    }
}
