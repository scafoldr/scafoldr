package rs.raf.ostojanovic10021rn.scafoldrbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends BaseRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
