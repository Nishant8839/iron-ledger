package com.ironledger.controller;

import com.ironledger.entity.Exercise;
import com.ironledger.entity.User;
import com.ironledger.repository.ExerciseRepository;
import com.ironledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAllByUserOrUserIsNull(getCurrentUser());
    }

    @PostMapping
    public ResponseEntity<Exercise> createExercise(@RequestBody Exercise exercise) {
        exercise.setUser(getCurrentUser());
        return ResponseEntity.ok(exerciseRepository.save(exercise));
    }
}
