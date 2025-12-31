import React, { useMemo, useState, useEffect } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ChevronDown, Check } from "lucide-react-native";
import {
  TZ_OPTIONS,
  formatNowTimeInTz,
  getOffsetMinutes,
  getGenericLabelFromIntl,
  prettyCityFromIana,
} from "@alliance/shared/lib/timezones";

type TimeZoneValue = string;

interface TimeZoneSelectProps {
  value?: TimeZoneValue;
  defaultValue?: TimeZoneValue;
  onChange?: (tz: TimeZoneValue) => void;
  placeholder?: string;
  disabled?: boolean;
  hour12?: boolean;
}

type Item = {
  tz: string;
  labelLeft: string;
  searchText: string;
  offsetMins: number | null;
};

export default function TimeZoneSelect({
  value,
  defaultValue = "America/Los_Angeles",
  onChange,
  placeholder = "Select time zone…",
  disabled,
  hour12 = true,
}: TimeZoneSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internalValue, setInternalValue] = useState<TimeZoneValue>(
    value ?? defaultValue
  );

  useEffect(() => {
    if (value != null) setInternalValue(value);
  }, [value]);

  // Tick every 30s so displayed times stay fresh
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((x) => x + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const allItems = useMemo<Item[]>(() => {
    const tzs = TZ_OPTIONS.map((tz) => tz.tz);

    const items: Item[] = tzs.map((tz) => {
      const generic = getGenericLabelFromIntl(tz);
      const city = prettyCityFromIana(tz);
      const left = generic ? `${generic} — ${city}` : city;
      const offsetMins = getOffsetMinutes(tz);

      return {
        tz,
        labelLeft: `${left}`.trim(),
        searchText: `${left} ${tz}`.toLowerCase(),
        offsetMins,
      };
    });

    items.sort(
      (a, b) =>
        (a.offsetMins ?? 0) - (b.offsetMins ?? 0) ||
        a.labelLeft.localeCompare(b.labelLeft)
    );

    return items;
  }, []);

  const selected = useMemo(() => {
    return (
      allItems.find((i) => i.tz === internalValue) ?? {
        tz: internalValue,
        labelLeft: internalValue,
        searchText: internalValue.toLowerCase(),
        offsetMins: getOffsetMinutes(internalValue),
      }
    );
  }, [allItems, internalValue]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allItems.filter((i) => i.searchText.includes(q)) : allItems;
  }, [allItems, query]);

  const commit = (tz: string) => {
    if (disabled) return;
    if (value == null) setInternalValue(tz);
    onChange?.(tz);
    setOpen(false);
    setQuery("");
  };

  const inputClasses =
    "flex-row items-center justify-between border border-zinc-300 rounded-lg bg-white px-3 py-3";

  return (
    <View>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => !disabled && setOpen(true)}
        className={`${inputClasses} ${disabled ? "opacity-50" : ""}`}
        activeOpacity={0.8}
      >
        <View className="flex-1 mr-3">
          <Text className="text-base text-zinc-900" numberOfLines={1}>
            {selected.labelLeft || placeholder}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-sm text-zinc-600">
            {formatNowTimeInTz(selected.tz, hour12)}
          </Text>
          <ChevronDown size={16} color="#71717a" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setOpen(false);
          setQuery("");
        }}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-2xl max-h-[70%]">
            <View className="p-4 border-b border-zinc-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-semibold text-zinc-900">
                  Select Time Zone
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Text className="text-blue-600 font-medium">Close</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                className="border border-zinc-200 rounded-lg px-3 py-2 text-base"
                value={query}
                onChangeText={setQuery}
                placeholder="Search time zones…"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView className="px-4">
              {filtered.length === 0 ? (
                <View className="py-4">
                  <Text className="text-zinc-500 text-center">No matches</Text>
                </View>
              ) : (
                filtered.map((item) => {
                  const isSelected = item.tz === selected.tz;
                  const time = formatNowTimeInTz(item.tz, hour12);

                  return (
                    <TouchableOpacity
                      key={item.tz}
                      onPress={() => commit(item.tz)}
                      className={`py-3 flex-row items-center justify-between border-b border-zinc-100 ${
                        isSelected ? "bg-green-50" : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className="flex-1 text-base text-zinc-900 mr-2"
                        numberOfLines={1}
                      >
                        {item.labelLeft}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm tabular-nums text-zinc-600">
                          {time}
                        </Text>
                        {isSelected && (
                          <Check size={18} color="#16a34a" strokeWidth={3} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
              <View className="h-8" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
