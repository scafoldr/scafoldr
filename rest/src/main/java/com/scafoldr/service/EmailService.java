package com.scafoldr.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Login Code");
        message.setText(String.format(
                """
                        Your verification code is: %s
                        
                        This code expires in 15 minutes.
                        
                        If you didn't request this, you can safely ignore this email.""",
                code
        ));

        mailSender.send(message);
    }
}
