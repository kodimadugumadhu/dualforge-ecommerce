package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.AddressRequest;
import com.enterprise.ecommerce.model.Address;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getAddressesByUser(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional
    public Address addAddress(AddressRequest req, User user) {
        Address address = new Address(
                user,
                req.getStreet(),
                req.getCity(),
                req.getState(),
                req.getPostalCode()
        );
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(Long addressId, Long userId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot delete this address.");
        }

        addressRepository.delete(address);
    }
}
