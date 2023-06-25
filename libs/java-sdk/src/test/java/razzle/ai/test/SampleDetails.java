package razzle.ai.test;


/**
 * created by julian on 19/02/2023
 */
public class SampleDetails {

  private String name;

  private String url;


  public SampleDetails(String name, String url) {
    this.name = name;
    this.url = url;
  }


  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }
}
