package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.MessageResponse;
import com.enterprise.ecommerce.dto.OrderRequest;
import com.enterprise.ecommerce.model.Order;
import com.enterprise.ecommerce.model.OrderItem;
import com.enterprise.ecommerce.model.Role;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.InvoiceService;
import com.enterprise.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody OrderRequest req,
                                      @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Order order = orderService.checkout(
                    userDetails.getId(),
                    req.getShippingAddress(),
                    req.getPaymentMethod(),
                    req.getPaymentStatus(),
                    req.getCouponCode()
            );
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SELLER"));
            Order order = orderService.getOrderById(id, userDetails.getId(), isAdmin);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/seller")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> getSellerOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getOrdersBySeller(userDetails.getId()));
    }

    @PutMapping("/items/{itemId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SELLER')")
    public ResponseEntity<?> updateStatus(@PathVariable Long itemId,
                                          @RequestBody java.util.Map<String, String> body,
                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            String newStatus = body != null ? body.get("status") : null;
            if (newStatus == null) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Status body parameter missing"));
            }
            OrderItem updatedItem = orderService.updateOrderItemStatus(itemId, newStatus, userDetails.getId());
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<?> downloadInvoice(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_SELLER"));
            Order order = orderService.getOrderById(id, userDetails.getId(), isAdmin);
            ByteArrayInputStream pdfStream = invoiceService.generateInvoicePdf(order);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Content-Disposition", "attachment; filename=invoice-DF-" + order.getId() + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(new InputStreamResource(pdfStream));
        } catch (Exception e) {
            return ResponseEntity.status(403).body(new MessageResponse(e.getMessage()));
        }
    }
}
