package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.CartItemRequest;
import com.enterprise.ecommerce.model.Cart;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.getCartByUserId(userDetails.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addItem(@Valid @RequestBody CartItemRequest req,
                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.addItemToCart(userDetails.getId(), req.getProductId(), req.getQuantity()));
    }

    @PutMapping("/update")
    public ResponseEntity<Cart> updateItem(@Valid @RequestBody CartItemRequest req,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.updateItemQuantity(userDetails.getId(), req.getProductId(), req.getQuantity()));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long productId,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userDetails.getId(), productId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
