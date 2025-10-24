import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { parsePhoneNumberWithError } from 'libphonenumber-js';
import { Action } from 'src/actions/entities/action.entity';
import { getImageSource } from 'src/images/images.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import {
  CreateFormDto,
  FormDto,
  FormResponseDto,
  SubmitFormDto,
} from './form.dto';
import { FormSchema, isQuestionField, isQuestionVisible, Page } from './schema';
import {
  CustomValidatorTypeDto,
  CustomValidatorResponseDto,
  CustomValidatorDto,
} from './customvalidator.dto';
import { ForumService } from 'src/forum/forum.service';
import { ActionsService } from 'src/actions/actions.service';
import { MmsService } from 'src/mms/mms.service';
import { welcomeMessage } from 'src/notifs/textnotifcontents';
import {
  CustomValidator,
  CustomValidatorType,
  typeName,
  typeUsableForVisibility,
  typeUsesIdArgument,
} from './entities/customvalidator.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
    private userService: UserService,
    private forumService: ForumService,
    private actionsService: ActionsService,
    private mmsService: MmsService,
    @InjectRepository(CustomValidator)
    private customValidatorRepository: Repository<CustomValidator>,
  ) {}

  async createForm(createFormDto: CreateFormDto): Promise<Form> {
    return this.formRepository.save(createFormDto);
  }

  async getForm(formId: number): Promise<Form> {
    const form = await this.formRepository.findOne({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.transformImageUrls(form);
  }

  async transformImageUrls(form: Form): Promise<Form> {
    const pages = form.schema.pages as Page[];
    for (const page of pages) {
      for (const field of page.fields) {
        if (field.kind === 'image') {
          field.src = getImageSource(field.src);
        }
      }
    }
    return form;
  }

  async validateFormSubmission(
    form: Form,
    submitFormDto: SubmitFormDto,
    userId: number,
  ): Promise<void> {
    const schema = form.schema as unknown as FormSchema;
    const validatorIds = new Set<number>();

    for (const page of schema.pages) {
      for (const element of page.fields) {
        const conditions = Array.isArray(element.visibleIf)
          ? element.visibleIf
          : element.visibleIf
            ? [element.visibleIf]
            : [];
        for (const condition of conditions) {
          if ('validatorId' in condition) {
            validatorIds.add(condition.validatorId);
          }
        }
      }
    }

    let validatorResults: Record<number, boolean> | undefined;
    if (validatorIds.size > 0) {
      const results = await Promise.all(
        Array.from(validatorIds).map(async (validatorId) => {
          try {
            const result = await this.runValidator(validatorId, userId);
            return [validatorId, result.isValid] as const;
          } catch (error) {
            this.logger.error(
              `Failed to evaluate visibility validator ${validatorId}: ${String(error)}`,
            );
            return [validatorId, false] as const;
          }
        }),
      );
      validatorResults = Object.fromEntries(results);
    }

    for (const page of schema.pages) {
      for (const field of page.fields) {
        if (isQuestionField(field)) {
          if (
            field.required &&
            isQuestionVisible(field, submitFormDto.answers, validatorResults)
          ) {
            if (!submitFormDto.answers[field.id]) {
              throw new BadRequestException(`Field ${field.label} is required`);
            }
          }
        }
      }
    }
  }

  async updateForm(
    formId: number,
    updateFormDto: CreateFormDto,
  ): Promise<Form> {
    const form = await this.getForm(formId);
    Object.assign(form, updateFormDto);
    return this.transformImageUrls(await this.formRepository.save(form));
  }

  async submitForm(
    formId: number,
    userId: number,
    submitFormDto: SubmitFormDto,
  ): Promise<FormResponse> {
    const form = await this.getForm(formId);
    const user = await this.userService.findOneOrFail(userId);

    await this.validateFormSubmission(form, submitFormDto, userId);

    const phoneNumber = await this.extractPhoneNumber(
      form,
      submitFormDto.answers,
    );
    if (phoneNumber) {
      this.logger.log(`Extracted phone number: ${phoneNumber}`);
      const parsedNumber = parsePhoneNumberWithError(phoneNumber, 'US'); //TODO: check with non US numbers

      if (parsedNumber.isValid()) {
        this.logger.log(`Valid phone number: ${parsedNumber.number}`);
        user.phoneNumberValidated = true;
        user.phoneNumber = parsedNumber.number;

        if (!user.sentTextOptInMessageAt) {
          await this.mmsService.sendMms(
            parsedNumber.number,
            welcomeMessage,
            [],
          );
          user.sentTextOptInMessageAt = new Date(); //TODO: check if sent successfully?
        }
      } else {
        this.logger.warn(`Parsed an invalid phone number: ${phoneNumber}`);
        user.phoneNumber = phoneNumber;
      }
      await this.userService.update(user.id, user);
    }

    const formResponse = this.formResponseRepository.create({
      ...submitFormDto,
      form,
      formId,
      schemaSnapshot: submitFormDto.schemaSnapshot,
      user,
    });
    const savedForm = await this.formResponseRepository.save(formResponse);

    await this.actionsService.completeAction(
      submitFormDto.actionId,
      userId,
      savedForm,
    );

    return savedForm;
  }

  async extractPhoneNumber(
    form: Form,
    answers: Record<string, string>,
  ): Promise<string | null> {
    const schema = form.schema as unknown as FormSchema;

    const phoneNumbers: { fieldId: string; label: string; value: string }[] =
      [];

    for (const page of schema.pages) {
      if (page.fields) {
        for (const field of page.fields) {
          if (field.kind === 'phone' && answers[field.id]) {
            phoneNumbers.push({
              fieldId: field.id,
              label: field.label,
              value: answers[field.id],
            });
          }
        }
      }
    }

    if (phoneNumbers.length > 0) {
      return phoneNumbers[0].value;
    }
    return null;
  }

  async listForms(): Promise<FormDto[]> {
    const forms = await this.formRepository.find();
    return Promise.all(
      forms.map(
        async (form) =>
          ({
            id: form.id,
            title: form.title,
            schema: form.schema,
            usedInAction:
              (await this.actionRepository.findOne({
                where: { taskFormId: form.id },
              })) ?? undefined,
          }) satisfies FormDto,
      ),
    );
  }

  async deleteForm(formId: number): Promise<void> {
    const form = await this.getForm(formId);
    await this.formRepository.remove(form);
  }

  async getFormResponses(formId: number): Promise<FormResponseDto[]> {
    const responses = await this.formResponseRepository.find({
      where: { formId },
      relations: ['user'],
    });
    return responses;
  }

  async getMyFormResponse(
    userId: number,
    formId: number,
  ): Promise<FormResponseDto> {
    const responses = await this.formResponseRepository.find({
      where: { formId, user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
    if (!responses.length) {
      throw new NotFoundException('Form response not found');
    }
    return responses[0];
  }

  async customValidators(): Promise<CustomValidatorTypeDto[]> {
    const types = Object.values(CustomValidatorType);
    return types.map((type) => ({
      name: typeName[type],
      id: type,
      withIdField: typeUsesIdArgument[type],
      usableForVisibility: typeUsableForVisibility[type],
    }));
  }

  async findOrCreateCustomValidator(
    type: CustomValidatorType,
    idArg?: number,
  ): Promise<number> {
    let validator = await this.customValidatorRepository.findOne({
      where: { type, idArgument: idArg },
    });
    if (!validator) {
      validator = this.customValidatorRepository.create({
        type,
        idArgument: idArg,
      });
      await this.customValidatorRepository.save(validator);
    }
    return validator.id;
  }

  async findOneCustomValidator(id: number): Promise<CustomValidatorDto> {
    return this.customValidatorRepository.findOneOrFail({ where: { id } });
  }

  async runValidator(
    id: number,
    userId: number,
  ): Promise<CustomValidatorResponseDto> {
    const validator = await this.customValidatorRepository.findOneOrFail({
      where: { id },
    });
    const user = await this.userService.findOneOrFail(userId);

    switch (validator.type) {
      case CustomValidatorType.UploadedPhoto:
        if (!user.profilePicture) {
          return {
            isValid: false,
            message:
              "It looks like you haven't uploaded a profile picture yet - please do that now!",
          };
        }
        break;
      case CustomValidatorType.SignedContract:
        console.log(user.contractDateSigned, user.contractDateSuspended);
        if (!user.contractDateSigned || user.contractDateSuspended) {
          return {
            isValid: false,
            message:
              "It looks like you haven't signed the contract yet - please do that now!",
          };
        }
        break;
      case CustomValidatorType.AddedProfileDescription:
        if (!user.profileDescription) {
          return {
            isValid: false,
            message:
              "It looks like you haven't added a profile description yet - please do that now!",
          };
        }
        break;
      case CustomValidatorType.RepliedToForumPost:
        if (!validator.idArgument) {
          throw new BadRequestException('Validator has no id argument');
        }
        const replies = await this.forumService.findCommentsForPost(
          validator.idArgument,
        );
        if (
          replies.filter((reply) => reply.authorId === user.id).length === 0
        ) {
          return {
            isValid: false,
            message:
              "It looks like you haven't replied to the discussion yet - please do that now!",
          };
        }
        break;
      case CustomValidatorType.HasPhoneNumber:
        if (!user.phoneNumber) {
          //TODO: check for validation (but inform the user)
          return {
            isValid: false,
            message:
              "It looks like you haven't added a phone number yet - please do that now!",
          };
        }
        break;
    }
    return { isValid: true };
  }
}
