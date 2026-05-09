package com.ironledger.repository;

import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoggedSetRepository extends JpaRepository<LoggedSet, Long> {
    List<LoggedSet> findByExerciseIdAndWorkoutSessionIdOrderBySetOrderAsc(Long exerciseId, Long sessionId);
    List<LoggedSet> findByWorkoutSessionIdOrderBySetOrderAsc(Long sessionId);
    List<LoggedSet> findByWorkoutSessionUser(User user);
    List<LoggedSet> findTop30ByExerciseIdAndWorkoutSessionUserAndIsTopSetTrueOrderByCreatedAtDesc(Long exerciseId, User user);
    List<LoggedSet> findByExerciseIdAndWorkoutSessionUser(Long exerciseId, User user);
    
    // For finding previous session sets for the same exercise
    Optional<LoggedSet> findFirstByExerciseIdAndWorkoutSessionIdNotOrderByCreatedAtDesc(Long exerciseId, Long currentSessionId);
    
    // To get all sets for an exercise in a specific session
    List<LoggedSet> findByExerciseIdAndWorkoutSessionId(Long exerciseId, Long sessionId);
    
    // Find previous session that has this exercise
    Optional<LoggedSet> findFirstByExerciseIdAndWorkoutSessionUserAndCreatedAtLessThanOrderByCreatedAtDesc(Long exerciseId, User user, LocalDateTime currentSetCreatedAt);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT ls.workoutSession FROM LoggedSet ls WHERE ls.exercise.id = :exerciseId AND ls.workoutSession.date <= :date AND ls.workoutSession.user = :user ORDER BY ls.workoutSession.date DESC")
    List<com.ironledger.entity.WorkoutSession> findRecentSessionsForExercise(@org.springframework.data.repository.query.Param("exerciseId") Long exerciseId, @org.springframework.data.repository.query.Param("date") java.time.LocalDate date, @org.springframework.data.repository.query.Param("user") User user, org.springframework.data.domain.Pageable pageable);
}
