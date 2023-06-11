package razzle.ai.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CallDetails {


    private String userId;


    private String accountId;


    private String workspaceId;


    private Map<String, ?> context;


}

