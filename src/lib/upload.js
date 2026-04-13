import axios from "axios";
import { toast } from "react-toastify";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const upload = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary credentials not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  // Size guard: 10 MB max
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image too large. Please choose a file under 10 MB.");
  }

  const toastId = toast.loading("Uploading image…", { closeButton: false });

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "nexchat");

    const response = await axios.post(
      // Use /image/upload for image files; /auto/upload can fail on some presets
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 100);
          toast.update(toastId, { render: `Uploading… ${pct}%` });
        },
      }
    );

    toast.update(toastId, {
      render: "Image uploaded ✓",
      type: "success",
      isLoading: false,
      autoClose: 1800,
      closeButton: true,
    });

    return response.data.secure_url;
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message || "Upload failed";
    toast.update(toastId, {
      render: `Upload failed: ${msg}`,
      type: "error",
      isLoading: false,
      autoClose: 4000,
      closeButton: true,
    });
    throw new Error(msg);
  }
};

export default upload;
