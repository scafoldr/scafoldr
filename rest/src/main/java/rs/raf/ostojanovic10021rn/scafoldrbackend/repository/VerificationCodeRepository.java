package rs.raf.ostojanovic10021rn.scafoldrbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.User;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.VerificationCode;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends BaseRepository<VerificationCode, Long> {

    @Query("SELECT v FROM VerificationCode v WHERE v.user = :user " +
            "AND v.used = false AND v.expiresAt > :now ORDER BY v.createdAt DESC")
    Optional<VerificationCode> findActiveCodeForUser(User user, LocalDateTime now);

    @Modifying
    @Query("UPDATE VerificationCode v SET v.used = true WHERE v.user = :user AND v.used = false")
    void invalidateCodesForUser(User user);

    @Query("SELECT COUNT(v) FROM VerificationCode v WHERE v.user = :user " +
            "AND v.createdAt > :since")
    long countRecentCodesForUser(User user, LocalDateTime since);

    @Modifying
    @Query("DELETE FROM VerificationCode v WHERE v.expiresAt < :now")
    void deleteExpiredCodes(LocalDateTime now);
}
