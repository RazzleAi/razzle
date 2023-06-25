package razzle.ai.api;

import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
public record CallDetails(
  String userId,
  String accountId,
  Map<String, ?> context
) {


}

