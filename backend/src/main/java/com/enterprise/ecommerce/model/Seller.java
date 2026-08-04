package com.enterprise.ecommerce.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sellers")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String storeName;

    private String logoUrl;
    private String bannerUrl;
    private String gstNumber;
    private String bankDetails;
    private String businessAddress;

    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED
    private Double sellerRating = 5.0;
    private boolean storeVerified = false;

    public Seller() {
    }

    public Seller(User user, String storeName, String gstNumber, String bankDetails, String businessAddress) {
        this.user = user;
        this.storeName = storeName;
        this.gstNumber = gstNumber;
        this.bankDetails = bankDetails;
        this.businessAddress = businessAddress;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getBannerUrl() { return bannerUrl; }
    public void setBannerUrl(String bannerUrl) { this.bannerUrl = bannerUrl; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getBankDetails() { return bankDetails; }
    public void setBankDetails(String bankDetails) { this.bankDetails = bankDetails; }

    public String getBusinessAddress() { return businessAddress; }
    public void setBusinessAddress(String businessAddress) { this.businessAddress = businessAddress; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public Double getSellerRating() { return sellerRating; }
    public void setSellerRating(Double sellerRating) { this.sellerRating = sellerRating; }

    public boolean isStoreVerified() { return storeVerified; }
    public void setStoreVerified(boolean storeVerified) { this.storeVerified = storeVerified; }
}
