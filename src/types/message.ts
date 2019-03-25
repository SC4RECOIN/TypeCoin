enum MessageType {
  GET_LATEST = 0,
  GET_ALL = 1,
  RESPONSE = 2,
}
  
interface Message {
  type: MessageType;
  data: any;
}

export { MessageType, Message };
