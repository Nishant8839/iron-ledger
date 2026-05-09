package com.ironledger.controller;

import com.ironledger.entity.Exercise;
import com.ironledger.entity.NextSessionTarget;
import com.ironledger.entity.TargetStatus;
import com.ironledger.entity.User;
import com.ironledger.repository.ExerciseRepository;
import com.ironledger.repository.NextSessionTargetRepository;
import com.ironledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/targets")
@RequiredArgsConstructor
public class TargetController {

    private final NextSessionTargetRepository targetRepository;
    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<NextSessionTarget> createTarget(@RequestBody Map<String, Object> body) {
        Long exerciseId = ((Number) body.get("exerciseId")).longValue();
        Double targetWeight = ((Number) body.get("targetWeight")).doubleValue();
        Integer targetReps = body.get("targetReps") != null ? ((Number) body.get("targetReps")).intValue() : null;
        Long createdFromSessionId = body.get("createdFromSessionId") != null
                ? ((Number) body.get("createdFromSessionId")).longValue() : null;

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new RuntimeException("Exercise not found"));

        // If PENDING target already exists for this exercise, replace it
        Optional<NextSessionTarget> existing = targetRepository.findFirstByExerciseIdAndStatusAndUser(exerciseId, TargetStatus.PENDING, getCurrentUser());
        existing.ifPresent(targetRepository::delete);

        NextSessionTarget target = NextSessionTarget.builder()
                .exercise(exercise)
                .targetWeight(targetWeight)
                .targetReps(targetReps)
                .createdFromSessionId(createdFromSessionId)
                .status(TargetStatus.PENDING)
                .createdDate(LocalDate.now())
                .user(getCurrentUser())
                .build();

        return ResponseEntity.ok(targetRepository.save(target));
    }

    @GetMapping
    public List<NextSessionTarget> getTargets(
            @RequestParam(required = false) Long exerciseId,
            @RequestParam(required = false) String status
    ) {
        if (exerciseId != null && status != null) {
            TargetStatus targetStatus = TargetStatus.valueOf(status.toUpperCase());
            return targetRepository.findByExerciseIdAndStatusAndUser(exerciseId, targetStatus, getCurrentUser());
        } else if (status != null) {
            TargetStatus targetStatus = TargetStatus.valueOf(status.toUpperCase());
            return targetRepository.findByStatusAndUser(targetStatus, getCurrentUser());
        }
        return targetRepository.findByUser(getCurrentUser());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<NextSessionTarget> completeTarget(@PathVariable Long id) {
        NextSessionTarget target = targetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target not found"));
        if (!target.getUser().getId().equals(getCurrentUser().getId())) throw new RuntimeException("Unauthorized");
        target.setStatus(TargetStatus.COMPLETED);
        return ResponseEntity.ok(targetRepository.save(target));
    }

    @PatchMapping("/{id}/skip")
    public ResponseEntity<NextSessionTarget> skipTarget(@PathVariable Long id) {
        NextSessionTarget target = targetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target not found"));
        if (!target.getUser().getId().equals(getCurrentUser().getId())) throw new RuntimeException("Unauthorized");
        target.setStatus(TargetStatus.SKIPPED);
        return ResponseEntity.ok(targetRepository.save(target));
    }
}
