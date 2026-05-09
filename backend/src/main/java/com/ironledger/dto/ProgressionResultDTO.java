package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressionResultDTO {
    private Double referenceE1RM;
    private Double previousE1RM;
    private Double percentageChange;
    private String trendDirection;
    private Boolean isVolumeRange;
}
