import type { FormSchema } from "@alliance/shared/forms/formschema";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FormBuilder } from "./components/FormBuilder";

export function FormBuilderTest() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [savedSchema, setSavedSchema] = useState<FormSchema<
    string,
    string
  > | null>(null);
  const [loadFormId, setLoadFormId] = useState("");

  const currentFormId = searchParams.get("id");

  const handleSave = (schema: FormSchema<string, string>) => {
    console.log("Saved schema:", schema);
    setSavedSchema(schema);
  };

  const loadExistingForm = (formId: string) => {
    if (formId.trim()) {
      setSearchParams({ id: formId.trim() });
      setSavedSchema(null); // Clear any local schema to let URL loading take over
    }
  };

  const createNewForm = () => {
    setSearchParams({});
    setSavedSchema(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Form Builder Test</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={createNewForm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
            >
              Create New Form
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={loadFormId}
                onChange={(e) => setLoadFormId(e.target.value)}
                placeholder="Enter Form ID to load"
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-48"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    loadExistingForm(loadFormId);
                    setLoadFormId("");
                  }
                }}
              />
              <button
                onClick={() => {
                  loadExistingForm(loadFormId);
                  setLoadFormId("");
                }}
                disabled={!loadFormId.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white rounded-md text-sm font-medium"
              >
                Load Form
              </button>
            </div>
          </div>
        </div>
        
        {currentFormId && (
          <div className="mt-3 text-sm text-gray-600">
            Currently editing form: <span className="font-mono font-medium">{currentFormId}</span>
          </div>
        )}
      </div>

      <FormBuilder
        onSave={handleSave}
        initialSchema={currentFormId ? undefined : (savedSchema || undefined)}
        actionId={93}
      />

      {savedSchema && !currentFormId && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <h3 className="font-medium text-gray-900 mb-2">Last Saved Schema</h3>
          <div className="text-sm text-gray-600">
            <div>
              <strong>Title:</strong> {savedSchema.title}
            </div>
            <div>
              <strong>Pages:</strong> {savedSchema.pages.length}
            </div>
            <div>
              <strong>Total Fields:</strong>{" "}
              {savedSchema.pages.reduce(
                (total, page) => total + page.fields.length,
                0
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
