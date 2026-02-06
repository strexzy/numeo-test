import axios from "axios";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const OPENAPI_KEY = process.env.OPENAPI_KEY;

if (!OPENAPI_KEY) {
  throw new Error("OPENAPI_KEY is required");
}

export const handleAudioTranslation = async (
  audioBuffer: Buffer,
): Promise<string> => {
  const arrayBuffer = audioBuffer.buffer.slice(
    audioBuffer.byteOffset,
    audioBuffer.byteOffset + audioBuffer.byteLength,
  );

  const tempFilePath = path.join(os.tmpdir(), `audio_${Date.now()}.webm`);
  fs.writeFileSync(tempFilePath, audioBuffer);

  try {
    const formData = new FormData();
    const uint8Array = new Uint8Array(audioBuffer);
    const fileBlob = new Blob([uint8Array], { type: "audio/webm" });
    formData.append("file", fileBlob, "recording.webm");
    formData.append("model", "whisper-1");
    formData.append("response_format", "text");
    formData.append("language", "en");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/translations",
      formData,
      {
        headers: {
          Authorization: `Bearer ${OPENAPI_KEY}`,
          // FormData will set correct header automaticly
        },
      },
    );

    return response.data.trim();
  } finally {
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
};
