package com.ironledger.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SetLogRequest {
    @NotNull
    private Long exerciseId;

    @NotNull
    private Long sessionId;

    @NotNull
    @Min(0)
    private Double weight;

    @NotNull
    @Min(3)
    @Max(8)
    private Integer reps;

    @NotNull
    @Min(1)
    @Max(10)
    private Integer rpe;

    private boolean isTopSet;

    private Integer rir;

    private String setNote;

    private Integer setOrder;
}
