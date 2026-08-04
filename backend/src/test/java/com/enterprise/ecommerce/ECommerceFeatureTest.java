package com.enterprise.ecommerce;

import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import com.enterprise.ecommerce.service.OrderService;
import com.enterprise.ecommerce.service.ProductService;
import com.enterprise.ecommerce.service.WishlistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ECommerceFeatureTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private com.enterprise.ecommerce.service.CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    private User sellerA;
    private User sellerB;
    private User customer;
    private Category category;
    private Product productA;
    private Product productB;

    @BeforeEach
    public void setup() {
        // Create Seller A
        sellerA = new User(
                "sellerA_" + UUID.randomUUID().toString().substring(0, 5),
                "sellera@test.com",
                "password",
                Role.ROLE_SELLER,
                "Seller",
                "A",
                "1234567890"
        );
        userRepository.save(sellerA);

        // Create Seller B
        sellerB = new User(
                "sellerB_" + UUID.randomUUID().toString().substring(0, 5),
                "sellerb@test.com",
                "password",
                Role.ROLE_SELLER,
                "Seller",
                "B",
                "1234567891"
        );
        userRepository.save(sellerB);

        // Create Customer
        customer = new User(
                "customer_" + UUID.randomUUID().toString().substring(0, 5),
                "customer@test.com",
                "password",
                Role.ROLE_CUSTOMER,
                "Customer",
                "Test",
                "1234567892"
        );
        userRepository.save(customer);

        // Create Category
        category = new Category();
        category.setName("TestCategoryUnique");
        category.setDescription("Electronics Devices");
        categoryRepository.save(category);

        // Create Product for Seller A
        productA = new Product();
        productA.setName("Seller A Laptop");
        productA.setPrice(1000.0);
        productA.setCategory(category);
        productA.setSeller(sellerA);
        productA.setStockQuantity(10);
        productA.setSku("LAPTOP-S-A");
        productA.setGstPercentage(18.0);
        productRepository.save(productA);

        // Create Product for Seller B
        productB = new Product();
        productB.setName("Seller B Mouse");
        productB.setPrice(50.0);
        productB.setCategory(category);
        productB.setSeller(sellerB);
        productB.setStockQuantity(100);
        productB.setSku("MOUSE-S-B");
        productB.setGstPercentage(18.0);
        productRepository.save(productB);
    }

    @Test
    public void testWishlistAddAndRemove() {
        // Add to wishlist
        Wishlist w = wishlistService.addProductToWishlist(customer.getId(), productA.getId());
        assertNotNull(w);
        assertEquals(1, w.getProducts().size());
        assertEquals(productA.getId(), w.getProducts().get(0).getId());

        // Test duplicate prevention
        Wishlist wDuplicate = wishlistService.addProductToWishlist(customer.getId(), productA.getId());
        assertEquals(1, wDuplicate.getProducts().size()); // should not duplicate

        // Remove from wishlist
        Wishlist wRemoved = wishlistService.removeProductFromWishlist(customer.getId(), productA.getId());
        assertEquals(0, wRemoved.getProducts().size());
    }

    @Test
    public void testOrderItemStatusTransitionsAndSecurity() {
        // Build mock order
        Order order = new Order(
                customer,
                LocalDateTime.now(),
                OrderStatus.PENDING,
                1050.0,
                "123 Main St, Bangalore",
                "UPI",
                "PENDING"
        );
        orderRepository.save(order);

        OrderItem itemA = new OrderItem(order, productA, 1, 1000.0);
        orderItemRepository.save(itemA);

        OrderItem itemB = new OrderItem(order, productB, 1, 50.0);
        orderItemRepository.save(itemB);

        order.setItems(new java.util.ArrayList<>(java.util.List.of(itemA, itemB)));
        orderRepository.save(order);

        // Verify initial statuses are PENDING
        assertEquals(OrderStatus.PENDING, itemA.getStatus());
        assertEquals(OrderStatus.PENDING, itemB.getStatus());
        assertEquals(OrderStatus.PENDING, order.getStatus());

        // Test Seller A updates their item (itemA) status to CONFIRMED
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemA.getId(), "CONFIRMED", sellerA.getId()));
        assertEquals(OrderStatus.CONFIRMED, itemA.getStatus());
        assertEquals(OrderStatus.CONFIRMED, order.getStatus()); // Order becomes CONFIRMED

        // Test Seller A attempts to update Seller B's item (itemB) status - should fail
        Exception exception = assertThrows(RuntimeException.class, () -> 
                orderService.updateOrderItemStatus(itemB.getId(), "CONFIRMED", sellerA.getId())
        );
        assertTrue(exception.getMessage().contains("Access denied"));

        // Test invalid status transitions on itemA (CONFIRMED -> DELIVERED directly should fail)
        Exception invalidTransitionEx = assertThrows(RuntimeException.class, () -> 
                orderService.updateOrderItemStatus(itemA.getId(), "DELIVERED", sellerA.getId())
        );
        assertTrue(invalidTransitionEx.getMessage().contains("Invalid status transition"));

        // Test valid transitions for itemA: CONFIRMED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemA.getId(), "SHIPPED", sellerA.getId()));
        assertEquals(OrderStatus.SHIPPED, itemA.getStatus());
        assertEquals(OrderStatus.SHIPPED, order.getStatus());

        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemA.getId(), "OUT_FOR_DELIVERY", sellerA.getId()));
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, itemA.getStatus());
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, order.getStatus());

        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemA.getId(), "DELIVERED", sellerA.getId()));
        assertEquals(OrderStatus.DELIVERED, itemA.getStatus());
        // Since itemB is still PENDING, overall order is not yet DELIVERED
        assertNotEquals(OrderStatus.DELIVERED, order.getStatus());

        // Now deliver itemB (Seller B)
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemB.getId(), "CONFIRMED", sellerB.getId()));
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemB.getId(), "SHIPPED", sellerB.getId()));
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemB.getId(), "OUT_FOR_DELIVERY", sellerB.getId()));
        assertDoesNotThrow(() -> orderService.updateOrderItemStatus(itemB.getId(), "DELIVERED", sellerB.getId()));

        assertEquals(OrderStatus.DELIVERED, itemB.getStatus());
        // Now that all items are delivered, parent order status must be DELIVERED and marked PAID
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
        assertEquals("PAID", order.getPaymentStatus());
    }

    @Test
    public void testCartOperations() {
        // Get initial cart
        Cart cart = cartService.getCartByUserId(customer.getId());
        assertNotNull(cart);
        assertEquals(0, cart.getItems().size());

        // Add productA to cart
        Cart updatedCart = cartService.addItemToCart(customer.getId(), productA.getId(), 2);
        assertNotNull(updatedCart);
        assertEquals(1, updatedCart.getItems().size());
        assertEquals(productA.getId(), updatedCart.getItems().get(0).getProduct().getId());
        assertEquals(2, updatedCart.getItems().get(0).getQuantity());

        // Add duplicate productA to cart
        Cart updatedCart2 = cartService.addItemToCart(customer.getId(), productA.getId(), 3);
        assertEquals(1, updatedCart2.getItems().size());
        assertEquals(5, updatedCart2.getItems().get(0).getQuantity());

        // Update quantity
        Cart updatedCart3 = cartService.updateItemQuantity(customer.getId(), productA.getId(), 4);
        assertEquals(4, updatedCart3.getItems().get(0).getQuantity());

        // Remove item
        Cart updatedCart4 = cartService.removeItemFromCart(customer.getId(), productA.getId());
        assertEquals(0, updatedCart4.getItems().size());
    }
}
