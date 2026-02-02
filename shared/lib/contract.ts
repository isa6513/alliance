import type { ContractEvent } from "../client";

export type ContractEventState = Pick<ContractEvent, "type" | "date" | "automatic"> | null;

export function getLastContractEvent(
  contractEvents: ContractEvent[] | undefined
): ContractEventState {
  if (!contractEvents?.length) {
    return null;
  }
  return contractEvents.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
}

export const CONTRACT_TERMS = [
  {
    id: 1,
    text: "I commit to complete up to 15 minutes of Alliance tasks per week.",
  },
  {
    id: 2,
    text: "I commit to complete every task I am assigned by its deadline, unless:",
    subItems: [
      {
        id: "a",
        text: "I have spent more than 15 minutes completing Alliance tasks in the past week.",
      },
      {
        id: "b",
        text: "I cannot complete the task due to a serious external circumstance, such as a medical issue or family emergency. In this case, I will inform the strategic office as soon as I can.",
      },
      {
        id: "c",
        text: "I believe the task is immoral. In this case, I will inform the strategic office of my reasoning by the deadline for the task.",
      },
    ],
  },
  {
    id: 3,
    text: "I understand that I am considered an active member, and am therefore able to participate in Alliance governance, if I have completed at least 8 of the last 10 tasks I was assigned.",
  },
] as const;

export const CONTRACT_NOTES = [
  "You can terminate your membership at any time.",
  "If you miss 3 or more of the last 10 tasks you were assigned, your contract will be suspended automatically. You can re-sign the contract to re-join the Alliance.",
] as const;

export function formatContractDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export function getSuspensionMessage(
  date: string,
  automatic: boolean
): string {
  const formattedDate = formatContractDate(date);
  return automatic
    ? `Your contract was suspended automatically on ${formattedDate}.`
    : `You suspended your contract on ${formattedDate}.`;
}

export function getSignedMessage(date: string): string {
  const formattedDate = formatContractDate(date);
  return `You signed this contract on ${formattedDate}.`;
}
