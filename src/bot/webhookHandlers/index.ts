import { WebhookEvents } from "constants/WebhookEvents";
import { WebhookHandler } from "./WebhookHandler";

export const WebhookHandlers = {
  [WebhookEvents.chat_join_request]: (handler: WebhookHandler) => handler.handleChatJoinRequest(),
  [WebhookEvents.chat_member]: (handler: WebhookHandler) => handler.handleChatMember(),
  [WebhookEvents.my_chat_member]: (handler: WebhookHandler) => handler.handleMyChatMember(),
}