package com.ironledger.dto;

import com.ironledger.entity.LoggedSet;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ExerciseBlockDTO {
    private String exerciseName;
    private List<LoggedSet> sets;
}
