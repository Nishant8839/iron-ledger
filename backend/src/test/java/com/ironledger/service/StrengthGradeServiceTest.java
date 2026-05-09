package com.ironledger.service;

import com.ironledger.entity.Exercise;
import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.StrengthGrade;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.LoggedSetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StrengthGradeServiceTest {

    @Mock
    private LoggedSetRepository loggedSetRepository;

    @InjectMocks
    private StrengthGradeService strengthGradeService;

    private Exercise exercise;
    private WorkoutSession currentSession;
    private WorkoutSession previousSession;

    @BeforeEach
    void setUp() {
        exercise = Exercise.builder().id(1L).name("Squat").build();
        currentSession = WorkoutSession.builder().id(2L).date(LocalDate.of(2023, 10, 10)).build();
        previousSession = WorkoutSession.builder().id(1L).date(LocalDate.of(2023, 10, 5)).build();
    }

    @Test
    void testPlatinumGrade() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(8).rpe(8)
                .build();

        LoggedSet previousFiveRep = LoggedSet.builder()
                .weight(100.0).reps(5).rpe(8).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate()), any(), any(PageRequest.class)))
                .thenReturn(List.of(previousSession));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousFiveRep));

        StrengthGrade grade = strengthGradeService.calculateGrade(currentSet);

        assertEquals(StrengthGrade.PLATINUM, grade);
    }

    @Test
    void testGoldGrade() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(6).rpe(8)
                .build();

        LoggedSet previousSet = LoggedSet.builder()
                .weight(100.0).reps(4).rpe(8).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate()), any(), any(PageRequest.class)))
                .thenReturn(List.of(previousSession));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousSet));

        StrengthGrade grade = strengthGradeService.calculateGrade(currentSet);

        assertEquals(StrengthGrade.GOLD, grade);
    }

    @Test
    void testSilverGrade() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(5).rpe(7)
                .build();

        LoggedSet previousSet = LoggedSet.builder()
                .weight(100.0).reps(5).rpe(9).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate()), any(), any(PageRequest.class)))
                .thenReturn(List.of(previousSession));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousSet));

        StrengthGrade grade = strengthGradeService.calculateGrade(currentSet);

        assertEquals(StrengthGrade.SILVER, grade);
    }

    @Test
    void testBaselineGrade() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(4).rpe(8)
                .build();

        LoggedSet previousSet = LoggedSet.builder()
                .weight(100.0).reps(5).rpe(8).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate()), any(), any(PageRequest.class)))
                .thenReturn(List.of(previousSession));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousSet));

        StrengthGrade grade = strengthGradeService.calculateGrade(currentSet);

        assertEquals(StrengthGrade.BASELINE, grade);
    }

    @Test
    void testNoPriorSession_ReturnsBaseline() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(5).rpe(8)
                .build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate()), any(), any(PageRequest.class)))
                .thenReturn(Collections.emptyList());

        StrengthGrade grade = strengthGradeService.calculateGrade(currentSet);

        assertEquals(StrengthGrade.BASELINE, grade);
    }
}
