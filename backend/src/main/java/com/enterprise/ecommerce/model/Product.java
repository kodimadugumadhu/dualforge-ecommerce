package com.enterprise.ecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Entity
@Table(name = "products")
@SQLDelete(sql = "UPDATE products SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;
    private String thumbnailUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private Integer lowStockThreshold = 5;

    @Column(unique = true, nullable = false)
    private String sku;

    private String barcode;
    private String brand;
    private String subCategory;
    private String tags;

    private Double weight; // in kg
    private String dimensions; // e.g. "35x24x2 cm"

    @Column(nullable = false)
    private Double gstPercentage = 18.0;

    private String warranty;
    private String returnPolicy;

    @Column(nullable = false)
    private Double shippingCharges = 0.0;

    @Column(nullable = false)
    private Integer estimatedDeliveryDays = 3;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, DRAFT, OUT_OF_STOCK

    // Expanded Scope Attributes
    @Column(nullable = false)
    private Double discountPercent = 0.0;

    @Column(nullable = false)
    private Double rating = 4.5;

    @Column(nullable = false)
    private Integer reviewCount = 10;

    @Column(length = 1000)
    private String variants; // comma-separated colors, sizes or config

    private String specifications;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Product() {
    }

    public Product(String name, String description, Double price, String imageUrl, String thumbnailUrl, Category category, User seller, 
                   Integer stockQuantity, Integer lowStockThreshold, String sku, String barcode, String brand, String subCategory, 
                   String tags, Double weight, String dimensions, Double gstPercentage, String warranty, String returnPolicy, 
                   Double shippingCharges, Integer estimatedDeliveryDays, Double discountPercent, Double rating, Integer reviewCount, 
                   String variants, String specifications) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.category = category;
        this.seller = seller;
        this.stockQuantity = stockQuantity;
        this.lowStockThreshold = lowStockThreshold != null ? lowStockThreshold : 5;
        this.sku = sku;
        this.barcode = barcode;
        this.brand = brand;
        this.subCategory = subCategory;
        this.tags = tags;
        this.weight = weight;
        this.dimensions = dimensions;
        this.gstPercentage = gstPercentage != null ? gstPercentage : 18.0;
        this.warranty = warranty;
        this.returnPolicy = returnPolicy;
        this.shippingCharges = shippingCharges != null ? shippingCharges : 0.0;
        this.estimatedDeliveryDays = estimatedDeliveryDays != null ? estimatedDeliveryDays : 3;
        this.discountPercent = discountPercent != null ? discountPercent : 0.0;
        this.rating = rating != null ? rating : 4.5;
        this.reviewCount = reviewCount != null ? reviewCount : 10;
        this.variants = variants;
        this.specifications = specifications;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public Double getGstPercentage() { return gstPercentage; }
    public void setGstPercentage(Double gstPercentage) { this.gstPercentage = gstPercentage; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public String getReturnPolicy() { return returnPolicy; }
    public void setReturnPolicy(String returnPolicy) { this.returnPolicy = returnPolicy; }

    public Double getShippingCharges() { return shippingCharges; }
    public void setShippingCharges(Double shippingCharges) { this.shippingCharges = shippingCharges; }

    public Integer getEstimatedDeliveryDays() { return estimatedDeliveryDays; }
    public void setEstimatedDeliveryDays(Integer estimatedDeliveryDays) { this.estimatedDeliveryDays = estimatedDeliveryDays; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public String getVariants() { return variants; }
    public void setVariants(String variants) { this.variants = variants; }

    public String getSpecifications() { return specifications; }
    public void setSpecifications(String specifications) { this.specifications = specifications; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
