package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.ProductRequest;
import com.enterprise.ecommerce.model.Category;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.model.Role;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.CategoryRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    public List<Product> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll();
        }
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }

    @Transactional
    public Product createProduct(ProductRequest req, User seller) {
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + req.getCategoryId()));

        Product product = new Product(
                req.getName(),
                req.getDescription(),
                req.getPrice(),
                req.getImageUrl(),
                req.getThumbnailUrl(),
                category,
                seller,
                req.getStockQuantity(),
                req.getLowStockThreshold(),
                req.getSku(),
                req.getBarcode(),
                req.getBrand(),
                req.getSubCategory(),
                req.getTags(),
                req.getWeight(),
                req.getDimensions(),
                req.getGstPercentage(),
                req.getWarranty(),
                req.getReturnPolicy(),
                req.getShippingCharges(),
                req.getEstimatedDeliveryDays(),
                req.getDiscountPercent(),
                req.getRating(),
                req.getReviewCount(),
                req.getVariants(),
                req.getSpecifications()
        );

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequest req, User seller) {
        Product product = getProductById(id);

        // Security check: Only the owning seller or an admin can modify products
        if (!seller.getRole().equals(Role.ROLE_ADMIN) && !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access Denied: You cannot modify other sellers' products.");
        }

        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + req.getCategoryId()));

        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setPrice(req.getPrice());
        product.setImageUrl(req.getImageUrl());
        product.setThumbnailUrl(req.getThumbnailUrl());
        product.setCategory(category);
        product.setStockQuantity(req.getStockQuantity());
        product.setLowStockThreshold(req.getLowStockThreshold());
        product.setSku(req.getSku());
        product.setBarcode(req.getBarcode());
        product.setBrand(req.getBrand());
        product.setSubCategory(req.getSubCategory());
        product.setTags(req.getTags());
        product.setWeight(req.getWeight());
        product.setDimensions(req.getDimensions());
        product.setGstPercentage(req.getGstPercentage());
        product.setWarranty(req.getWarranty());
        product.setReturnPolicy(req.getReturnPolicy());
        product.setShippingCharges(req.getShippingCharges());
        product.setEstimatedDeliveryDays(req.getEstimatedDeliveryDays());
        product.setDiscountPercent(req.getDiscountPercent());
        product.setRating(req.getRating());
        product.setReviewCount(req.getReviewCount());
        product.setVariants(req.getVariants());
        product.setSpecifications(req.getSpecifications());

        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Long id, User seller) {
        Product product = getProductById(id);

        if (!seller.getRole().equals(Role.ROLE_ADMIN) && !product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Access Denied: You cannot delete other sellers' products.");
        }

        productRepository.delete(product);
    }
}
