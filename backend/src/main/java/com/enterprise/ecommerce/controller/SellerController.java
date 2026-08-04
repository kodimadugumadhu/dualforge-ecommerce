package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.SellerRepository;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/apply")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> applyAsSeller(@RequestParam String storeName,
                                           @RequestParam String gstNumber,
                                           @RequestParam String bankDetails,
                                           @RequestParam String businessAddress,
                                           Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (sellerRepository.findByUser(user).isPresent()) {
            return ResponseEntity.badRequest().body(new com.enterprise.ecommerce.dto.MessageResponse("Seller profile already exists."));
        }

        Seller seller = new Seller(user, storeName, gstNumber, bankDetails, businessAddress);
        sellerRepository.save(seller);

        return ResponseEntity.ok(new com.enterprise.ecommerce.dto.MessageResponse("Seller application submitted successfully! Waiting for admin approval."));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getSellerProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerRepository.findByUser(user).orElse(null);
        if (seller == null) {
            return ResponseEntity.status(404).body(new com.enterprise.ecommerce.dto.MessageResponse("Seller profile not found"));
        }

        return ResponseEntity.ok(seller);
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> updateSellerProfile(@RequestParam(required = false) String storeName,
                                                 @RequestParam(required = false) String logoUrl,
                                                 @RequestParam(required = false) String bannerUrl,
                                                 @RequestParam(required = false) String bankDetails,
                                                 @RequestParam(required = false) String businessAddress,
                                                 Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Seller seller = sellerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        if (storeName != null) seller.setStoreName(storeName);
        if (logoUrl != null) seller.setLogoUrl(logoUrl);
        if (bannerUrl != null) seller.setBannerUrl(bannerUrl);
        if (bankDetails != null) seller.setBankDetails(bankDetails);
        if (businessAddress != null) seller.setBusinessAddress(businessAddress);

        sellerRepository.save(seller);
        return ResponseEntity.ok(new com.enterprise.ecommerce.dto.MessageResponse("Seller profile updated successfully."));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Seller>> getPendingSellers() {
        List<Seller> pending = sellerRepository.findAll().stream()
                .filter(s -> s.getApprovalStatus().equals("PENDING"))
                .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @PutMapping("/admin/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveSeller(@PathVariable Long id, @RequestParam String status) {
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            return ResponseEntity.badRequest().body(new com.enterprise.ecommerce.dto.MessageResponse("Invalid status value. Use APPROVED or REJECTED."));
        }

        seller.setApprovalStatus(status);
        if (status.equals("APPROVED")) {
            seller.setStoreVerified(true);
        }
        sellerRepository.save(seller);

        return ResponseEntity.ok(new com.enterprise.ecommerce.dto.MessageResponse("Seller status updated to: " + status));
    }
}
