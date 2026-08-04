package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.model.Wishlist;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(userDetails.getId()));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Wishlist> addToWishlist(@PathVariable Long productId,
                                                  @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(wishlistService.addProductToWishlist(userDetails.getId(), productId));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Wishlist> removeFromWishlist(@PathVariable Long productId,
                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(wishlistService.removeProductFromWishlist(userDetails.getId(), productId));
    }
}
