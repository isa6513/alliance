import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { FormResponse } from './entities/formresponse.entity';
import { CreateFormDto, SubmitFormDto } from './form.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
    @InjectRepository(FormResponse)
    private formResponseRepository: Repository<FormResponse>,
    private userService: UserService,
  ) {}

  async createForm(createFormDto: CreateFormDto): Promise<Form> {
    return this.formRepository.save(createFormDto);
  }

  async getForm(formId: number): Promise<Form> {
    const form = await this.formRepository.findOne({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return form;
  }

  async updateForm(formId: number, updateFormDto: CreateFormDto): Promise<Form> {
    const form = await this.getForm(formId);
    Object.assign(form, updateFormDto);
    return this.formRepository.save(form);
  }

  async submitForm(
    formId: number,
    userId: number,
    submitFormDto: SubmitFormDto,
  ): Promise<FormResponse> {
    const form = await this.getForm(formId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const formResponse = this.formResponseRepository.create({
      ...submitFormDto,
      form,
      formId,
      user,
    });
    return this.formResponseRepository.save(formResponse);
  }
}
