package com.photojomo.contact.dto;

import lombok.Data;

@Data
public class ContactRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String message;
}
