package rs.raf.ostojanovic10021rn.scafoldrbackend;

import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;
import rs.raf.ostojanovic10021rn.scafoldrbackend.repository.UserRepository;

import java.util.List;

@Component
@AllArgsConstructor
public class BootstrapData implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {

        if(userRepository.findAll().isEmpty()) {
            User user1 = new User();
            user1.setEmail("ogisa@ogisa.com");

            User user2 = new User();
            user2.setEmail("gliba@gliba.com");

            User user3 = new User();
            user3.setEmail("janko@janko.com");

            userRepository.saveAll(List.of(user1, user2, user3));
        }
    }
}
