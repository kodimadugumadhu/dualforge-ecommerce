package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.RefreshToken;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.RefreshTokenRepository;
import com.enterprise.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    // Refresh token is valid for 7 days (604800000 ms) for enterprise usage
    private static final long REFRESH_TOKEN_EXPIRY_MS = 604800000;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId, String userAgent, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        // Create new device session
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_EXPIRY_MS));
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUserAgent(userAgent);
        refreshToken.setIpAddress(ipAddress);

        // Update active device count on User entity
        int currentDevices = user.getActiveDeviceCount();
        user.setActiveDeviceCount(currentDevices + 1);
        userRepository.save(user);

        return refreshTokenRepository.save(refreshToken);
    }

    // Overload for backward compatibility in tests
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        return createRefreshToken(userId, "Unknown Device", "127.0.0.1");
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            
            User user = token.getUser();
            if (user != null) {
                user.setActiveDeviceCount(Math.max(0, user.getActiveDeviceCount() - 1));
                userRepository.save(user);
            }
            throw new RuntimeException("Refresh token was expired. Please make a new signin request.");
        }
        return token;
    }

    @Transactional
    public RefreshToken rotateRefreshToken(String oldTokenString, String userAgent, String ipAddress) {
        RefreshToken oldToken = refreshTokenRepository.findByToken(oldTokenString)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // Verify expiration
        verifyExpiration(oldToken);

        User user = oldToken.getUser();

        // Invalidate old token (Rotation)
        refreshTokenRepository.delete(oldToken);

        // Create new token
        RefreshToken newToken = new RefreshToken();
        newToken.setUser(user);
        newToken.setExpiryDate(Instant.now().plusMillis(REFRESH_TOKEN_EXPIRY_MS));
        newToken.setToken(UUID.randomUUID().toString());
        newToken.setUserAgent(userAgent);
        newToken.setIpAddress(ipAddress);

        return refreshTokenRepository.save(newToken);
    }

    @Transactional
    public void revokeToken(String tokenString) {
        refreshTokenRepository.findByToken(tokenString).ifPresent(token -> {
            refreshTokenRepository.delete(token);
            User user = token.getUser();
            if (user != null) {
                user.setActiveDeviceCount(Math.max(0, user.getActiveDeviceCount() - 1));
                userRepository.save(user);
            }
        });
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setActiveDeviceCount(0);
                    userRepository.save(user);
                    return refreshTokenRepository.deleteByUser(user);
                })
                .orElse(0);
    }
}
