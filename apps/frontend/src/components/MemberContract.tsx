import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import { CONTRACT_TERMS } from "@alliance/shared/lib/contract";

interface MemberContractProps {
  id?: string;
  className?: string;
}

const MemberContract = ({ id, className }: MemberContractProps) => {
  return (
    <Card className={className} style={CardStyle.White} id={id}>
      <div className="text-black px-3 p-1 md:p-4">
        <ol className="list-decimal list-inside flex flex-col gap-y-2">
          {CONTRACT_TERMS.map((term) => (
            <li key={term.id}>
              {term.text}
              {"subItems" in term && term.subItems && (
                <ol className="list-inside list-[lower-alpha] ml-6">
                  {term.subItems.map((subItem) => (
                    <li key={subItem.id}>{subItem.text}</li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
};

export default MemberContract;
