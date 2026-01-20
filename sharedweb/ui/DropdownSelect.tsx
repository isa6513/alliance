import { useState } from "react";
import { useOutsideClick } from "../../sharedweb/lib/useOutsideClick";
import { ChevronDown } from "lucide-react";

type EnumType = Record<string, string | number>;

type KVPair<T extends EnumType> = {
  [K in keyof T]: [key: K, value: T[K]];
}[keyof T];

type DropdownSelectProps<T extends EnumType> = {
  options: T;
  secondaryLabel?: (args: KVPair<T>) => string | undefined;
  value: T[keyof T];
  onChange: (args: KVPair<T>) => void;
};

function DropdownSelect<T extends EnumType>({
  options,
  secondaryLabel,
  value,
  onChange,
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const ref = useOutsideClick(() => setIsOpen(false));
  return (
    <div className="relative">
      <button
        className="font-ibm text-sm border border-gray-2 text-black bg-white hover:bg-zinc-50 px-3 rounded-sm py-2 flex flex-row gap-x-2 items-center"
        style={{
          fontWeight: 450,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value}</span> <ChevronDown size="15" />
      </button>
      <div
        className={`absolute z-10 top-[calc(100% - 30px)] mt-0.5 left-0 w-[220px] bg-white border border-gray-2 overflow-hidden rounded ${
          isOpen ? "flex flex-col" : "hidden"
        }`}
        ref={ref}
      >
        {(Object.entries(options) as KVPair<T>[]).map(([key, value]) => (
          <button
            key={value}
            onClick={() => {
              onChange([key, value]);
              setIsOpen(false);
            }}
            className="px-3 pr-3 py-2 hover:bg-zinc-50 text-left font-ibm text-sm"
            style={{
              fontWeight: 450,
            }}
          >
            <div className="flex flex-row justify-between items-center">
              <span>{value}</span>
              {secondaryLabel?.([key, value]) && (
                <span className="text-zinc-500 !font-mono">
                  {secondaryLabel([key, value])}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DropdownSelect;
