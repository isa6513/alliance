import {
  type ChangeEvent,
  type ChangeEventHandler,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Cropper, { Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

type ProfileImageEditorProps = {
  initialImageUrl: string | null;
  onChange: (imageDataUrl: string | null) => void;
  allowedMimeTypes: string[];
  maxFileSizeMb?: number;
  className?: string;
};

const DEFAULT_MAX_FILE_SIZE_MB = 20;

const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation: number
) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  const rotRad = getRadianAngle(rotation);
  const { width: imgWidth, height: imgHeight } = image;

  const boundWidth =
    Math.abs(Math.cos(rotRad) * imgWidth) +
    Math.abs(Math.sin(rotRad) * imgHeight);
  const boundHeight =
    Math.abs(Math.sin(rotRad) * imgWidth) +
    Math.abs(Math.cos(rotRad) * imgHeight);

  canvas.width = boundWidth;
  canvas.height = boundHeight;

  ctx.translate(boundWidth / 2, boundHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-imgWidth / 2, -imgHeight / 2);
  ctx.drawImage(image, 0, 0);

  const cropX = Math.round(pixelCrop.x);
  const cropY = Math.round(pixelCrop.y);
  const cropWidth = Math.round(pixelCrop.width);
  const cropHeight = Math.round(pixelCrop.height);

  const data = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  ctx.putImageData(data, 0, 0);

  return canvas.toDataURL("image/png");
};

const areAreasRoughlyEqual = (a: Area | null, b: Area) => {
  if (!a) return false;
  const threshold = 0.5;
  return (
    Math.abs(a.x - b.x) < threshold &&
    Math.abs(a.y - b.y) < threshold &&
    Math.abs(a.width - b.width) < threshold &&
    Math.abs(a.height - b.height) < threshold
  );
};

const ProfileImageEditor: FC<ProfileImageEditorProps> = ({
  initialImageUrl,
  onChange,
  allowedMimeTypes,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
  className,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImageUrl);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCustomImage, setHasCustomImage] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const lastInitialUrlRef = useRef<string | null>(initialImageUrl);
  const lastGeneratedRef = useRef<string | null>(initialImageUrl);
  const hasInteractedRef = useRef(false);
  const lastAreaRef = useRef<Area | null>(null);

  useEffect(() => {
    if (hasCustomImage) return;
    if (initialImageUrl === lastInitialUrlRef.current) return;

    setImageSrc(initialImageUrl);
    setHasEdited(false);
    setCroppedAreaPixels(null);
    setIsGenerating(false);
    setError(null);
    hasInteractedRef.current = false;
    lastAreaRef.current = null;
    lastGeneratedRef.current = initialImageUrl;
    lastInitialUrlRef.current = initialImageUrl;
  }, [initialImageUrl, hasCustomImage]);

  const markAsEdited = useCallback(() => {
    setHasEdited(true);
    setHasCustomImage(true);
    hasInteractedRef.current = true;
  }, []);

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);

      if (!allowedMimeTypes.includes(file.type)) {
        setError("Please select a valid image file.");
        event.target.value = "";
        return;
      }

      const maxBytes = maxFileSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(
          `Image size must be less than ${maxFileSizeMb}MB. Please choose a smaller image.`
        );
        event.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") return;
        setImageSrc(reader.result);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
        setCroppedAreaPixels(null);
        setError(null);
        setIsGenerating(false);
        lastAreaRef.current = null;
        lastGeneratedRef.current = null;
        markAsEdited();
        onChange(null);
      };
      reader.readAsDataURL(file);
    },
    [allowedMimeTypes, markAsEdited, maxFileSizeMb, onChange]
  );

  const handleCropChange = useCallback(
    (position: { x: number; y: number }) => {
      if (!hasInteractedRef.current) {
        const deltaX = Math.abs(position.x - crop.x);
        const deltaY = Math.abs(position.y - crop.y);
        if (deltaX > 0.01 || deltaY > 0.01) {
          markAsEdited();
        }
      }
      setCrop(position);
    },
    [crop, markAsEdited]
  );

  const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    if (areAreasRoughlyEqual(lastAreaRef.current, croppedPixels)) {
      return;
    }
    lastAreaRef.current = croppedPixels;
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleZoomValueChange = useCallback(
    (value: number) => {
      if (!hasInteractedRef.current && Math.abs(value - zoom) > 0.001) {
        markAsEdited();
      }
      setZoom(value);
    },
    [markAsEdited, zoom]
  );

  const handleZoomSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleZoomValueChange(parseFloat(event.target.value));
    },
    [handleZoomValueChange]
  );

  useEffect(() => {
    if (!hasEdited || !imageSrc || !croppedAreaPixels) {
      return;
    }

    let isCancelled = false;
    const generate = async () => {
      setIsGenerating(true);
      try {
        const cropped = await getCroppedImage(
          imageSrc,
          croppedAreaPixels,
          rotation
        );
        if (!isCancelled) {
          if (lastGeneratedRef.current !== cropped) {
            onChange(cropped);
            lastGeneratedRef.current = cropped;
          }
          setError(null);
        }
      } catch {
        if (!isCancelled) {
          setError("Unable to process image. Please try another file.");
        }
      } finally {
        if (!isCancelled) {
          setIsGenerating(false);
        }
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [croppedAreaPixels, hasEdited, imageSrc, onChange, rotation]);

  const handleRotate = useCallback(
    (direction: "left" | "right") => {
      markAsEdited();
      setRotation((prev) => {
        const updated = direction === "left" ? prev - 90 : prev + 90;
        return ((updated % 360) + 360) % 360;
      });
    },
    [markAsEdited]
  );

  const hasImage = Boolean(imageSrc);
  const zoomLabel = useMemo(() => zoom.toFixed(1), [zoom]);
  const containerClassName = useMemo(() => {
    return ["relative w-fit", className].filter(Boolean).join(" ");
  }, [className]);

  return (
    <div className={containerClassName}>
      <div
        className={`relative w-29 h-29 rounded-md overflow-hidden bg-zinc-100 ${
          hasCustomImage ? "" : "group"
        }`}
      >
        {hasImage ? (
          hasCustomImage ? (
            <Cropper
              image={imageSrc!}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              onCropChange={handleCropChange}
              onCropComplete={handleCropComplete}
              onZoomChange={handleZoomValueChange}
              showGrid={false}
            />
          ) : (
            <img
              src={imageSrc ?? undefined}
              alt="Current profile"
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="flex items-center justify-center w-full h-full text-xs text-zinc-400">
            No photo selected
          </div>
        )}

        {!hasCustomImage && (
          <>
            <div className="absolute inset-0 border border-dashed border-zinc-300 rounded-md pointer-events-none"></div>
            <label className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500 bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input
                type="file"
                accept={allowedMimeTypes.join(",")}
                className="hidden"
                onChange={handleFileChange}
              />
              Change photo
            </label>
          </>
        )}
      </div>

      {hasCustomImage && hasImage && (
        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
          <label className="flex items-center gap-2 text-zinc-600">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={handleZoomSliderChange}
            />
            <span>{zoomLabel}x</span>
          </label>
          <button
            type="button"
            className="px-2 py-1 border border-zinc-300 rounded hover:bg-zinc-100"
            onClick={() => handleRotate("left")}
            disabled={isGenerating}
          >
            Rotate left
          </button>
          <button
            type="button"
            className="px-2 py-1 border border-zinc-300 rounded hover:bg-zinc-100"
            onClick={() => handleRotate("right")}
            disabled={isGenerating}
          >
            Rotate right
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ProfileImageEditor;
