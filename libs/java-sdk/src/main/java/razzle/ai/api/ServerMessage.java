package razzle.ai.api;

/**
 * created by julian on 09/02/2023
 */
public class ServerMessage<T> {


  private ServerMessageType event;


  private ServerMessageData<T> data;


  public ServerMessageType getEvent() {
    return event;
  }

  public void setEvent(ServerMessageType event) {
    this.event = event;
  }

  public ServerMessageData<T> getData() {
    return data;
  }

  public void setData(ServerMessageData<T> data) {
    this.data = data;
  }


}
