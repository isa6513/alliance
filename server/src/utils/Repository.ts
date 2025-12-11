import { RelationString } from 'src/tasks/entities/type';
import {
  EntityManager,
  EntityTarget,
  ObjectLiteral,
  QueryRunner,
  Repository as TypeOrmRepository,
  FindOneOptions as TypeOrmFindOneOptions,
} from 'typeorm';

export interface FindOneOptions<Entity extends ObjectLiteral>
  extends TypeOrmFindOneOptions<Entity> {
  relations?: RelationString<Entity>[];
}

export class Repository<
  Entity extends ObjectLiteral,
> extends TypeOrmRepository<Entity> {
  constructor(
    target: EntityTarget<Entity>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }

  findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return super.findOne(options);
  }
}
