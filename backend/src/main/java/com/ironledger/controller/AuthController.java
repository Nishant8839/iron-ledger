package com.ironledger.controller;

import com.ironledger.dto.AuthResponse;
import com.ironledger.dto.LoginRequest;
import com.ironledger.dto.SignupRequest;
import com.ironledger.entity.PasswordResetToken;
import com.ironledger.entity.User;
import com.ironledger.repository.PasswordResetTokenRepository;
import com.ironledger.repository.UserRepository;
import com.ironledger.service.EmailService;
import com.ironledger.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // New dependencies for Forgot Password
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);

        String jwtToken = jwtService.generateToken(user);
        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String identifier = request.getUsername() != null ? request.getUsername() : request.getEmail();
        if (identifier == null || identifier.isBlank()) {
            return ResponseEntity.badRequest().body("Username or email is required");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            identifier,
                            request.getPassword()));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        User user = userRepository.findByUsername(identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier).orElseThrow());
        
        String jwtToken = jwtService.generateToken(user);

        return ResponseEntity.ok(AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .build());
    }

    // --- FORGOT PASSWORD ENDPOINTS ---
    @Transactional

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Delete old token if exists and flush immediately to avoid UniqueConstraint exception on insert
            tokenRepository.deleteByUserId(user.getId());
            tokenRepository.flush();

            // Create new token (expires in 15 mins)
            String tokenString = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(tokenString)
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .build();

            tokenRepository.save(resetToken);

            // Send email via Resend API
            try {
                emailService.sendPasswordResetEmail(user.getEmail(), tokenString);
            } catch (Exception e) {
                System.err.println("Failed to send reset email: " + e.getMessage());
                // Still return OK — don't reveal if email failed
            }
        }

        // Always return OK so hackers can't guess which emails exist
        return ResponseEntity.ok("If that email is registered, a password reset link has been sent.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<PasswordResetToken> tokenOptional = tokenRepository.findByToken(token);

        if (tokenOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid token.");
        }

        PasswordResetToken resetToken = tokenOptional.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body("Token expired.");
        }

        // Update password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password successfully reset.");
    }
}
