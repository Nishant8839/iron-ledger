package com.ironledger.service;

import com.ironledger.dto.*;
import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.StrengthGrade;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.LoggedSetRepository;
import com.ironledger.repository.WorkoutSessionRepository;
import com.ironledger.repository.ExerciseRepository;
import com.ironledger.entity.Exercise;
import com.ironledger.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SessionQueryService {

    private final WorkoutSessionRepository sessionRepository;
    private final LoggedSetRepository loggedSetRepository;
    private final ExerciseRepository exerciseRepository;
    private final StrengthGradeService strengthGradeService;

    public List<TopSetDTO> getTopSetsByExercise(Long exerciseId, int days, User user) {
        LocalDate since = LocalDate.now().minusDays(days);
        List<LoggedSet> sets = loggedSetRepository.findTop30ByExerciseIdAndWorkoutSessionUserAndIsTopSetTrueOrderByCreatedAtDesc(exerciseId, user);
        
        return sets.stream()
                .filter(s -> s.getWorkoutSession().getDate().isAfter(since) || s.getWorkoutSession().getDate().isEqual(since))
                .map(s -> TopSetDTO.builder()
                        .date(s.getWorkoutSession().getDate())
                        .weight(s.getWeight())
                        .grade(s.getStrengthGrade() != null ? s.getStrengthGrade().name() : "BASELINE")
                        .build())
                .sorted(Comparator.comparing(TopSetDTO::getDate))
                .collect(Collectors.toList());
    }



    public DashboardStatsDTO getDashboardStats(User user) {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        
        List<LoggedSet> allSets = loggedSetRepository.findByWorkoutSessionUser(user);
        Double highestTopSet = allSets.stream()
                .filter(LoggedSet::isTopSet)
                .filter(s -> s.getWorkoutSession() != null && !s.getWorkoutSession().getDate().isBefore(startOfMonth))
                .mapToDouble(LoggedSet::getWeight)
                .max()
                .orElse(0.0);

        List<WorkoutSession> allSessions = sessionRepository.findByUser(user);

        Long totalSessions = (long) allSessions.size();
        
        List<LocalDate> sessionDates = allSessions.stream()
                .map(WorkoutSession::getDate)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int streak = 0;
        LocalDate today = LocalDate.now();
        LocalDate expectedDate = today;

        if (!sessionDates.isEmpty()) {
            LocalDate lastWorkout = sessionDates.get(0);
            if (lastWorkout.isEqual(today)) {
                expectedDate = today;
            } else if (lastWorkout.isEqual(today.minusDays(1))) {
                expectedDate = today.minusDays(1);
            } else {
                expectedDate = null;
            }

            if (expectedDate != null) {
                for (LocalDate date : sessionDates) {
                    if (date.isEqual(expectedDate)) {
                        streak++;
                        expectedDate = expectedDate.minusDays(1);
                    } else {
                        break;
                    }
                }
            }
        }
        
        return DashboardStatsDTO.builder()
                .highestTopSet(highestTopSet)
                .totalSessions(totalSessions)
                .currentStreak(streak)
                .build();
    }

    public List<RecentSessionDTO> getRecentSessions(int limit, User user) {
        List<WorkoutSession> sessions = sessionRepository.findByUser(user).stream()
                .sorted(Comparator.comparing(WorkoutSession::getDate).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        return sessions.stream().map(session -> {
            List<LoggedSet> sets = loggedSetRepository.findByWorkoutSessionIdOrderBySetOrderAsc(session.getId());
            String exercises = sets.stream()
                    .map(s -> s.getExercise().getName())
                    .distinct()
                    .collect(Collectors.joining(", "));
            
            String topGrade = "BASELINE";
            if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.PLATINUM)) topGrade = "PLATINUM";
            else if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.GOLD)) topGrade = "GOLD";
            else if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.SILVER)) topGrade = "SILVER";

            return RecentSessionDTO.builder()
                    .id(session.getId())
                    .date(session.getDate())
                    .exercises(exercises)

                    .topGrade(topGrade)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<SessionWithSetsDTO> getFilteredSessions(String exercise, String from, String to, String topGrade, User user) {
        List<WorkoutSession> sessions = sessionRepository.findByUser(user).stream()
                .sorted(Comparator.comparing(WorkoutSession::getDate).reversed())
                .collect(Collectors.toList());

        if (from != null && !from.isEmpty()) {
            LocalDate fromDate = LocalDate.parse(from);
            sessions = sessions.stream().filter(s -> !s.getDate().isBefore(fromDate)).collect(Collectors.toList());
        }
        if (to != null && !to.isEmpty()) {
            LocalDate toDate = LocalDate.parse(to);
            sessions = sessions.stream().filter(s -> !s.getDate().isAfter(toDate)).collect(Collectors.toList());
        }

        return sessions.stream().map(session -> {
            List<LoggedSet> sets = loggedSetRepository.findByWorkoutSessionIdOrderBySetOrderAsc(session.getId());
            
            // Filter by exercise if provided
            if (exercise != null && !exercise.isEmpty()) {
                boolean hasExercise = sets.stream().anyMatch(s -> s.getExercise().getName().equalsIgnoreCase(exercise));
                if (!hasExercise) return null;
            }

            String sessionTopGrade = "BASELINE";
            if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.PLATINUM)) sessionTopGrade = "PLATINUM";
            else if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.GOLD)) sessionTopGrade = "GOLD";
            else if (sets.stream().anyMatch(s -> s.getStrengthGrade() == StrengthGrade.SILVER)) sessionTopGrade = "SILVER";

            if (topGrade != null && !topGrade.isEmpty() && !topGrade.equalsIgnoreCase("ALL")) {
                if (!sessionTopGrade.equalsIgnoreCase(topGrade)) return null;
            }

            Map<String, List<LoggedSet>> grouped = sets.stream()
                    .collect(Collectors.groupingBy(s -> s.getExercise().getName(), LinkedHashMap::new, Collectors.toList()));

            List<ExerciseBlockDTO> blocks = grouped.entrySet().stream()
                    .map(e -> ExerciseBlockDTO.builder().exerciseName(e.getKey()).sets(e.getValue()).build())
                    .collect(Collectors.toList());

            return SessionWithSetsDTO.builder()
                    .id(session.getId())
                    .date(session.getDate())

                    .sessionNotes(session.getSessionNotes())
                    .topGrade(sessionTopGrade)
                    .exercises(blocks)
                    .build();
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public List<ProgressionTimelineEventDTO> getProgressionTimeline(Long exerciseId, User user) {
        List<LoggedSet> sets = loggedSetRepository.findByExerciseIdAndWorkoutSessionUser(exerciseId, user);
        
        // Group by session to find the best set (highest estimated 1RM) per session
        Map<LocalDate, LoggedSet> bestSetPerSession = new LinkedHashMap<>();
        
        for (LoggedSet set : sets) {
            if (set.getWorkoutSession() == null || set.getWorkoutSession().getDate() == null) continue;
            LocalDate date = set.getWorkoutSession().getDate();
            double e1RM = set.getWeight() * (1.0 + (set.getReps() / 30.0));
            
            bestSetPerSession.compute(date, (k, existing) -> {
                if (existing == null) return set;
                double existingE1RM = existing.getWeight() * (1.0 + (existing.getReps() / 30.0));
                return e1RM > existingE1RM ? set : existing;
            });
        }
        
        return bestSetPerSession.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    LoggedSet set = entry.getValue();
                    double e1RM = set.getWeight() * (1.0 + (set.getReps() / 30.0));
                    return ProgressionTimelineEventDTO.builder()
                            .date(entry.getKey())
                            .weight(set.getWeight())
                            .reps(set.getReps())
                            .estimated1Rm(Math.round(e1RM * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSession(Long sessionId) {
        List<LoggedSet> sets = loggedSetRepository.findByWorkoutSessionIdOrderBySetOrderAsc(sessionId);
        loggedSetRepository.deleteAll(sets);
        sessionRepository.deleteById(sessionId);
    }

    @Transactional
    public void updateSession(Long sessionId, UpdateSessionRequestDTO request) {
        WorkoutSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setDate(request.getDate());
        session.setSessionNotes(request.getSessionNotes());
        sessionRepository.save(session);
        
        // Delete old sets
        List<LoggedSet> oldSets = loggedSetRepository.findByWorkoutSessionIdOrderBySetOrderAsc(sessionId);
        loggedSetRepository.deleteAll(oldSets);
        
        // Insert new sets
        for (UpdateSetRequestDTO setDto : request.getSets()) {
            Exercise exercise;
            if (setDto.getExerciseName() != null && !setDto.getExerciseName().trim().isEmpty()) {
                exercise = exerciseRepository.findByNameIgnoreCaseAndUser(setDto.getExerciseName().trim(), session.getUser())
                        .orElseGet(() -> {
                            Exercise newEx = new Exercise();
                            newEx.setName(setDto.getExerciseName().trim());
                            newEx.setCategory("Custom");
                            newEx.setCustom(true);
                            newEx.setUser(session.getUser());
                            return exerciseRepository.save(newEx);
                        });
            } else {
                exercise = exerciseRepository.findById(setDto.getExerciseId())
                        .orElseThrow(() -> new RuntimeException("Exercise not found"));
            }
                    
            LoggedSet set = LoggedSet.builder()
                    .exercise(exercise)
                    .workoutSession(session)
                    .weight(setDto.getWeight())
                    .reps(setDto.getReps())
                    .rpe(setDto.getRpe())
                    .isTopSet(setDto.isTopSet())
                    .setOrder(setDto.getSetOrder())
                    .build();
                    
            LoggedSet savedSet = loggedSetRepository.save(set);
            StrengthGrade grade = strengthGradeService.calculateGrade(savedSet);
            savedSet.setStrengthGrade(grade);
            loggedSetRepository.save(savedSet);
        }
        

    }
}
