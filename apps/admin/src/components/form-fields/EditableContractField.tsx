import type { ContractField } from "@alliance/shared/forms/formschema";
import { useQuery } from "@tanstack/react-query";
import { contractAllAdmin, contractGetCurrent } from "@alliance/shared/client";
import { RequiredToggle } from "./CommonControls";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "./types";
import { useEffect, useMemo, useRef } from "react";

export function EditableContractField({
  field,
  onUpdate,
  onRemove,
  onDragStart,
  onDragEnd,
  isDragging,
  previousFields,
}: BaseFieldProps<ContractField>) {
  const { data: contracts = [] } = useQuery({
    queryKey: ["contractAllAdmin"],
    queryFn: async () => {
      const res = await contractAllAdmin();
      return res.data ?? [];
    },
  });

  const { data: currentContract } = useQuery({
    queryKey: ["contractGetCurrent"],
    queryFn: () => contractGetCurrent().then((res) => res.data ?? null),
  });

  // Default to current contract when none selected (once per field)
  const hasDefaulted = useRef(false);
  useEffect(() => {
    if (hasDefaulted.current || !currentContract) {
      return;
    }
    hasDefaulted.current = true;
    onUpdate({ contractId: currentContract.id });
  }, [currentContract, onUpdate]);

  const contractOptions = useMemo(
    () =>
      contracts.map((c) => ({
        id: c.id,
        name: c.name?.trim() || `Contract #${c.id}`,
      })),
    [contracts]
  );

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === field.contractId) ?? null,
    [contracts, field.contractId]
  );

  // Merge selected contract onto field so RenderField (existing preview) can show markdown + sign toggle
  const fieldWithContract = useMemo(
    () => (selectedContract ? { ...field, contract: selectedContract } : field),
    [field, selectedContract]
  );

  return (
    <FieldWrapper
      field={fieldWithContract}
      onUpdate={onUpdate}
      previousFields={previousFields}
      onRemove={onRemove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      isDragging={isDragging}
    >
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Contract
        </label>
        <select
          value={field.contractId}
          onChange={(e) => onUpdate({ contractId: Number(e.target.value) })}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {contractOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <RequiredToggle
        checked={field.required}
        onChange={(checked) => onUpdate({ required: checked })}
      />
    </FieldWrapper>
  );
}
