package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Coupon;
import com.enterprise.ecommerce.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found with code: " + code));
    }

    public Coupon createCoupon(String code, Double discountPercent, int expiryMonths) {
        Coupon coupon = new Coupon(
                code.toUpperCase().trim(),
                discountPercent,
                LocalDateTime.now().plusMonths(expiryMonths),
                true
        );
        return couponRepository.save(coupon);
    }

    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found with id: " + id));
        couponRepository.delete(coupon);
    }
}
