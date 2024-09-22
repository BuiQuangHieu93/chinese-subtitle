"use client";
import Image from "next/image";
import React, { useState } from "react";

// Define the structure of the server response
interface UploadResponse {
  results: Array<{ filename: string; message: string }>;
  error?: string;
}

const ImageUpload = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previewURLs, setPreviewURLs] = useState<string[]>([]);
  const [result, setResult] = useState<
    Array<{ filename: string; message: string }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedImages: File[] = Array.from(e.target.files);
      setImages(selectedImages);

      // Generate preview URLs for selected images
      const imagePreviews: string[] = selectedImages.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewURLs(imagePreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach((image: File) => {
      formData.append("files", image);
    });

    setIsLoading(true); // Set loading to true when the request starts

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await res.json();
      if (res.ok) {
        setResult(data.results); // Set the result with filename and message
      } else {
        setResult([]);
      }
    } catch (err) {
      console.error("Error:", err);
      setResult([]);
    } finally {
      setIsLoading(false); // Set loading to false when the request is done
    }
  };

  // Function to copy all result messages to the clipboard
  const handleCopyResults = () => {
    const allMessages = result.map((res) => res.message).join("\n");
    navigator.clipboard.writeText(allMessages).then(
      () => {
        alert("Messages copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="mb-4 w-full p-2 border border-gray-300"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded"
          disabled={isLoading} // Disable button while loading
        >
          {isLoading ? "Uploading..." : "Upload and Process"}
        </button>
      </form>

      {isLoading && (
        <div className="mt-4 flex justify-center items-center">
          {/* Loading Spinner */}
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l-2.5-2.5a8.035 8.035 0 01-2.5 2.5L4 17.291z"
            />
          </svg>
          <p className="ml-2 text-blue-500">Processing...</p>
        </div>
      )}

      {previewURLs.length > 0 && !isLoading && (
        <div className="mt-4">
          <p>Image Previews and Results:</p>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="font-bold">Filename</div>
            <div className="font-bold">Image</div>
            <div className="font-bold">Processing Result</div>
            {result.map((res, index) => (
              <React.Fragment key={index}>
                {/* Filename */}
                <div className="flex items-center">{res.filename}</div>

                {/* Image Preview */}
                <div className="w-32 h-32 relative">
                  <Image
                    src={previewURLs[index]}
                    alt={`Preview ${index}`}
                    className="object-cover"
                    fill
                  />
                </div>

                {/* Processing Result */}
                <div className="flex items-center">
                  {typeof res.message === "string"
                    ? res.message
                    : JSON.stringify(res.message)}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Copy results button */}
          <div className="flex w-full justify-center">
            <button
              onClick={handleCopyResults}
              className="mt-4 bg-green-500 text-white py-2 px-4 rounded"
            >
              Copy All Results
            </button>
          </div>
        </div>
      )}

      {result.length === 0 && !isLoading && (
        <p className="mt-4">No results to display.</p>
      )}
    </div>
  );
};

export default ImageUpload;
