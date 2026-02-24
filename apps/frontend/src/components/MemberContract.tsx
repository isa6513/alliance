import Card from "@alliance/sharedweb/ui/Card";
import { CardStyle } from "@alliance/shared/styles/card";
import AppMarkdownWrapper from "@alliance/sharedweb/ui/AppMarkdownWrapper";

interface MemberContractProps {
  id?: string;
  className?: string;
  markdown: string;
}

const MemberContract = ({ id, className, markdown }: MemberContractProps) => {
  return (
    <Card className={className} style={CardStyle.White} id={id}>
      <AppMarkdownWrapper markdownContent={markdown} />
    </Card>
  );
};

export default MemberContract;
