package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class ProgressionTimelineEventDTO {
    private LocalDate date;
    private Double weight;
    private Integer reps;
    private Double estimated1Rm;
}
