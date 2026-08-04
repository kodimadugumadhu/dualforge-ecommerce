package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.model.Wishlist;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Wishlist getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
                    Wishlist wishlist = new Wishlist(user);
                    return wishlistRepository.save(wishlist);
                });
    }

    @Transactional
    public Wishlist addProductToWishlist(Long userId, Long productId) {
        Wishlist wishlist = getWishlistByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        if (!wishlist.getProducts().contains(product)) {
            wishlist.getProducts().add(product);
        }

        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public Wishlist removeProductFromWishlist(Long userId, Long productId) {
        Wishlist wishlist = getWishlistByUserId(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        wishlist.getProducts().remove(product);
        return wishlistRepository.save(wishlist);
    }
}
