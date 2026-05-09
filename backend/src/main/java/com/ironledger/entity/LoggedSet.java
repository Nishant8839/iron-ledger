package com.ironledger.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "logged_sets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoggedSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id")
    private WorkoutSession workoutSession;

    @Column(nullable = false)
    private Double weight; // in kg

    @Column(nullable = false)
    private Integer reps;

    @Column(nullable = false)
    private Integer rpe;

    private boolean isTopSet;

    private Integer rir;

    @Column(columnDefinition="TEXT")
    private String setNote;

    @Enumerated(EnumType.STRING)
    private StrengthGrade strengthGrade;

    @Column(nullable = false)
    private Integer setOrder;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
