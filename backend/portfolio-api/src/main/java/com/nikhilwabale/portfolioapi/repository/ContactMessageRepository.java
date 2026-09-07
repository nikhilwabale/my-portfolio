package com.nikhilwabale.portfolioapi.repository;

import com.nikhilwabale.portfolioapi.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Integer> {
}
