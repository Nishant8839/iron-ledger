package com.ironledger.service;

import com.ironledger.dto.ProgressionResultDTO;
import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.LoggedSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressionEngine {

    private final LoggedSetRepository loggedSetRepository;

    /**
     * Calculate estimated 1RM using rep-range-specific formulas.
     * reps == 1 → exact weight
     * reps 2–5 → Brzycki
     * reps 6–10 → Epley
     * reps > 10 → null (unreliable)
     */
    public Double calculateE1RM(double weight, int reps) {
        if (reps == 1) {
            return weight;
        } else if (reps >= 2 && reps <= 5) {
            // Brzycki formula
            return weight * 36.0 / (37.0 - reps);
        } else if (reps >= 6 && reps <= 10) {
            // Epley formula
            return weight * (1.0 + reps / 30.0);
        } else {
            // reps > 10 — unreliable
            return null;
        }
    }

    /**
     * Find the reference e1RM for a session's sets.
     * Priority: topSet with reps<=10, then highest e1RM from any set with reps<=10.
     * Returns null if all sets have reps > 10.
     */
    public Double getSessionReferenceE1RM(List<LoggedSet> sets) {
        // Priority 1: top set with reps <= 10
        LoggedSet topSet = sets.stream()
                .filter(LoggedSet::isTopSet)
                .filter(s -> s.getReps() <= 10)
                .findFirst()
                .orElse(null);

        if (topSet != null) {
            return calculateE1RM(topSet.getWeight(), topSet.getReps());
        }

        // Priority 2: highest e1RM from any set with reps <= 10
        return sets.stream()
                .filter(s -> s.getReps() <= 10)
                .map(s -> calculateE1RM(s.getWeight(), s.getReps()))
                .filter(java.util.Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    /**
     * Analyze progression for a given exercise in the current session.
     */
    public ProgressionResultDTO analyze(Long exerciseId, List<LoggedSet> currentSets, Long currentSessionId) {
        Double currentE1RM = getSessionReferenceE1RM(currentSets);

        // If all sets are volume range (reps > 10), return early
        if (currentE1RM == null) {
            return ProgressionResultDTO.builder()
                    .referenceE1RM(null)
                    .previousE1RM(null)
                    .percentageChange(null)
                    .trendDirection("INSUFFICIENT_DATA")
                    .isVolumeRange(true)
                    .build();
        }

        // Round to 1 decimal
        currentE1RM = Math.round(currentE1RM * 10.0) / 10.0;

        // Find the previous session that has this exercise
        WorkoutSession currentSession = currentSets.get(0).getWorkoutSession();
        List<WorkoutSession> previousSessions = loggedSetRepository.findRecentSessionsForExercise(
                exerciseId,
                currentSession.getDate(),
                currentSession.getUser(),
                PageRequest.of(0, 1));

        if (previousSessions.isEmpty()) {
            return ProgressionResultDTO.builder()
                    .referenceE1RM(currentE1RM)
                    .previousE1RM(null)
                    .percentageChange(null)
                    .trendDirection("INSUFFICIENT_DATA")
                    .isVolumeRange(false)
                    .build();
        }

        // Get sets from the previous session for this exercise
        WorkoutSession prevSession = previousSessions.get(0);
        List<LoggedSet> previousSets = loggedSetRepository.findByExerciseIdAndWorkoutSessionIdOrderBySetOrderAsc(
                exerciseId, prevSession.getId());

        Double previousE1RM = getSessionReferenceE1RM(previousSets);

        if (previousE1RM == null) {
            return ProgressionResultDTO.builder()
                    .referenceE1RM(currentE1RM)
                    .previousE1RM(null)
                    .percentageChange(null)
                    .trendDirection("INSUFFICIENT_DATA")
                    .isVolumeRange(false)
                    .build();
        }

        previousE1RM = Math.round(previousE1RM * 10.0) / 10.0;

        double percentageChange = (currentE1RM - previousE1RM) / previousE1RM * 100.0;
        percentageChange = Math.round(percentageChange * 10.0) / 10.0;

        String trendDirection;
        if (percentageChange > 1.5) {
            trendDirection = "UP";
        } else if (percentageChange < -1.5) {
            trendDirection = "DOWN";
        } else {
            trendDirection = "STABLE";
        }

        return ProgressionResultDTO.builder()
                .referenceE1RM(currentE1RM)
                .previousE1RM(previousE1RM)
                .percentageChange(percentageChange)
                .trendDirection(trendDirection)
                .isVolumeRange(false)
                .build();
    }
}
