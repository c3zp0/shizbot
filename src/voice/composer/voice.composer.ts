import { Composer } from 'grammy';
import { CustomContext } from '../../common/types/custom-context.type';
import { BotCommandsEnum } from '../../common/enum/bot-commands.enum';
import { VoiceController } from '../controller/voice.controller';
import VoiceService from '../services/voice.service';
import { dataSource } from '../../common/db/config';
import VoiceEntity from '../entities/user-voice.entity';
import UserService from '../../user/services/user.service';
import UserEntity from '../../user/entities/user.entity';

const voiceComposer = new Composer<CustomContext>();

const voiceService = new VoiceService(dataSource.getRepository(VoiceEntity));
const userService = new UserService(dataSource.getRepository(UserEntity));
const voiceController = new VoiceController(voiceService, userService);

voiceComposer.on([':voice', ':video_note'], voiceController.handleVoice.bind(voiceController));
voiceComposer.command(BotCommandsEnum.TOP_VOICES, voiceController.getTopVoiceUsers.bind(voiceController));
voiceComposer.command(BotCommandsEnum.TOP_VOICES_TODAY, voiceController.getTodayTopVoiceUsers.bind(voiceController));
voiceComposer.command(BotCommandsEnum.OWN_VOICES_LENGTH, voiceController.ownVoicesLength.bind(voiceController));

export { voiceComposer };
