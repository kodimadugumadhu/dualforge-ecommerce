package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.MessageResponse;
import com.enterprise.ecommerce.dto.ProductRequest;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Product> getAllProducts(@RequestParam(required = false) String search) {
        if (search != null) {
            return productService.searchProducts(search);
        }
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/category/{categoryId}")
    public List<Product> getProductsByCategory(@PathVariable Long categoryId) {
        return productService.getProductsByCategory(categoryId);
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public List<Product> getProductsBySeller(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return productService.getProductsBySeller(userDetails.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequest req,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User seller = userRepository.findById(userDetails.getId()).orElse(null);
        if (seller == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Seller not found"));
        }
        Product product = productService.createProduct(req, seller);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest req,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User seller = userRepository.findById(userDetails.getId()).orElse(null);
        if (seller == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        try {
            Product product = productService.updateProduct(id, req, seller);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User seller = userRepository.findById(userDetails.getId()).orElse(null);
        if (seller == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
        }
        try {
            productService.deleteProduct(id, seller);
            return ResponseEntity.ok(new MessageResponse("Product deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }
}
