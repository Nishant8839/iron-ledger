package com.ironledger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSetRequestDTO {
    private Long exerciseId;
    
    private String exerciseName;
    
    @NotNull
    @Min(0)
    private Double weight;
    
    @NotNull
    @Min(1)
    private Integer reps;
    
    @NotNull
    @Min(1)
    private Integer rpe;
    
    private boolean isTopSet;
    
    private Integer rir;
    
    private String setNote;
    
    @NotNull
    private Integer setOrder;
}
