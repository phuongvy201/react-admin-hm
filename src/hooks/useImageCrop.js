import { useState } from "react";

export const useImageCrop = () => {
  const [image, setImage] = useState("");
  const [cropData, setCropData] = useState("");
  const [cropper, setCropper] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCropData = () => {
    if (cropper) {
      const cropDataUrl = cropper.getCroppedCanvas().toDataURL();
      setCropData(cropDataUrl);
      setShowCropper(false);
    }
  };

  return {
    image,
    cropData,
    cropper,
    showCropper,
    setCropper,
    setShowCropper,
    handleImageChange,
    getCropData,
  };
};
