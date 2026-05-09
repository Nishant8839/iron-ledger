package com.ironledger.service;

import com.ironledger.dto.ProgressionAlertDTO;
import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.LoggedSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProgressionAlertService {

    private final LoggedSetRepository loggedSetRepository;

    public Optional<ProgressionAlertDTO> checkProgression(LoggedSet currentSet) {
        if (currentSet.getWorkoutSession() == null || currentSet.getWorkoutSession().getDate() == null) {
            return Optional.empty();
        }


        
        // Actually, finding the last 2 sessions:
        List<WorkoutSession> recentSessions = loggedSetRepository.findRecentSessionsForExercise(
                currentSet.getExercise().getId(),
                currentSet.getWorkoutSession().getDate().plusDays(1), 
                currentSet.getWorkoutSession().getUser(),
                PageRequest.of(0, 2)
        );

        if (recentSessions.size() < 2) {
            return Optional.empty();
        }

        LoggedSet topSet1 = getTopOrHeaviestSet(currentSet.getExercise().getId(), recentSessions.get(0).getId());
        LoggedSet topSet2 = getTopOrHeaviestSet(currentSet.getExercise().getId(), recentSessions.get(1).getId());

        if (topSet1 != null && topSet2 != null) {
            boolean repsAre8 = (topSet1.getReps() != null && topSet1.getReps() >= 8) &&
                               (topSet2.getReps() != null && topSet2.getReps() >= 8);
            boolean sameWeight = topSet1.getWeight().equals(topSet2.getWeight());

            if (repsAre8 && sameWeight) {
                return Optional.of(ProgressionAlertDTO.builder()
                        .exerciseName(currentSet.getExercise().getName())
                        .currentWeight(topSet1.getWeight())
                        .suggestedWeightKg(topSet1.getWeight() + 2.5)
                        .suggestedWeightLbs(topSet1.getWeight() + 5.0)
                        .message("Strength Threshold Met. Increase load next session.")
                        .build());
            }
        }

        return Optional.empty();
    }

    private LoggedSet getTopOrHeaviestSet(Long exerciseId, Long sessionId) {
        List<LoggedSet> sets = loggedSetRepository.findByExerciseIdAndWorkoutSessionId(exerciseId, sessionId);
        return sets.stream()
                .filter(LoggedSet::isTopSet)
                .findFirst()
                .orElse(sets.stream()
                        .max((s1, s2) -> Double.compare(s1.getWeight(), s2.getWeight()))
                        .orElse(null));
    }
}
