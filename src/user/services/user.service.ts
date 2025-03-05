import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

export class UserService {
    constructor(private readonly userRepository: Repository<UserEntity>) {}

    findOneByTgId(tgId: UserEntity['tgId']) {
        return this.userRepository.findOne({
            where: { tgId },
            relations: { voices: true, chats: true },
        });
    }

    createFromTgProfile(
        tgId: number,
        tgFirstName: string,
        isBot: boolean,
        tgUsername?: string,
    ): Promise<UserEntity> {
        return this.userRepository.save(
            this.userRepository.create({
                tgId,
                tgFirstName,
                tgUsername,
                isBot,
            }),
        );
    }

    findById(id: number) {
        return this.userRepository.findOne({ where: { id } });
    }
}
