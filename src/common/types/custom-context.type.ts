import { Context, SessionFlavor } from 'grammy';
import { UserEntity } from '../../user/entities/user.entity';

interface Session {
    userId: number;
    jobInProgress: string | null;
    jobStage: string | null;
    stageRetry: number;
    randomStart?: number;
    clear: (ctx: CustomContext) => void;
}

type CustomContext = Context & {
    user: UserEntity;
    isOutDatedMessage?: boolean;
} & SessionFlavor<Session>;

export { CustomContext, Session };
