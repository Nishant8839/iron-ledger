package com.ironledger.service;

import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.StrengthGrade;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.LoggedSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StrengthGradeService {

    private final LoggedSetRepository loggedSetRepository;

    public StrengthGrade calculateGrade(LoggedSet currentSet) {
        if (currentSet.getWorkoutSession() == null || currentSet.getWorkoutSession().getDate() == null) {
            return StrengthGrade.BASELINE;
        }

        List<WorkoutSession> recentSessions = loggedSetRepository.findRecentSessionsForExercise(
                currentSet.getExercise().getId(),
                currentSet.getWorkoutSession().getDate(),
                currentSet.getWorkoutSession().getUser(),
                PageRequest.of(0, 2)
        );

        if (recentSessions.isEmpty()) {
            return StrengthGrade.BASELINE;
        }

        // The most recent session prior to current date
        WorkoutSession previousSession = recentSessions.get(0);
        List<LoggedSet> previousSets = loggedSetRepository.findByExerciseIdAndWorkoutSessionId(
                currentSet.getExercise().getId(),
                previousSession.getId()
        );

        Optional<LoggedSet> previousFiveRepSet = previousSets.stream()
                .filter(set -> set.getReps() != null && set.getReps() == 5)
                .findFirst();

        Double currentWeight = currentSet.getWeight();
        Integer currentReps = currentSet.getReps();

        // If a 5-rep set exists in the previous session
        if (previousFiveRepSet.isPresent()) {
            Double previousFiveRepWeight = previousFiveRepSet.get().getWeight();
            if (currentReps >= 8 && currentWeight.equals(previousFiveRepWeight)) {
                return StrengthGrade.PLATINUM;
            }
        }

        // For GOLD and SILVER, we need the "previousSet". The prompt doesn't specify WHICH previous set to compare against if there are multiple. 
        // We will compare against the heaviest set from the previous session, or just the top set.
        // Let's find the "best" previous set, or just use the same 5-rep set if we want. The prompt says: "ELSE IF currentSet.weight == previousSet.weight...".
        // Let's define previousSet as the Top Set or the heaviest set of that previous session.
        LoggedSet previousSet = previousSets.stream()
                .filter(LoggedSet::isTopSet)
                .findFirst()
                .orElse(previousSets.stream()
                        .max((s1, s2) -> Double.compare(s1.getWeight(), s2.getWeight()))
                        .orElse(null));

        if (previousSet != null) {
            Double prevWeight = previousSet.getWeight();
            Integer prevReps = previousSet.getReps();

            if (currentWeight.equals(prevWeight) && currentReps > prevReps) {
                return StrengthGrade.GOLD;
            }
        }

        return StrengthGrade.BASELINE;
    }
}
