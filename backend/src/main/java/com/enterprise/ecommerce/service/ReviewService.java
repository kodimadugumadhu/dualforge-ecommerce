package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Review;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.Order;
import com.enterprise.ecommerce.repository.ReviewRepository;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional
    public Review addReview(Long productId, Long userId, Integer rating, String comment) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Review review = new Review(
                productId,
                userId,
                user.getUsername(),
                rating,
                comment,
                LocalDateTime.now()
        );

        // Check if user has purchased this product to apply the Verified Purchase badge
        boolean purchased = orderRepository.findByUserIdOrderByOrderDateDesc(userId).stream()
                .anyMatch(order -> order.getItems().stream()
                        .anyMatch(item -> item.getProduct().getId().equals(productId)));
        review.setVerifiedPurchase(purchased);

        Review savedReview = reviewRepository.save(review);

        // Update rating summary on product
        List<Review> reviews = reviewRepository.findByProductIdOrderByDateDesc(productId);
        double total = 0.0;
        for (Review r : reviews) {
            total += r.getRating();
        }
        double avgRating = reviews.isEmpty() ? 0.0 : total / reviews.size();
        product.setRating(avgRating);
        product.setReviewCount(reviews.size());
        productRepository.save(product);

        return savedReview;
    }

    public List<Review> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByDateDesc(productId);
    }

    @Transactional
    public Review voteHelpful(String reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        review.setHelpfulVotes(review.getHelpfulVotes() + 1);
        return reviewRepository.save(review);
    }

    @Transactional
    public Review addReply(String reviewId, String replyText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));
        review.getReplies().add(replyText);
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(String reviewId, Long userId, boolean isAdmin) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with id: " + reviewId));

        if (!isAdmin && !review.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot delete other users' reviews.");
        }

        reviewRepository.delete(review);

        // Re-calculate product ratings
        productRepository.findById(review.getProductId()).ifPresent(product -> {
            List<Review> reviews = reviewRepository.findByProductIdOrderByDateDesc(product.getId());
            double total = 0.0;
            for (Review r : reviews) {
                total += r.getRating();
            }
            double avgRating = reviews.isEmpty() ? 4.5 : total / reviews.size();
            product.setRating(avgRating);
            product.setReviewCount(reviews.size());
            productRepository.save(product);
        });
    }
}
