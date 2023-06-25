package razzle.ai.config;

import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;
import razzle.ai.RazzleConstants;

import java.util.Map;

/**
 * created by julian on 09/02/2023
 */
@Validated
@ConfigurationProperties(prefix = "razzle.ai.config")
public class RazzleConfig {


  @NotEmpty(message = "Razzle Api key is required. Missing razzle.ai.config.api-key")
  private String apiKey;


  @NotEmpty(message = "Razzle App ID is required. Missing razzle.ai.config.app-id")
  private String appId;


  @NotEmpty(message = "Server URL is required. Missing razzle.ai.config.server-url")
  private String serverUrl;


  private boolean requiresAuth;


  public Map<String, String> defaultHeadersMap() {
    return Map.of(
      RazzleConstants.Headers.APP_ID, getAppId(),
      RazzleConstants.Headers.API_KEY, getApiKey()
    );
  }


  public String getApiKey() {
    return apiKey;
  }

  public String getAppId() {
    return appId;
  }

  public String getServerUrl() {
    return serverUrl;
  }

  public boolean isRequiresAuth() {
    return requiresAuth;
  }


}
