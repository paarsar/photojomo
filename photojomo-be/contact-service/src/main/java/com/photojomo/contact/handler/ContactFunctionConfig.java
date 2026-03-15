package com.photojomo.contact.handler;

import com.photojomo.contact.dto.ContactRequest;
import com.photojomo.contact.dto.ContactResponse;
import com.photojomo.contact.service.ContactService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.function.Function;

@Configuration
public class ContactFunctionConfig {

    @Bean
    public Function<ContactRequest, ContactResponse> saveContact(ContactService contactService) {
        return contactService::saveContact;
    }
}
