import ImageUpload from "@/components/ImageUpload";
import Head from "next/head";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>OCR Image Upload</title>
      </Head>
      <h1 className="text-2xl font-bold text-center mb-8">OCR Image Upload</h1>
      <ImageUpload />
    </div>
  );
}
