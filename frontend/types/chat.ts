export interface ChatMessage {
  id: string;
  challenge_id: string;
  user_id: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    username: string;
    avatar: string;
  };
  expand?: ChatMessage["sender"];
}
