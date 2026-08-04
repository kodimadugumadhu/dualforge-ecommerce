package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductIdOrderByDateDesc(Long productId);
}
