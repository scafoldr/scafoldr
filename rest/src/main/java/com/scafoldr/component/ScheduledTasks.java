package com.scafoldr.component;

import com.scafoldr.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final AuthService authService;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredCodes() {
        authService.cleanupExpiredCodes();
    }
}
