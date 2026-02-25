import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { JwtRequest } from 'src/auth/guards/jwtreq';
import {
  ContractAdminDto,
  ContractDto,
  CreateContractDto,
  SignContractDto,
  UpdateContractDto,
} from './dto/contract.dto';
import { ContractService } from './contract.service';

@Controller('contract')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Get('current')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ContractDto })
  async getCurrent() {
    return new ContractDto(
      await this.contractService.findNewestActiveContract(),
    );
  }

  @Get('admin')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: [ContractAdminDto] })
  async allAdmin(): Promise<ContractAdminDto[]> {
    return (await this.contractService.findAll()).map(
      (c) => new ContractAdminDto(c),
    );
  }

  @Get('admin/:id')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ContractAdminDto })
  async findOneAdmin(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContractAdminDto> {
    return new ContractAdminDto(await this.contractService.findOne(id));
  }

  @Get('detail/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: ContractDto })
  async getById(@Param('id', ParseIntPipe) id: number) {
    return new ContractDto(await this.contractService.findOne(id));
  }

  @Post('sign/:id')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: String })
  async signContract(
    @Request() req: JwtRequest,
    @Body() body: SignContractDto,
    @Param('id', ParseIntPipe) contractId: number,
  ) {
    return this.contractService.signContract({
      userId: req.user.sub,
      signedName: body.signedName,
      contractId,
    });
  }

  @Post('suspend')
  @UseGuards(AuthGuard)
  @ApiOkResponse({ type: String })
  async suspendContract(@Request() req: JwtRequest) {
    return this.contractService.suspendContract(req.user.sub);
  }

  @Post('create')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ContractAdminDto })
  async create(@Body() dto: CreateContractDto): Promise<ContractAdminDto> {
    return new ContractAdminDto(await this.contractService.create(dto));
  }

  @Patch('update/:id')
  @UseGuards(AdminGuard)
  @ApiOkResponse({ type: ContractAdminDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractDto,
  ): Promise<ContractAdminDto> {
    return new ContractAdminDto(await this.contractService.update(id, dto));
  }
}
