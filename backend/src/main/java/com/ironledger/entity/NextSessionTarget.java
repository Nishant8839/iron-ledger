package com.ironledger.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "next_session_targets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NextSessionTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(nullable = false)
    private Double targetWeight;

    private Integer targetReps;

    private Long createdFromSessionId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetStatus status;

    @Column(nullable = false)
    private LocalDate createdDate;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
