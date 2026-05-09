package com.ironledger.seeder;

import com.ironledger.entity.Exercise;
import com.ironledger.entity.WorkoutSession;
import com.ironledger.repository.ExerciseRepository;
import com.ironledger.repository.WorkoutSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Profile("!test")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (exerciseRepository.count() == 0) {
            exerciseRepository.save(Exercise.builder()
                    .name("Squat")
                    .category("Compound")
                    .isCustom(false)
                    .notes("High bar, ATG")
                    .build());

            exerciseRepository.save(Exercise.builder()
                    .name("Bench Press")
                    .category("Compound")
                    .isCustom(false)
                    .notes("Paused, comp grip")
                    .build());

            exerciseRepository.save(Exercise.builder()
                    .name("Deadlift")
                    .category("Compound")
                    .isCustom(false)
                    .notes("Conventional, hook grip")
                    .build());
                    
            exerciseRepository.save(Exercise.builder()
                    .name("Zercher Squat")
                    .category("Specialty")
                    .isCustom(true)
                    .notes("Use fat bar")
                    .build());
        }

        if (workoutSessionRepository.count() == 0) {
            workoutSessionRepository.save(WorkoutSession.builder()
                    .date(LocalDate.now())
                    .sessionNotes("Leg Day")
                    .build());
        }
    }
}
