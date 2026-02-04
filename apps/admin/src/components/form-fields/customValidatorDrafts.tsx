import { createContext, useContext } from "react";
import type { CustomValidatorType } from "@alliance/shared/client";

export type CustomValidatorDraft = {
  type: CustomValidatorType;
  idArgument?: string;
  expression?: string;
};

export type CustomValidatorDraftsContextValue = {
  drafts: Record<number, CustomValidatorDraft>;
  setDraft: (draftId: number, draft: CustomValidatorDraft) => void;
  removeDraft: (draftId: number) => void;
  createDraftId: () => number;
};

export const CustomValidatorDraftsContext =
  createContext<CustomValidatorDraftsContextValue | null>(null);

export const useCustomValidatorDrafts = (): CustomValidatorDraftsContextValue => {
  const context = useContext(CustomValidatorDraftsContext);
  if (!context) {
    throw new Error("CustomValidatorDraftsContext is missing");
  }
  return context;
};

export const isDraftValidatorId = (id?: number): id is number =>
  typeof id === "number" && id < 0;
