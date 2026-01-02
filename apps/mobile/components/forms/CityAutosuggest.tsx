import React, { useEffect } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { CitySearchDto } from "@alliance/shared/client";
import {
  formatCityDisplay,
  useCityAutosuggest,
} from "@alliance/shared/forms/cityAutosuggest";

type Props = {
  value?: string;
  onSelect: (city: CitySearchDto | string) => void;
  placeholder?: string;
  minLength?: number;
  debounceMs?: number;
  disabled?: boolean;
  allowCustomValue?: boolean;
};

export default function CityAutosuggestMobile({
  value = "",
  onSelect,
  placeholder = "Search a city…",
  minLength = 1,
  debounceMs = 150,
  disabled = false,
  allowCustomValue = true,
}: Props) {
  const {
    query,
    setQuery,
    results,
    open,
    setOpen,
    highlighted,
    setHighlighted,
    selectCity,
    commitCustomValue,
    fetchGeolocation,
  } = useCityAutosuggest({
    value,
    minLength,
    debounceMs,
    allowCustomValue,
    onSelect,
  });

  useEffect(() => {
    if (open) fetchGeolocation();
  }, [open, fetchGeolocation]);

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setOpen(true)}
        disabled={disabled}
        className={`w-full rounded-lg border px-3 py-3 bg-white ${
          disabled ? "opacity-60" : "border-zinc-300"
        }`}
      >
        <TextInput
          value={query}
          onChangeText={(text) => setQuery(text)}
          onFocus={() => setOpen(true)}
          onBlur={commitCustomValue}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          editable={!disabled}
          className="text-base text-zinc-900"
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        onRequestClose={() => setOpen(false)}
        animationType="fade"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-white rounded-t-2xl p-4"
            style={{ maxHeight: 420 }}
            onPress={(e) => e.stopPropagation()}
          >
            <TextInput
              value={query}
              onChangeText={(text) => setQuery(text)}
              placeholder="Search cities..."
              placeholderTextColor="#9ca3af"
              className="border border-zinc-200 rounded-lg px-3 py-2 text-base text-zinc-900 mb-3"
              autoFocus
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {results.length === 0 ? (
                <Text className="text-center text-zinc-500 py-4">
                  No matches
                </Text>
              ) : (
                results.map((city, idx) => {
                  const isActive = idx === highlighted;
                  return (
                    <TouchableOpacity
                      key={`${city.name}-${city.admin1}-${city.countryCode}`}
                      className={`px-3 py-3 rounded-lg mb-2 ${
                        isActive ? "bg-zinc-100" : "bg-white"
                      }`}
                      activeOpacity={0.8}
                      onPress={() => {
                        selectCity(city);
                        setOpen(false);
                      }}
                      onFocus={() => setHighlighted(idx)}
                    >
                      <Text className="text-base text-zinc-900">
                        {formatCityDisplay(city)}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
