import { ContractEventType } from './entities/contract-event.entity';

/**
 * SQL boolean expression matching user.hasActiveContractAt for the given instant.
 * Use with QueryBuilder `.andWhere(sqlUserHasActiveContractAt('u'), { contractAt: new Date() })`.
 */
export function sqlUserHasActiveContractAt(
  userEntityAlias: string,
  contractAtParam = 'contractAt',
): string {
  const signed = ContractEventType.SIGNED;
  return `(
    SELECT ce."type" FROM "contract_event" ce
    WHERE ce."userId" = ${userEntityAlias}.id AND ce.date <= :${contractAtParam}
    ORDER BY ce."date" DESC
    LIMIT 1
  ) = '${signed}'`;
}
