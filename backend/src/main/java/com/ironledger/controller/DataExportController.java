package com.ironledger.controller;

import com.ironledger.entity.LoggedSet;
import com.ironledger.entity.User;
import com.ironledger.repository.LoggedSetRepository;
import com.ironledger.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class DataExportController {

    private final LoggedSetRepository loggedSetRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow();
    }

    @GetMapping("/csv")
    public ResponseEntity<String> exportCsv() {
        List<LoggedSet> sets = loggedSetRepository.findByWorkoutSessionUser(getCurrentUser());
        // Since we want ordered by date, we can sort them
        sets.sort((a, b) -> a.getWorkoutSession().getDate().compareTo(b.getWorkoutSession().getDate()));

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Date,Exercise,Weight,Reps,RPE,Grade,TopSet\n");

        for (LoggedSet set : sets) {
            String date = set.getWorkoutSession() != null ? set.getWorkoutSession().getDate().toString() : "";
            String exercise = set.getExercise() != null ? set.getExercise().getName() : "";
            String weight = String.valueOf(set.getWeight());
            String reps = String.valueOf(set.getReps());
            String rpe = String.valueOf(set.getRpe());
            String grade = set.getStrengthGrade() != null ? set.getStrengthGrade().name() : "";
            String topSet = String.valueOf(set.isTopSet());

            // Escape quotes in exercise name if necessary
            if (exercise.contains(",")) {
                exercise = "\"" + exercise + "\"";
            }

            csvBuilder.append(String.join(",", date, exercise, weight, reps, rpe, grade, topSet))
                      .append("\n");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=iron_ledger_export.csv");
        headers.add(HttpHeaders.CONTENT_TYPE, "text/csv");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBuilder.toString());
    }
}
