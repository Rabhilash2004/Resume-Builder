/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.example.resumebuilder.controller;

/**
 *
 * @author abhil
 */
import com.example.resumebuilder.model.User;
import com.example.resumebuilder.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthContoller {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthContoller(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public static class AuthRequest {
        public String name;
        public String email;
        public String password;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (request.name == null || request.name.isBlank()
                || request.email == null || request.email.isBlank()
                || request.password == null || request.password.isBlank()) {
            return ResponseEntity.badRequest().body("All fields are required");
        }

        if (userRepository.findByEmail(request.email.trim().toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email already exists");
        }

        User user = new User();
        user.setName(request.name.trim());
        user.setEmail(request.email.trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password));

        User saved = userRepository.save(user);

        Map<String, Object> res = new HashMap<>();
        res.put("id", saved.getId());
        res.put("name", saved.getName());
        res.put("email", saved.getEmail());

        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.email == null || request.password == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        User user = userRepository.findByEmail(request.email.trim().toLowerCase()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.password, user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password");
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", user.getId());
        res.put("name", user.getName());
        res.put("email", user.getEmail());

        return ResponseEntity.ok(res);
    }
}