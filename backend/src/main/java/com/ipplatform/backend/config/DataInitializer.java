package com.ipplatform.backend.config;

import com.ipplatform.backend.model.Admin;
import com.ipplatform.backend.repository.AdminRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (adminRepository.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin(
                        "admin",
                        passwordEncoder.encode("admin@123"),
                        "admin@ip-platform.com",
                        "System Administrator"
                );
                adminRepository.save(admin);
                System.out.println("✅ Default Admin account seeded: admin / admin@123");
            }
        };
    }
}
