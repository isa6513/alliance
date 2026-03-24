import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import AppMarkdownWrapper from "../AppMarkdownWrapper";
import type { UserDto } from "@alliance/shared/client";
import {
  FormResponseDto,
  SubmitFormDto,
  tasksGetForm,
  tasksGetMyFormResponse,
  tasksRunValidator,
} from "@alliance/shared/client";
import type {
  DisplayBlock,
  PreviousAnswerBlock,
} from "@alliance/shared/forms/display-blocks";
import type {
  AnyField,
  FormSchema,
  FormValue,
  VisibleIfFormula,
} from "@alliance/shared/forms/formschema";
import type { DeviceVisibilityTarget } from "@alliance/shared/forms/schema/device";
import {
  applyDefaultValues,
  computeFormStorageKey,
  filterAnswersByFieldIds,
  isElementCurrentlyVisible as isElementCurrentlyVisibleShared,
  resolveFieldDefaultValue,
  validateFieldValue as validateFieldValueShared,
} from "@alliance/shared/formrenderer";
import { RenderField } from "./RenderField";
import FormModal from "./FormModal";
import RenderPreviousAnswer from "./RenderPreviousAnswer";
import VideoPlayer from "./VideoPlayer";
import Button, { ButtonColor, ButtonSize } from "../system/Button";
import { CircleCheck, Copy, Ellipsis } from "lucide-react-native";
import { cn } from "@alliance/shared/styles/util";

type FormRendererProps = {
  form: FormSchema;
  id: number;
  publicAction?: boolean;
  actionId: number;
  persistKey?: string | null;
  initialPageIndex?: number;
  userId?: string | number;
  phDistinctId?: string;
  sessionReplayUrl?: string;
  user?: Omit<UserDto, "email">;
  disableOptionRandomization?: boolean;
  onFormStarted?: () => void;
  onAbandonAction?: (
    outOfTime: boolean,
    reason: string,
    partialFormData: SubmitFormDto,
  ) => void;
  renderFormAsCompleted?: boolean;
  completedFormResponse?: FormResponseDto;
  onSubmit: ((data: SubmitFormDto) => Promise<void>) | null;
  scrollPageTo: (y: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
};

const DEVICE_TYPE: DeviceVisibilityTarget = "mobile";

function CopyTextDisplayMobile({
  text,
  title,
}: {
  text: string;
  title?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View>
      {title ? (
        <Text className="text-sm text-zinc-500 mb-1">{title}</Text>
      ) : null}
      <TouchableOpacity
        className="flex-row items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3"
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        <Text className="flex-1" numberOfLines={1}>
          {text}
        </Text>
        {copied ? (
          <Text className="text-sm text-green ml-2 font-medium">Copied!</Text>
        ) : (
          <Copy size={16} className="shrink-0 text-gray-400" />
        )}
      </TouchableOpacity>
    </View>
  );
}

type RenderDisplayBlockMobileProps = {
  block: DisplayBlock;
  previousAnswerData?: Record<number, Record<string, unknown>>;
  previousAnswerSchemas?: Record<number, FormSchema>;
};

export function RenderDisplayBlockMobile({
  block,
  previousAnswerData,
  previousAnswerSchemas,
}: RenderDisplayBlockMobileProps) {
  switch (block.kind) {
    case "header":
      const headerClass = {
        1: "text-3xl",
        2: "text-2xl",
        3: "text-xl",
        4: "text-lg",
        5: "text-base",
        6: "text-base",
        none: "text-base",
      }[block.level ?? "none"];
      return (
        <Text
          className={cn("font-semibold text-zinc-900 my-2", headerClass)}
          selectable
        >
          {block.text}
        </Text>
      );
    case "text":
      return <AppMarkdownWrapper>{block.text}</AppMarkdownWrapper>;
    case "label":
      return (
        <Text className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {block.text}
        </Text>
      );
    case "divider":
      return <View className="h-px bg-zinc-200" />;
    case "spacer": {
      const sizes: Record<NonNullable<typeof block.size>, string> = {
        xs: "h-2",
        sm: "h-4",
        md: "h-8",
        lg: "h-12",
        xl: "h-16",
      };
      return <View className={sizes[block.size ?? "md"]} />;
    }
    case "quote":
      return (
        <View className="bg-zinc-100 p-4 rounded-lg">
          <Text className="text-base text-zinc-800 leading-6">
            {block.text}
          </Text>
        </View>
      );
    case "image":
      return (
        <View className="items-center">
          <Image
            source={{ uri: block.src }}
            accessibilityLabel={block.alt}
            className="w-full h-48 bg-zinc-200 rounded-lg"
            resizeMode="cover"
          />
          {block.caption && (
            <Text className="text-sm text-zinc-600 mt-2 text-center">
              {block.caption}
            </Text>
          )}
        </View>
      );
    case "biglink":
      return (
        <TouchableOpacity
          className="rounded-lg border border-zinc-200 bg-white px-5 py-4"
          onPress={() => Linking.openURL(block.url)}
        >
          <Text className="text-base font-medium text-blue-600">
            {block.text}
          </Text>
          <Text className="mt-1 text-sm text-zinc-500" numberOfLines={1}>
            {block.url}
          </Text>
        </TouchableOpacity>
      );
    case "copytext":
      return <CopyTextDisplayMobile text={block.text} title={block.title} />;
    case "video":
      return block.videoId !== undefined ? (
        <VideoPlayer
          src={block.src}
          videoId={block.videoId}
          caption={block.caption}
        />
      ) : (
        <Text className="text-sm text-red-500">Could not load video</Text>
      );
    case "previousAnswer": {
      const answers = previousAnswerData?.[block.sourceFormId];
      const schema = previousAnswerSchemas?.[block.sourceFormId];
      return (
        <RenderPreviousAnswer block={block} schema={schema} answers={answers} />
      );
    }
    default:
      return null;
  }
}

const FormRenderer = ({
  form,
  id,
  onSubmit,
  persistKey,
  userId,
  user,
  disableOptionRandomization,
  onFormStarted,
  onAbandonAction,
  renderFormAsCompleted,
  completedFormResponse,
  actionId,
  initialPageIndex,
  phDistinctId,
  sessionReplayUrl,
  scrollPageTo,
  scrollToEnd,
}: FormRendererProps) => {
  const schema = form as unknown as FormSchema;
  const readOnly = !!renderFormAsCompleted || !onSubmit;

  const storageKey = useMemo(
    () =>
      computeFormStorageKey({
        formId: id,
        instanceId: persistKey ?? undefined,
      }),
    [id, persistKey],
  );

  const randomizationKey = useMemo(() => {
    const base = `form:${id}`;
    const normalizedUserId =
      user?.id !== undefined && user?.id !== null ? user.id : userId;
    if (
      normalizedUserId !== undefined &&
      normalizedUserId !== null &&
      normalizedUserId !== ""
    ) {
      return `${base}:user:${String(normalizedUserId)}`;
    }
    if (persistKey !== undefined && persistKey !== null && persistKey !== "") {
      return `${base}:persist:${String(persistKey)}`;
    }
    return base;
  }, [id, user?.id, userId, persistKey]);

  const { fieldLookup, defaultValueMap } = useMemo(() => {
    const lookup = new Map<string, AnyField>();
    const defaults = new Map<string, FormValue>();

    for (const page of schema.pages) {
      for (const element of page.fields) {
        if ("label" in element) {
          const field = element as AnyField;
          lookup.set(field.id, field);
          const defaultValue = resolveFieldDefaultValue(field);
          if (defaultValue !== undefined) {
            defaults.set(field.id, defaultValue);
          }
        }
      }
    }

    return { fieldLookup: lookup, defaultValueMap: defaults };
  }, [schema]);

  const previousAnswerSourceFormIds = useMemo(() => {
    const ids = new Set<number>();
    for (const page of schema.pages) {
      for (const element of page.fields) {
        if (
          !("label" in element) &&
          (element as PreviousAnswerBlock).kind === "previousAnswer"
        ) {
          const block = element as PreviousAnswerBlock;
          if (block.sourceFormId) {
            ids.add(block.sourceFormId);
          }
        }
      }
    }
    return Array.from(ids);
  }, [schema]);

  const [previousAnswerSchemas, setPreviousAnswerSchemas] = useState<
    Record<number, FormSchema>
  >({});
  const [previousAnswerData, setPreviousAnswerData] = useState<
    Record<number, Record<string, unknown>>
  >({});

  useEffect(() => {
    if (previousAnswerSourceFormIds.length === 0) {
      setPreviousAnswerSchemas({});
      setPreviousAnswerData({});
      return;
    }

    let cancelled = false;

    (async () => {
      const schemaEntries = await Promise.all(
        previousAnswerSourceFormIds.map(async (formId) => {
          try {
            const response = await tasksGetForm({ path: { id: formId } });
            if (response.data) {
              const form = response.data as Record<string, unknown>;
              return [formId, form.schema as FormSchema] as const;
            }
          } catch {
            // Form not found or inaccessible.
          }

          return null;
        }),
      );

      if (cancelled) return;

      const schemas: Record<number, FormSchema> = {};
      for (const entry of schemaEntries) {
        if (entry) {
          schemas[entry[0]] = entry[1];
        }
      }
      setPreviousAnswerSchemas(schemas);

      const dataEntries = await Promise.all(
        previousAnswerSourceFormIds.map(async (formId) => {
          try {
            const response = await tasksGetMyFormResponse({
              path: { id: formId },
            });
            if (response.data) {
              const formResponse = response.data as Record<string, unknown>;
              return [
                formId,
                (formResponse.answers as Record<string, unknown>) ?? {},
              ] as const;
            }
          } catch {
            // User has not submitted the source form.
          }

          return null;
        }),
      );

      if (cancelled) return;

      const data: Record<number, Record<string, unknown>> = {};
      for (const entry of dataEntries) {
        if (entry) {
          data[entry[0]] = entry[1];
        }
      }
      setPreviousAnswerData(data);
    })();

    return () => {
      cancelled = true;
    };
  }, [previousAnswerSourceFormIds]);

  const pageCount = schema.pages?.length ?? 0;
  const maxPageIndex = Math.max(0, (pageCount || 1) - 1);
  const userDefaultPublic = user?.formDataPreference === "public";
  const outputFieldDefaultPublic = useMemo(() => {
    const defaults = new Map<string, boolean>();
    for (const page of schema.pages ?? []) {
      for (const element of page.fields ?? []) {
        if ("label" in element) {
          const field = element as AnyField;
          if (field.output?.output) {
            defaults.set(
              field.id,
              field.output.privateByDefault ? false : userDefaultPublic,
            );
          }
        }
      }
    }
    return defaults;
  }, [schema, userDefaultPublic]);

  const clampPageIndex = (idx: number): number => {
    if (!Number.isFinite(idx)) return 0;
    const normalized = Math.floor(idx);
    if (normalized < 0) return 0;
    if (normalized > maxPageIndex) return maxPageIndex;
    return normalized;
  };

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() =>
    clampPageIndex(initialPageIndex ?? 0),
  );
  const [formData, setFormData] = useState<Record<string, FormValue>>(() => {
    if (readOnly) {
      const answers =
        (completedFormResponse?.answers as Record<string, FormValue>) || {};
      return filterAnswersByFieldIds(answers, fieldLookup);
    }
    return applyDefaultValues({}, defaultValueMap);
  });
  const [publicAnswers, setPublicAnswers] = useState<Record<string, boolean>>(
    () => {
      const completedPublicAnswers = completedFormResponse?.publicAnswers as
        | Record<string, unknown>
        | undefined;
      const defaults: Record<string, boolean> = {};
      for (const [fieldId, defaultIsPublic] of outputFieldDefaultPublic) {
        const completedValue = completedPublicAnswers?.[fieldId];
        defaults[fieldId] =
          typeof completedValue === "boolean"
            ? completedValue
            : defaultIsPublic;
      }
      return defaults;
    },
  );
  const [visibilityValidatorResults, setVisibilityValidatorResults] = useState<
    Record<number, boolean>
  >(() => {
    if (readOnly && completedFormResponse?.visibilityValidatorResults) {
      return completedFormResponse.visibilityValidatorResults as Record<
        number,
        boolean
      >;
    }
    return {};
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [outOfTimeSelected, setOutOfTimeSelected] = useState(false);
  const [otherReasonSelected, setOtherReasonSelected] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [hasEmittedStart, setHasEmittedStart] = useState(false);

  // Draft persistence: tracks whether we've loaded a stored draft so the save
  // effect doesn't overwrite stored data with initial defaults.
  const draftLoaded = useRef(false);

  // Restore draft from AsyncStorage on mount
  useEffect(() => {
    if (readOnly || !persistKey) {
      draftLoaded.current = true;
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (cancelled || !raw) {
          draftLoaded.current = true;
          return;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.formData && typeof parsed.formData === "object") {
          const filtered = filterAnswersByFieldIds(
            parsed.formData as Record<string, FormValue>,
            fieldLookup,
          );
          setFormData(applyDefaultValues(filtered, defaultValueMap));
        }
        if (parsed?.publicAnswers && typeof parsed.publicAnswers === "object") {
          const overrides: Record<string, boolean> = {};
          for (const [fieldId, value] of Object.entries(
            parsed.publicAnswers as Record<string, unknown>,
          )) {
            if (
              outputFieldDefaultPublic.has(fieldId) &&
              typeof value === "boolean"
            ) {
              overrides[fieldId] = value;
            }
          }
          if (Object.keys(overrides).length > 0) {
            setPublicAnswers((prev) => ({ ...prev, ...overrides }));
          }
        }
        if (typeof parsed?.currentPageIndex === "number") {
          setCurrentPageIndex(clampPageIndex(parsed.currentPageIndex));
        }
      } catch {
        // Corrupt or missing draft — ignore.
      }
      draftLoaded.current = true;
    })();

    return () => {
      cancelled = true;
    };
    // Only run once on mount for a given storageKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Save draft to AsyncStorage when form state changes
  useEffect(() => {
    if (readOnly || !persistKey || !draftLoaded.current) return;

    const timeout = setTimeout(() => {
      AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          formData,
          publicAnswers,
          currentPageIndex,
          updatedAt: Date.now(),
        }),
      ).catch((e) => {
        // Storage write failed — non-critical.
        console.error("Failed to save draft", e);
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    formData,
    publicAnswers,
    currentPageIndex,
    persistKey,
    storageKey,
    readOnly,
  ]);

  const fieldPositions = useRef<Record<string, number>>({});
  const fieldScreenPositions = useRef<Record<string, number>>({});

  const scrollToField = useCallback(
    (fieldId: string) => {
      const yPosition = fieldPositions.current[fieldId];
      scrollPageTo(Math.max(0, yPosition + 100));
    },
    [scrollPageTo],
  );

  useEffect(() => {
    const completedPublicAnswers = completedFormResponse?.publicAnswers as
      | Record<string, unknown>
      | undefined;

    setPublicAnswers((prev) => {
      const next: Record<string, boolean> = {};
      for (const [fieldId, defaultIsPublic] of outputFieldDefaultPublic) {
        const completedValue = completedPublicAnswers?.[fieldId];
        const fallbackValue =
          typeof completedValue === "boolean"
            ? completedValue
            : (prev[fieldId] ?? defaultIsPublic);
        next[fieldId] = fallbackValue;
      }

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length !== nextKeys.length) {
        return next;
      }
      for (const key of nextKeys) {
        if (prev[key] !== next[key]) {
          return next;
        }
      }
      return prev;
    });
  }, [completedFormResponse?.publicAnswers, outputFieldDefaultPublic]);

  const visibilityValidatorIds = useMemo(() => {
    const ids = new Set<number>();
    const collectFromConditions = (visibleIf: unknown) => {
      const conditions = Array.isArray(visibleIf)
        ? visibleIf
        : visibleIf
          ? [visibleIf]
          : [];
      for (const condition of conditions) {
        if (
          condition &&
          typeof condition === "object" &&
          "validatorId" in condition
        ) {
          ids.add((condition as { validatorId: number }).validatorId);
        }
      }
    };
    const collectFromVisibleIfFormula = (
      visibleIfFormula: VisibleIfFormula | undefined,
    ) => {
      if (!visibleIfFormula?.conditions) {
        return;
      }
      for (const condition of Object.values(visibleIfFormula.conditions)) {
        if (condition && "validatorId" in condition) {
          ids.add(condition.validatorId);
        }
      }
    };
    for (const page of schema.pages) {
      for (const element of page.fields) {
        collectFromConditions(element.visibleIf);
        collectFromVisibleIfFormula(element.visibleIfFormula);
        if ("label" in element && (element as AnyField).kind === "list") {
          const listField = element as AnyField & { fields?: AnyField[] };
          if (Array.isArray(listField.fields)) {
            for (const sub of listField.fields) {
              collectFromConditions(sub.visibleIf);
              collectFromVisibleIfFormula(sub.visibleIfFormula);
            }
          }
        }
      }
    }
    return Array.from(ids);
  }, [schema]);

  useEffect(() => {
    if (readOnly) {
      return;
    }
    const missingIds = visibilityValidatorIds.filter(
      (id) => !(id in visibilityValidatorResults),
    );
    if (!missingIds.length) {
      return;
    }

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missingIds.map(async (validatorId) => {
          try {
            const response = await tasksRunValidator({
              path: { id: validatorId },
              body: {},
            });
            if (!response.data || response.error) {
              throw response.error ?? new Error("Missing validator response");
            }
            return [validatorId, response.data.isValid] as const;
          } catch (error) {
            console.error(
              `Failed to evaluate visibility validator ${validatorId}`,
              error,
            );
            return [validatorId, false] as const;
          }
        }),
      );
      if (cancelled) return;
      setVisibilityValidatorResults((prev) => {
        const next = { ...prev };
        for (const [id, value] of entries) {
          next[id] = value;
        }
        return next;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [visibilityValidatorIds, visibilityValidatorResults, readOnly]);

  const isElementCurrentlyVisible = useCallback(
    (
      element: AnyField | DisplayBlock,
      data?: Record<string, FormValue>,
    ): boolean =>
      isElementCurrentlyVisibleShared(element, data ?? formData, {
        deviceType: DEVICE_TYPE,
        visibilityValidatorResults,
        fieldLookup,
        readOnly,
      }),
    [fieldLookup, formData, visibilityValidatorResults, readOnly],
  );

  const validateFieldValue = useCallback(
    (
      field: AnyField,
      fieldValue: FormValue | undefined,
      data?: Record<string, FormValue>,
    ): string | null =>
      validateFieldValueShared(field, fieldValue, data ?? formData, {
        deviceType: DEVICE_TYPE,
        visibilityValidatorResults,
      }),
    [formData, visibilityValidatorResults],
  );

  const applyFieldErrorUpdates = useCallback(
    (updates: Record<string, string | null>) => {
      if (!updates || Object.keys(updates).length === 0) return;

      setFieldErrors((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const [fieldId, message] of Object.entries(updates)) {
          if (message && message.trim().length > 0) {
            if (next[fieldId] !== message) {
              next[fieldId] = message;
              changed = true;
            }
          } else if (fieldId in next) {
            delete next[fieldId];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    [],
  );

  const runCustomValidatorsForFields = useCallback(
    async (
      fieldsToValidate: AnyField[],
    ): Promise<Record<string, string | null>> => {
      if (!fieldsToValidate.length || readOnly) {
        return {};
      }

      const results = await Promise.all(
        fieldsToValidate.map(async (field) => {
          if (!field.customValidatorId) {
            return [field.id, null] as const;
          }

          try {
            const fieldValue = formData[field.id];
            const response = await tasksRunValidator({
              path: { id: field.customValidatorId },
              body: { fieldValue: fieldValue?.toString() ?? "" },
            });

            if (response.error || !response.data) {
              throw response.error;
            }

            const isValid = response.data.isValid;
            return [
              field.id,
              isValid ? null : (response.data.message ?? null),
            ] as const;
          } catch (err) {
            console.error("Failed to run custom validator", err);
            return [
              field.id,
              "Unable to validate this field right now. Please try again.",
            ] as const;
          }
        }),
      );

      return Object.fromEntries(results);
    },
    [readOnly, formData],
  );

  const validatePage = useCallback(
    async (
      pageIndex: number,
      includeCustomValidators: boolean,
    ): Promise<{ isValid: boolean; firstInvalidFieldId?: string }> => {
      const page = schema.pages[pageIndex];
      if (!page) {
        return { isValid: true };
      }

      const updates: Record<string, string | null> = {};
      const fieldsOnPage = page.fields.filter(
        (element): element is AnyField => "label" in element,
      );
      const visibleFields = fieldsOnPage.filter((field) =>
        isElementCurrentlyVisible(field),
      );
      const visibleFieldIds = new Set(visibleFields.map((field) => field.id));

      for (const field of fieldsOnPage) {
        if (!visibleFieldIds.has(field.id)) {
          updates[field.id] = null;
          continue;
        }
        const fieldValue = formData[field.id];
        updates[field.id] = validateFieldValue(field, fieldValue);
      }

      if (includeCustomValidators && !readOnly) {
        const candidates = visibleFields.filter(
          (field) => field.customValidatorId && !updates[field.id],
        );
        if (candidates.length > 0) {
          const customResults = await runCustomValidatorsForFields(candidates);
          Object.assign(updates, customResults);
        }
      }

      applyFieldErrorUpdates(updates);

      const firstInvalid = visibleFields.find((field) => {
        const message = updates[field.id];
        return !!(message && message.trim().length > 0);
      });

      return {
        isValid: !firstInvalid,
        firstInvalidFieldId: firstInvalid?.id,
      };
    },
    [
      schema,
      formData,
      isElementCurrentlyVisible,
      validateFieldValue,
      runCustomValidatorsForFields,
      applyFieldErrorUpdates,
      readOnly,
    ],
  );

  const validateAllPages = useCallback(async () => {
    let firstInvalidPageIndex: number | null = null;
    let firstInvalidFieldId: string | undefined;

    for (let pageIndex = 0; pageIndex < schema.pages.length; pageIndex += 1) {
      const result = await validatePage(pageIndex, true);
      if (!result.isValid && firstInvalidPageIndex === null) {
        firstInvalidPageIndex = pageIndex;
        firstInvalidFieldId = result.firstInvalidFieldId;
      }
    }

    return {
      isValid: firstInvalidPageIndex === null,
      firstInvalidPageIndex,
      firstInvalidFieldId,
    } as const;
  }, [schema.pages.length, validatePage]);

  const handleFieldChange = (fieldId: string, value: FormValue) => {
    if (readOnly) return;
    setFormData((prev) => {
      const next = { ...prev, [fieldId]: value };
      return next;
    });
    setFieldErrors((prev) => {
      if (!(fieldId in prev)) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
    if (!hasEmittedStart) {
      setHasEmittedStart(true);
      onFormStarted?.();
    }
  };

  const handleNextPage = async () => {
    const result = await validatePage(currentPageIndex, true);
    if (result.isValid) {
      setCurrentPageIndex((prev) => Math.min(prev + 1, maxPageIndex));
      setImmediate(() => scrollPageTo(0, false));
    } else if (result.firstInvalidFieldId) {
      scrollToField(result.firstInvalidFieldId);
    }
  };

  const handlePreviousPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
    setImmediate(() => scrollToEnd(false));
  };

  const handleSubmit = async () => {
    if (submitting || readOnly || !onSubmit) {
      return;
    }
    setSubmitting(true);

    if (pageCount > 1 && currentPageIndex < maxPageIndex) {
      const result = await validatePage(currentPageIndex, true);
      if (result.isValid) {
        setCurrentPageIndex((prev) => prev + 1);
      } else if (result.firstInvalidFieldId) {
        scrollToField(result.firstInvalidFieldId);
      }
      setSubmitting(false);
      return;
    }

    const { isValid, firstInvalidPageIndex, firstInvalidFieldId } =
      await validateAllPages();
    if (!isValid) {
      if (
        typeof firstInvalidPageIndex === "number" &&
        firstInvalidPageIndex !== currentPageIndex
      ) {
        setCurrentPageIndex(firstInvalidPageIndex);
        // Scroll after page change - use setTimeout to wait for re-render
        if (firstInvalidFieldId) {
          setTimeout(() => scrollToField(firstInvalidFieldId), 100);
        }
      } else if (firstInvalidFieldId) {
        scrollToField(firstInvalidFieldId);
      }
      setSubmitting(false);
      return;
    }

    const sanitizedAnswers = filterAnswersByFieldIds(formData, fieldLookup);
    const submissionPayload: SubmitFormDto = {
      answers: sanitizedAnswers,
      schemaSnapshot: form as unknown as Record<string, unknown>,
      actionId,
      visibilityValidatorResults,
      deviceType: DEVICE_TYPE,
      publicAnswers,
      phDistinctId,
      sessionReplayUrl,
    };

    onSubmit(submissionPayload)
      .then(() => {
        if (persistKey) {
          AsyncStorage.removeItem(storageKey).catch(() => {});
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleAbandon = () => {
    const submissionPayload: SubmitFormDto = {
      answers: formData,
      schemaSnapshot: form as unknown as Record<string, unknown>,
      actionId,
      visibilityValidatorResults,
      deviceType: DEVICE_TYPE,
      publicAnswers,
    };

    onAbandonAction?.(outOfTimeSelected, customReason, submissionPayload);
    setWithdrawOpen(false);
  };

  const currentPage = schema.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === maxPageIndex;

  return (
    <View className="flex flex-col gap-y-2">
      {currentPage?.fields.map((element, idx) => {
        if (!("label" in element)) {
          return (
            <View key={`block-${idx}`}>
              <RenderDisplayBlockMobile
                block={element as DisplayBlock}
                previousAnswerData={previousAnswerData}
                previousAnswerSchemas={previousAnswerSchemas}
              />
            </View>
          );
        }
        const field = element as AnyField;
        if (!isElementCurrentlyVisible(field)) {
          return null;
        }
        return (
          <View
            key={field.id}
            ref={(ref) => {
              if (ref) {
                ref.measure((x, y, width, height, pageX, pageY) => {
                  fieldScreenPositions.current[field.id] = pageY;
                });
              }
            }}
          >
            <RenderField
              field={field}
              value={formData[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
              disabled={readOnly}
              error={fieldErrors[field.id]}
              randomizationKey={randomizationKey}
              disableOptionRandomization={disableOptionRandomization}
            />
          </View>
        );
      })}
      {readOnly && pageCount > 1 && (
        <View>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm text-zinc-500">
              Page {currentPageIndex + 1} of {pageCount}
            </Text>
          </View>
          <View className="flex-row gap-3">
            {!isFirstPage && (
              <Button
                onPress={handlePreviousPage}
                color={ButtonColor.Outline}
                size={ButtonSize.Medium}
                className="flex-1"
                title="Back"
              />
            )}
            {!isLastPage && (
              <Button
                onPress={() => {
                  setCurrentPageIndex((prev) =>
                    Math.min(prev + 1, maxPageIndex),
                  );
                  setImmediate(() => scrollPageTo(0, false));
                }}
                color={ButtonColor.Black}
                size={ButtonSize.Medium}
                className="flex-1"
                title="Next"
              />
            )}
          </View>
        </View>
      )}
      {!readOnly && (
        <View>
          <View className="">
            <View className="flex-row justify-between items-center mb-3">
              {pageCount > 1 ? (
                <Text className="text-sm text-zinc-500">
                  Page {currentPageIndex + 1} of {pageCount}
                </Text>
              ) : null}
            </View>
            <View className="flex-row gap-3">
              {!isFirstPage && (
                <Button
                  onPress={handlePreviousPage}
                  color={ButtonColor.Outline}
                  size={ButtonSize.Medium}
                  className="flex-1"
                  disabled={submitting}
                  title="Back"
                />
              )}
              <Button
                onPress={isLastPage ? handleSubmit : handleNextPage}
                color={ButtonColor.Black}
                size={ButtonSize.Medium}
                className="flex-2 py-4! gap-x-2"
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    {isLastPage ? (
                      <CircleCheck size={16} color="#fff" strokeWidth={2.5} />
                    ) : null}
                    <Text className="text-white font-medium text-base">
                      {isLastPage ? "Complete" : "Next"}
                    </Text>
                  </>
                )}
              </Button>
              <Button
                onPress={() => setWithdrawOpen(true)}
                color={ButtonColor.Outline}
                size={ButtonSize.Medium}
              >
                <Ellipsis size={15} />
              </Button>
            </View>
          </View>
          {Object.keys(fieldErrors).length > 0 && (
            <View className="flex-row gap-2">
              {Object.entries(fieldErrors).map(([fieldId]) => (
                <Text key={fieldId} className="text-red-500 text-base p-2">
                  Your form has errors. Please fix before submitting.
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {onAbandonAction && (
        <FormModal
          visible={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
        >
          <Text className="text-lg font-semibold text-zinc-900 mb-3">
            Withdraw from action
          </Text>
          <View className="gap-2 mb-3">
            <TouchableOpacity
              activeOpacity={0.8}
              className={cn(
                "border rounded-lg px-3 py-3",
                outOfTimeSelected
                  ? "border-blue-600 bg-blue-100"
                  : "border-zinc-200",
              )}
              onPress={() => {
                setOutOfTimeSelected((prev) => !prev);
                if (!outOfTimeSelected) {
                  setOtherReasonSelected(false);
                }
              }}
            >
              <Text className="text-base text-zinc-900">
                Took more than 15 minutes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              className={cn(
                "border rounded-lg px-3 py-3",
                otherReasonSelected
                  ? "border-blue-600 bg-blue-100"
                  : "border-zinc-200",
              )}
              onPress={() => {
                setOtherReasonSelected((prev) => !prev);
                if (!otherReasonSelected) {
                  setOutOfTimeSelected(false);
                }
              }}
            >
              <Text className="text-base text-zinc-900">Other reason</Text>
            </TouchableOpacity>
          </View>
          {(outOfTimeSelected || otherReasonSelected) && (
            <TextInput
              value={customReason}
              onChangeText={setCustomReason}
              placeholder="Explain in more detail..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="border border-zinc-200 rounded-lg px-3 py-2 h-24 text-base text-zinc-900 mb-3"
            />
          )}
          <View className="w-1/2 self-center">
            <Button
              onPress={handleAbandon}
              color={ButtonColor.Black}
              size={ButtonSize.Large}
              disabled={
                submitting ||
                !(
                  outOfTimeSelected ||
                  (otherReasonSelected && customReason.trim().length > 0)
                )
              }
              title="Withdraw"
            />
          </View>
        </FormModal>
      )}
    </View>
  );
};

export default FormRenderer;
