import { imagesUploadImage } from "@alliance/shared/client";
import Button, { ButtonColor } from "@alliance/shared/ui/Button";
import React, { useState } from "react";

const ImageUpload: React.FC = () => {
  const [file, setFile] = useState<string | null>(null);
  const [key, setKey] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFile(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const { data } = await imagesUploadImage({
        body: { file },
      });
      if (data) {
        console.log(data);
        setKey(data.url);
      }
    }
  };

  return (
    <div className="p-8">
      <input
        type="file"
        onChange={handleFileChange}
        className="border bg-zinc-200 rounded cursor-pointer"
      />
      <Button color={ButtonColor.Black} onClick={handleUpload}>
        Upload
      </Button>
      {key && <img src={key} alt="uploaded image" />}
    </div>
  );
};

export default ImageUpload;
