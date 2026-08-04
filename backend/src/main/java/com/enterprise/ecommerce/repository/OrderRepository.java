package com.enterprise.ecommerce.repository;

import com.enterprise.ecommerce.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    List<Order> findDistinctByItemsProductSellerIdOrderByOrderDateDesc(Long sellerId);
}
