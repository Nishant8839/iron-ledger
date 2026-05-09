package com.ironledger.repository;

import com.ironledger.entity.NextSessionTarget;
import com.ironledger.entity.TargetStatus;
import com.ironledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NextSessionTargetRepository extends JpaRepository<NextSessionTarget, Long> {
    List<NextSessionTarget> findByExerciseIdAndStatusAndUser(Long exerciseId, TargetStatus status, User user);
    Optional<NextSessionTarget> findFirstByExerciseIdAndStatusAndUser(Long exerciseId, TargetStatus status, User user);
    List<NextSessionTarget> findByStatusAndUser(TargetStatus status, User user);
    List<NextSessionTarget> findByUser(User user);
}
