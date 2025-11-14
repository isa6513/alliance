interface LargeCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const LargeCheckbox: React.FC<LargeCheckboxProps> = ({
  label,
  checked,
  onChange,
}: LargeCheckboxProps) => {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        className="w-6 h-6 accent-black cursor-pointer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ml-2">{label}</span>
    </label>
  );
};

export default LargeCheckbox;
