package com.ironledger.controller;

import com.ironledger.dto.LoggedSetRequest;
import com.ironledger.dto.ProgressionAlertDTO;
import com.ironledger.dto.ProgressionResultDTO;
import com.ironledger.dto.SetResponseDTO;
import com.ironledger.entity.Exercise;
import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.StrengthGrade;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.entity.User;
import com.ironledger.repository.ExerciseRepository;
import com.ironledger.repository.LoggedSetRepository;
import com.ironledger.repository.WorkoutSessionRepository;
import com.ironledger.repository.UserRepository;
import com.ironledger.service.ProgressionAlertService;
import com.ironledger.service.ProgressionEngine;
import com.ironledger.service.StrengthGradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sets")
@RequiredArgsConstructor
public class SetController {

    private final LoggedSetRepository loggedSetRepository;
    private final ExerciseRepository exerciseRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final StrengthGradeService strengthGradeService;
    private final ProgressionAlertService progressionAlertService;
    private final ProgressionEngine progressionEngine;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping("/session/{sessionId}")
    public List<LoggedSet> getSetsBySession(@PathVariable Long sessionId) {
        WorkoutSession session = workoutSessionRepository.findById(sessionId).orElseThrow();
        if (!session.getUser().getId().equals(getCurrentUser().getId())) throw new RuntimeException("Unauthorized");
        return loggedSetRepository.findByWorkoutSessionIdOrderBySetOrderAsc(sessionId);
    }

    @PostMapping
    public ResponseEntity<SetResponseDTO> logSet(@Valid @RequestBody LoggedSetRequest request) {
        Exercise exercise = resolveExercise(request.getExerciseName(), request.getExerciseId(), getCurrentUser());
        WorkoutSession session = workoutSessionRepository.findById(request.getSessionId()).orElseThrow();
        if (!session.getUser().getId().equals(getCurrentUser().getId())) throw new RuntimeException("Unauthorized");

        LoggedSet set = LoggedSet.builder()
                .exercise(exercise)
                .workoutSession(session)
                .weight(request.getWeight())
                .reps(request.getReps())
                .rpe(request.getRpe())
                .isTopSet(request.isTopSet())
                .rir(request.getRir())
                .setNote(request.getSetNote())
                .setOrder(request.getSetOrder())
                .build();

        LoggedSet savedSet = loggedSetRepository.save(set);

        StrengthGrade grade = strengthGradeService.calculateGrade(savedSet);
        savedSet.setStrengthGrade(grade);
        savedSet = loggedSetRepository.save(savedSet);

        Optional<ProgressionAlertDTO> alert = progressionAlertService.checkProgression(savedSet);

        // Run ProgressionEngine analysis
        List<LoggedSet> sessionSetsForExercise = loggedSetRepository
                .findByExerciseIdAndWorkoutSessionIdOrderBySetOrderAsc(exercise.getId(), session.getId());
        ProgressionResultDTO progressionResult = progressionEngine.analyze(
                exercise.getId(), sessionSetsForExercise, session.getId());

        SetResponseDTO response = SetResponseDTO.builder()
                .loggedSet(savedSet)
                .strengthGrade(grade.name())
                .progressionAlert(alert.orElse(null))
                .progressionResult(progressionResult)
                .build();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{setId}")
    public ResponseEntity<SetResponseDTO> updateSet(@PathVariable Long setId,
                                                     @Valid @RequestBody LoggedSetRequest request) {
        LoggedSet existing = loggedSetRepository.findById(setId)
                .orElseThrow(() -> new RuntimeException("Set not found"));
        if (!existing.getWorkoutSession().getUser().getId().equals(getCurrentUser().getId())) throw new RuntimeException("Unauthorized");

        // Update fields
        if (request.getExerciseName() != null || request.getExerciseId() != null) {
            Exercise exercise = resolveExercise(request.getExerciseName(), request.getExerciseId(), getCurrentUser());
            existing.setExercise(exercise);
        }
        existing.setWeight(request.getWeight());
        existing.setReps(request.getReps());
        existing.setRpe(request.getRpe());
        existing.setTopSet(request.isTopSet());
        existing.setRir(request.getRir());
        existing.setSetNote(request.getSetNote());
        if (request.getSetOrder() != null) {
            existing.setSetOrder(request.getSetOrder());
        }

        // Recalculate grade
        StrengthGrade grade = strengthGradeService.calculateGrade(existing);
        existing.setStrengthGrade(grade);
        LoggedSet savedSet = loggedSetRepository.save(existing);

        Optional<ProgressionAlertDTO> alert = progressionAlertService.checkProgression(savedSet);

        // Run ProgressionEngine analysis
        Long exerciseId = savedSet.getExercise().getId();
        Long sessionId = savedSet.getWorkoutSession().getId();
        List<LoggedSet> sessionSetsForExercise = loggedSetRepository
                .findByExerciseIdAndWorkoutSessionIdOrderBySetOrderAsc(exerciseId, sessionId);
        ProgressionResultDTO progressionResult = progressionEngine.analyze(
                exerciseId, sessionSetsForExercise, sessionId);

        SetResponseDTO response = SetResponseDTO.builder()
                .loggedSet(savedSet)
                .strengthGrade(grade.name())
                .progressionAlert(alert.orElse(null))
                .progressionResult(progressionResult)
                .build();

        return ResponseEntity.ok(response);
    }

    private Exercise resolveExercise(String exerciseName, Long exerciseId, User user) {
        if (exerciseName != null && !exerciseName.trim().isEmpty()) {
            return exerciseRepository.findByNameIgnoreCaseAndUser(exerciseName.trim(), user)
                    .orElseGet(() -> {
                        Exercise newEx = new Exercise();
                        newEx.setName(exerciseName.trim());
                        newEx.setCategory("Custom");
                        newEx.setCustom(true);
                        newEx.setUser(user);
                        return exerciseRepository.save(newEx);
                    });
        } else {
            return exerciseRepository.findById(exerciseId).orElseThrow();
        }
    }
}
