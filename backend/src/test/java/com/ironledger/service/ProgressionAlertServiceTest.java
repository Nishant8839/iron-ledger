package com.ironledger.service;

import com.ironledger.dto.ProgressionAlertDTO;
import com.ironledger.entity.Exercise;
import com.ironledger.entity.LoggedSet;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProgressionAlertServiceTest {

    @Mock
    private LoggedSetRepository loggedSetRepository;

    @InjectMocks
    private ProgressionAlertService progressionAlertService;

    private Exercise exercise;
    private WorkoutSession currentSession;
    private WorkoutSession previousSession;

    @BeforeEach
    void setUp() {
        exercise = Exercise.builder().id(1L).name("Bench Press").build();
        currentSession = WorkoutSession.builder().id(2L).date(LocalDate.of(2023, 10, 10)).build();
        previousSession = WorkoutSession.builder().id(1L).date(LocalDate.of(2023, 10, 5)).build();
    }

    @Test
    void testTriggersAlert() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(8).rpe(8).isTopSet(true).build();

        LoggedSet previousTopSet = LoggedSet.builder()
                .weight(100.0).reps(8).rpe(9).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate().plusDays(1)), any(), any(PageRequest.class)))
                .thenReturn(List.of(currentSession, previousSession));

        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 2L))
                .thenReturn(List.of(currentSet));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousTopSet));

        Optional<ProgressionAlertDTO> result = progressionAlertService.checkProgression(currentSet);

        assertTrue(result.isPresent());
        assertEquals(100.0, result.get().getCurrentWeight());
        assertEquals(102.5, result.get().getSuggestedWeightKg());
        assertEquals(105.0, result.get().getSuggestedWeightLbs());
        assertEquals("Bench Press", result.get().getExerciseName());
    }

    @Test
    void testNoAlertWhenRepsLessThan8() {
        LoggedSet currentSet = LoggedSet.builder()
                .exercise(exercise).workoutSession(currentSession)
                .weight(100.0).reps(7).rpe(8).isTopSet(true).build();

        LoggedSet previousTopSet = LoggedSet.builder()
                .weight(100.0).reps(8).rpe(9).isTopSet(true).build();

        when(loggedSetRepository.findRecentSessionsForExercise(eq(1L), eq(currentSession.getDate().plusDays(1)), any(), any(PageRequest.class)))
                .thenReturn(List.of(currentSession, previousSession));

        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 2L))
                .thenReturn(List.of(currentSet));
        when(loggedSetRepository.findByExerciseIdAndWorkoutSessionId(1L, 1L))
                .thenReturn(List.of(previousTopSet));

        Optional<ProgressionAlertDTO> result = progressionAlertService.checkProgression(currentSet);

        assertFalse(result.isPresent());
    }
}
