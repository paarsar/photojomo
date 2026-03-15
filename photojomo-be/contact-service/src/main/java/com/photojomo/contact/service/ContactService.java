package com.photojomo.contact.service;

import com.photojomo.contact.dto.ContactRequest;
import com.photojomo.contact.dto.ContactResponse;
import com.photojomo.contact.model.Contact;
import com.photojomo.contact.repository.ContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    @Transactional
    public ContactResponse saveContact(ContactRequest request) {
        log.info("Saving contact for email: {}", request.getEmail());

        Contact contact = Contact.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .message(request.getMessage())
                .build();

        contact = contactRepository.save(contact);

        log.info("Contact saved with id: {}", contact.getId());

        return ContactResponse.builder()
                .id(contact.getId())
                .message("Contact information saved successfully.")
                .success(true)
                .build();
    }
}
