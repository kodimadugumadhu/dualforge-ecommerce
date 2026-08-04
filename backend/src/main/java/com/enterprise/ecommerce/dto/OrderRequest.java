package com.enterprise.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;

public class OrderRequest {
    @NotBlank
    private String shippingAddress;

    @NotBlank
    private String paymentMethod; // e.g. "CARD", "UPI", "RAZORPAY"

    private String paymentStatus;

    private String couponCode; // Optional promo code

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
