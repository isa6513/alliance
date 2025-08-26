import React from "react";
import { useParams } from "react-router";
import { FormBuilder as FormBuilderComponent } from "../components/FormBuilder";

const FormBuilder: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();

  return (
    <FormBuilderComponent
      actionId={93} // TODO: This should probably come from route params or context
      formId={formId && formId !== "new" ? formId : undefined}
      key={formId || "new"}
    />
  );
};

export default FormBuilder;
