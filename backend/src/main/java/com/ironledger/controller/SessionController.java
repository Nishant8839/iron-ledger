package com.ironledger.controller;

import com.ironledger.dto.*;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.entity.User;
import com.ironledger.repository.WorkoutSessionRepository;
import com.ironledger.repository.UserRepository;
import com.ironledger.service.SessionQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final WorkoutSessionRepository sessionRepository;
    private final SessionQueryService sessionQueryService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public List<SessionWithSetsDTO> getSessions(
            @RequestParam(required = false) String exercise,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String topGrade
    ) {
        return sessionQueryService.getFilteredSessions(exercise, from, to, topGrade, getCurrentUser());
    }

    @PostMapping
    public ResponseEntity<WorkoutSession> createSession(@RequestBody WorkoutSession session) {
        session.setUser(getCurrentUser());
        return ResponseEntity.ok(sessionRepository.save(session));
    }

    @GetMapping("/top-sets")
    public List<TopSetDTO> getTopSetsByExercise(
            @RequestParam Long exerciseId,
            @RequestParam(defaultValue = "30") int days
    ) {
        return sessionQueryService.getTopSetsByExercise(exerciseId, days, getCurrentUser());
    }

    @GetMapping("/stats")
    public DashboardStatsDTO getDashboardStats() {
        return sessionQueryService.getDashboardStats(getCurrentUser());
    }

    @GetMapping("/recent")
    public List<RecentSessionDTO> getRecentSessions(@RequestParam(defaultValue = "5") int limit) {
        return sessionQueryService.getRecentSessions(limit, getCurrentUser());
    }

    @GetMapping("/progression-timeline")
    public List<ProgressionTimelineEventDTO> getProgressionTimeline(@RequestParam Long exerciseId) {
        return sessionQueryService.getProgressionTimeline(exerciseId, getCurrentUser());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionQueryService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateSession(@PathVariable Long id, @RequestBody UpdateSessionRequestDTO request) {
        sessionQueryService.updateSession(id, request);
        return ResponseEntity.noContent().build();
    }
}

