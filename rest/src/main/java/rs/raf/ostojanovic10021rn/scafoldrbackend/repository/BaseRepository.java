package rs.raf.ostojanovic10021rn.scafoldrbackend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import rs.raf.ostojanovic10021rn.scafoldrbackend.model.BaseModel;

@NoRepositoryBean
public interface BaseRepository<T extends BaseModel, ID> extends JpaRepository<T, ID> {}

