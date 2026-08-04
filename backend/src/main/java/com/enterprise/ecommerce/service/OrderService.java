package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional
    public Order checkout(Long userId, String shippingAddress, String paymentMethod, String paymentStatus, String couponCode) {
        Cart cart = cartService.getCartByUserId(userId);
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot checkout an empty cart!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        double subtotal = 0.0;
        List<OrderItem> orderItems = new ArrayList<>();

        // Validate stock and compute subtotal
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStockQuantity() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }
            subtotal += product.getPrice() * cartItem.getQuantity();
        }

        // Apply coupon discount if applicable
        double discount = 0.0;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Optional<Coupon> couponOpt = couponRepository.findByCode(couponCode.trim());
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (coupon.isActive() && coupon.getExpiryDate().isAfter(LocalDateTime.now())) {
                    discount = subtotal * (coupon.getDiscountPercent() / 100.0);
                }
            }
        }

        double totalAmount = subtotal - discount;

        // Create the order entity
        Order order = new Order(
                user,
                LocalDateTime.now(),
                OrderStatus.PENDING,
                totalAmount,
                shippingAddress,
                paymentMethod,
                paymentStatus != null ? paymentStatus : "PENDING"
        );

        Order savedOrder = orderRepository.save(order);

        // Process items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            
            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            // Create order item
            OrderItem orderItem = new OrderItem(
                    savedOrder,
                    product,
                    cartItem.getQuantity(),
                    product.getPrice()
            );
            orderItems.add(orderItemRepository.save(orderItem));
        }

        savedOrder.setItems(orderItems);
        Order finalizedOrder = orderRepository.save(savedOrder);

        // Clear the cart
        cartService.clearCart(userId);

        // MongoDB Audit Logs
        activityLogRepository.save(new ActivityLog(
                user.getId(),
                user.getUsername(),
                "ORDER_PLACE",
                "Placed order #" + finalizedOrder.getId() + " total: $" + totalAmount + " (discount: $" + discount + ") via " + paymentMethod,
                "127.0.0.1",
                LocalDateTime.now()
        ));

        return finalizedOrder;
    }

    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }

    public List<Order> getOrdersBySeller(Long sellerId) {
        return orderRepository.findDistinctByItemsProductSellerIdOrderByOrderDateDesc(sellerId);
    }

    public Order getOrderById(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        if (!isAdmin && !order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot view other users' orders.");
        }

        return order;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public OrderItem updateOrderItemStatus(Long orderItemId, String statusStr, Long userId) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Order item not found with id: " + orderItemId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        boolean isAdmin = user.getRole().equals(Role.ROLE_ADMIN);
        if (!isAdmin && (item.getProduct().getSeller() == null || !item.getProduct().getSeller().getId().equals(userId))) {
            throw new RuntimeException("Access denied: You do not own this product in the order.");
        }

        OrderStatus currentStatus = item.getStatus();
        OrderStatus newStatus = OrderStatus.valueOf(statusStr.toUpperCase());

        if (currentStatus == newStatus) {
            return item;
        }

        boolean validTransition = false;
        if (newStatus == OrderStatus.CANCELLED) {
            if (currentStatus == OrderStatus.PENDING || currentStatus == OrderStatus.CONFIRMED) {
                validTransition = true;
            }
        } else {
            switch (currentStatus) {
                case PENDING:
                    if (newStatus == OrderStatus.CONFIRMED) validTransition = true;
                    break;
                case CONFIRMED:
                    if (newStatus == OrderStatus.SHIPPED) validTransition = true;
                    break;
                case SHIPPED:
                    if (newStatus == OrderStatus.OUT_FOR_DELIVERY) validTransition = true;
                    break;
                case OUT_FOR_DELIVERY:
                    if (newStatus == OrderStatus.DELIVERED) validTransition = true;
                    break;
                case DELIVERED:
                case CANCELLED:
                    break;
            }
        }

        if (!validTransition) {
            throw new RuntimeException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        item.setStatus(newStatus);
        OrderItem updatedItem = orderItemRepository.save(item);

        // Dynamically update the overall order status based on all items
        Order order = item.getOrder();
        boolean allDelivered = true;
        boolean allCancelled = true;
        boolean anyShipped = false;
        boolean anyOutForDelivery = false;
        boolean anyConfirmed = false;

        for (OrderItem oItem : order.getItems()) {
            if (oItem.getStatus() != OrderStatus.DELIVERED) {
                allDelivered = false;
            }
            if (oItem.getStatus() != OrderStatus.CANCELLED) {
                allCancelled = false;
            }
            if (oItem.getStatus() == OrderStatus.SHIPPED) {
                anyShipped = true;
            }
            if (oItem.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                anyOutForDelivery = true;
            }
            if (oItem.getStatus() == OrderStatus.CONFIRMED) {
                anyConfirmed = true;
            }
        }

        if (allDelivered) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setPaymentStatus("PAID");
        } else if (allCancelled) {
            order.setStatus(OrderStatus.CANCELLED);
        } else if (anyOutForDelivery) {
            order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        } else if (anyShipped) {
            order.setStatus(OrderStatus.SHIPPED);
        } else if (anyConfirmed) {
            order.setStatus(OrderStatus.CONFIRMED);
        } else {
            order.setStatus(OrderStatus.PENDING);
        }
        orderRepository.save(order);

        // MongoDB Audit Log
        activityLogRepository.save(new ActivityLog(
                user.getId(),
                user.getUsername(),
                "ORDER_ITEM_STATUS_UPDATE",
                "Order Item #" + orderItemId + " (Product: " + item.getProduct().getName() + ") status updated to: " + newStatus.name(),
                "127.0.0.1",
                LocalDateTime.now()
        ));

        return updatedItem;
    }
}
