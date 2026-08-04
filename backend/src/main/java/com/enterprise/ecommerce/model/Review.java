package com.enterprise.ecommerce.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    
    private Long productId;
    private Long userId;
    private String username;
    private Integer rating;
    private String comment;
    private LocalDateTime date;

    private boolean verifiedPurchase = false;
    private int helpfulVotes = 0;
    
    private List<String> images = new ArrayList<>();
    private List<String> replies = new ArrayList<>();

    public Review() {
    }

    public Review(Long productId, Long userId, String username, Integer rating, String comment, LocalDateTime date) {
        this.productId = productId;
        this.userId = userId;
        this.username = username;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public boolean isVerifiedPurchase() { return verifiedPurchase; }
    public void setVerifiedPurchase(boolean verifiedPurchase) { this.verifiedPurchase = verifiedPurchase; }

    public int getHelpfulVotes() { return helpfulVotes; }
    public void setHelpfulVotes(int helpfulVotes) { this.helpfulVotes = helpfulVotes; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public List<String> getReplies() { return replies; }
    public void setReplies(List<String> replies) { this.replies = replies; }
}
