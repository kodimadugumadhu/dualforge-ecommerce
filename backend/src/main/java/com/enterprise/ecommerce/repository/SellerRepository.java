package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Seller;
import com.enterprise.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUser(User user);
    Optional<Seller> findByUserId(Long userId);
}
