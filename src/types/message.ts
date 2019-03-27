enum MessageType {
  GET_LATEST = 0,
  GET_ALL = 1,
  NEW_BLOCK = 2,
  RESPONSE = 3,
}
  
interface Message {
  type: MessageType;
  data: any;
}

export { MessageType, Message };
