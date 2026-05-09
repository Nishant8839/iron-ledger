package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressionAlertDTO {
    private String exerciseName;
    private Double currentWeight;
    private Double suggestedWeightKg;
    private Double suggestedWeightLbs;
    private String message;
}
