import DateTimePicker from "@alliance/sharedweb/ui/DateTimePicker";

const DateTest = () => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      <DateTimePicker value={new Date()} onChange={() => {}} />
    </div>
  );
};

export default DateTest;
