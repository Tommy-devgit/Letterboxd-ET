import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  profilePicture: string | null;
  bio: string | null;
};

type AuthenticatedRequest = { user?: CurrentUser };

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user as CurrentUser;
});
