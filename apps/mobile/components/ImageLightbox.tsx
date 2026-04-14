import { useState } from "react";
import { Dimensions, Image, Modal, TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";

interface ImageLightboxModalProps {
  uri: string | null;
  onClose: () => void;
}

export function ImageLightboxModal({ uri, onClose }: ImageLightboxModalProps) {
  const { width, height } = Dimensions.get("window");
  const lightboxSize = Math.min(width * 0.9, height * 0.7);

  return (
    <Modal
      visible={!!uri}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/80 items-center justify-center"
        onPress={onClose}
        activeOpacity={1}
      >
        <View className="max-w-[90%] max-h-[80%]">
          {uri && (
            <Image
              source={{ uri }}
              style={{ width: lightboxSize, height: lightboxSize }}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            onPress={onClose}
            className="absolute -top-10 right-0"
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface ImageLightboxProps {
  uris: string[];
  thumbnailClassName?: string;
}

export default function ImageLightbox({
  uris,
  thumbnailClassName = "w-24 h-24 rounded",
}: ImageLightboxProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxSrc = lightboxIndex !== null ? uris[lightboxIndex] : null;

  return (
    <>
      {uris.map((uri, idx) => (
        <TouchableOpacity
          key={`${uri}-${idx}`}
          onPress={() => setLightboxIndex(idx)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri }}
            className={thumbnailClassName}
            resizeMode="cover"
          />
        </TouchableOpacity>
      ))}
      <ImageLightboxModal
        uri={lightboxSrc}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}
