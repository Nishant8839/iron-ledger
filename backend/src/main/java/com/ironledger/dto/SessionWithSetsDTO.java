package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class SessionWithSetsDTO {
    private Long id;
    private LocalDate date;
    private String sessionNotes;
    private String sessionNote;
    private String topGrade;
    private List<ExerciseBlockDTO> exercises;
}
