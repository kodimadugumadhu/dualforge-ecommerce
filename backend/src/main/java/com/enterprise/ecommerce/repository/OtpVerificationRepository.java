package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByTargetAndPurposeOrderByCreatedAtDesc(String target, String purpose);
    Optional<OtpVerification> findByTargetAndPurposeAndVerifiedFalse(String target, String purpose);
}
