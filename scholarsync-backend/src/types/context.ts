// GraphQL Context Type Definition

export interface Context {
  userId?: string;
  user?: {
    id: string;
    email: string;
  };
}
