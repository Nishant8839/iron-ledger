package com.ironledger.repository;

import com.ironledger.entity.Exercise;
import com.ironledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    @Query("SELECT e FROM Exercise e WHERE LOWER(e.name) = LOWER(:name) AND (e.user = :user OR e.user IS NULL)")
    Optional<Exercise> findByNameIgnoreCaseAndUser(@Param("name") String name, @Param("user") User user);
    
    @Query("SELECT e FROM Exercise e WHERE e.user = :user OR e.user IS NULL")
    List<Exercise> findAllByUserOrUserIsNull(@Param("user") User user);
}
