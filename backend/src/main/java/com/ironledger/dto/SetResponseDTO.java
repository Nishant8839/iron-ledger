package com.ironledger.dto;

import com.ironledger.entity.LoggedSet;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SetResponseDTO {
    private LoggedSet loggedSet;
    private String strengthGrade;
    private ProgressionAlertDTO progressionAlert;
    private ProgressionResultDTO progressionResult;
}
