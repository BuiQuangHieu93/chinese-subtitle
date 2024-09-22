from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR
from PIL import Image, ImageEnhance
import io
import logging
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os


app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize PaddleOCR for simplified Chinese
ocr = PaddleOCR(use_angle_cls=True, lang='ch')


def preprocess_image(image: Image.Image):
    width, height = image.size
    image = image.resize((width * 2, height * 2))
    enhancer = ImageEnhance.Contrast(image)
    return enhancer.enhance(2.5)



@app.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    results = []

    for file in files:
        try:
            # Read the image file bytes
            image_bytes = await file.read()
            # Open the image using PIL
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Preprocess the image
            image = preprocess_image(image)

            # Save image temporarily for PaddleOCR processing
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_image:
                temp_image_name = temp_image.name
                image.save(temp_image_name)

            # Perform OCR using PaddleOCR
            ocr_result = ocr.ocr(temp_image_name, cls=True)

            # Delete the temporary file after use
            os.remove(temp_image_name)

            # Extract text from OCR result
            paddle_text = " ".join([line[1][0] for line in ocr_result[0]])

            # Log the detected text for debugging
            print(f"Detected text from OCR for {file.filename}: {paddle_text}")

          
            if paddle_text:
                results.append({"filename": file.filename, "message": paddle_text})
            else:
                results.append({"filename": file.filename, "message": "No Chinese text detected."})

        except Exception as e:
            # Log any exceptions for debugging
            logging.error(f"Error processing image {file.filename}: {e}")
            results.append({"filename": file.filename, "error": "Error processing image."})

    return JSONResponse(content={"results": results})
