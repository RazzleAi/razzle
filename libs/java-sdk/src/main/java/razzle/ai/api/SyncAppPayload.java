package razzle.ai.api;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import razzle.ai.ActionHandler;

import java.util.List;

/**
 * created by julian on 09/02/2023
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyncAppPayload {


    private String sdkVersion;


    private boolean requiresAuth;


    private List<ActionHandler> actions;


}
