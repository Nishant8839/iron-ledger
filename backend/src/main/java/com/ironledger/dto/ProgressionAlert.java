package com.ironledger.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProgressionAlert {
    private String message;
    private String exercise;
    private Double currentWeight;
}
