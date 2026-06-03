import { type InputHTMLAttributes } from "react";
import { ImageUp, Upload } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  src?: string;
  clear?: () => void;
  register: UseFormRegisterReturn;
}

const UploadButton = ({ src, register }: Props) => {
  return (
    <div className="flex gap-4 justify-between items-end">
      <label
        className="w-18 h-18 shrink-0 text-gray-400 hover:text-gray-300 bg-gray-700
          rounded-full cursor-pointer overflow-hidden relative inline-flex items-center 
          justify-center"
      >
        {src ? (
          <img src={src} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <ImageUp size={"40%"} />
        )}
        <input
          type="file"
          accept="image/*"
          {...register}
          style={{ display: "none" }}
        />

        {src && (
          <div className="fixed text-white text-xs" style={{ display: "none" }}>
            <Upload size={12} />
          </div>
        )}
      </label>
    </div>
  );
};

export default UploadButton;
