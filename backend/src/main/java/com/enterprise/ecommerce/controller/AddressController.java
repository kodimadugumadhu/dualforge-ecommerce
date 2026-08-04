package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.dto.AddressRequest;
import com.enterprise.ecommerce.model.Address;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.UserRepository;
import com.enterprise.ecommerce.security.UserDetailsImpl;
import com.enterprise.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<Address> getMyAddresses(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return addressService.getAddressesByUser(userDetails.getId());
    }

    @PostMapping
    public ResponseEntity<?> addAddress(@Valid @RequestBody AddressRequest req,
                                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(addressService.addAddress(req, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            addressService.deleteAddress(id, userDetails.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }
}
