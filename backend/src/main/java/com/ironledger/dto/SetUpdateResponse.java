package com.ironledger.dto;

import com.ironledger.entity.LoggedSet;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SetUpdateResponse {
    private LoggedSet loggedSet;
    private ProgressionAlert alert;
}
