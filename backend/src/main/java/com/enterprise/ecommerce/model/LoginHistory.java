package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_histories")
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String ipAddress;
    private String country;
    private String city;
    private String browser;
    private String operatingSystem;
    private String device;

    private LocalDateTime loginTime;
    private LocalDateTime logoutTime;

    private String status; // SUCCESS, FAILED
    private String failureReason;

    public LoginHistory() {
    }

    public LoginHistory(Long userId, String ipAddress, String country, String city, String browser, String operatingSystem, String device, LocalDateTime loginTime, String status, String failureReason) {
        this.userId = userId;
        this.ipAddress = ipAddress;
        this.country = country;
        this.city = city;
        this.browser = browser;
        this.operatingSystem = operatingSystem;
        this.device = device;
        this.loginTime = loginTime;
        this.status = status;
        this.failureReason = failureReason;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBrowser() { return browser; }
    public void setBrowser(String browser) { this.browser = browser; }

    public String getOperatingSystem() { return operatingSystem; }
    public void setOperatingSystem(String operatingSystem) { this.operatingSystem = operatingSystem; }

    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }

    public LocalDateTime getLoginTime() { return loginTime; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }

    public LocalDateTime getLogoutTime() { return logoutTime; }
    public void setLogoutTime(LocalDateTime logoutTime) { this.logoutTime = logoutTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }
}
