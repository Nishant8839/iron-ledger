package com.ironledger.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class EmailService {
    private final JavaMailSender mailSender;

    public void sendpasswordResetEmail(String to, String token) {
        String resetUrl = "https://iron-ledger-nishant.vercel.app?reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("iron ledger - password Reset Request");
        message.setText(
                "To reset your password, click the link below:\n" +
                        resetUrl + "\n\n" +
                        "If you did not request this, please ignore this email.");

        mailSender.send(message);
    }
}
