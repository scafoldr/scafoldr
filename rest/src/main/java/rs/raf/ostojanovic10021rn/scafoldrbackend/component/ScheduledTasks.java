package rs.raf.ostojanovic10021rn.scafoldrbackend.component;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import rs.raf.ostojanovic10021rn.scafoldrbackend.service.UserService;

@Component
@RequiredArgsConstructor
public class ScheduledTasks {

    private final UserService userService;

    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredCodes() {
        userService.cleanupExpiredCodes();
    }
}
