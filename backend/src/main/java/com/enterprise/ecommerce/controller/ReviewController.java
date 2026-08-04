package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.ReviewRequest;
import com.enterprise.ecommerce.model.Review;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public List<Review> getReviews(@PathVariable Long productId) {
        return reviewService.getReviewsByProduct(productId);
    }

    @PostMapping("/product/{productId}")
    public ResponseEntity<Review> writeReview(@PathVariable Long productId,
                                              @Valid @RequestBody ReviewRequest req,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reviewService.addReview(productId, userDetails.getId(), req.getRating(), req.getComment()));
    }

    @PutMapping("/{id}/helpful")
    public ResponseEntity<Review> voteHelpful(@PathVariable String id) {
        return ResponseEntity.ok(reviewService.voteHelpful(id));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Review> addReply(@PathVariable String id, @RequestParam String text) {
        return ResponseEntity.ok(reviewService.addReply(id, text));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable String id,
                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reviewService.deleteReview(id, userDetails.getId(), isAdmin);
        return ResponseEntity.ok().build();
    }
}
