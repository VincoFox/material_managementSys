'use server';
import { Storage } from '@google-cloud/storage';
import {
  GCP_PROJECT_ID,
  GCP_KEY_FILE,
  GCP_BUCKET_NAME,
  GCP_BUCKET_FOLDER,
  GCP_SIGN_URL_EXPIRES,
} from '@/config';
import { getYYYYMMDDFormat } from '@/lib/datetime';

// 初始化 Google Cloud Storage
const storage = new Storage({
  projectId: GCP_PROJECT_ID,
  keyFilename: GCP_KEY_FILE,
});

function getFilePath(fileName: string) {
  let localFileName = fileName || `${Date.now().toString()}.mp4`;
  // 设置文件在 GCS 中的路径（日期文件夹 + 文件名）
  return `${GCP_BUCKET_FOLDER}/${getYYYYMMDDFormat()}/${localFileName}`;
}

export async function getSignedUrl(filePath: string) {
  if (!filePath) {
    throw new Error('filePath is required');
  }
  const [bucketName, ...filePathArray] = filePath.split('/');
  const fileName = filePathArray.join('/');
  // 检查是否已经获取过该视频的 URL
  const currentDate = new Date();

  const bucket = storage.bucket(bucketName);
  const file = bucket.file(fileName);

  // 生成签名 URL，有效期设为15分钟
  const expires = currentDate.getTime() + 15 * 60 * 1000;
  const [signedUrl] = await file.getSignedUrl({
    action: 'read',
    expires,
    responseDisposition: `attachment`, // 强制下载
  });
  console.log('[getVideo] signedUrl', signedUrl);
  return { url: signedUrl, expires };
}

export async function getUploadUrl(
  fileName: string,
  fileType: string = 'video/mp4'
) {
  try {
    const filePath = getFilePath(fileName);
    const bucket = storage.bucket(GCP_BUCKET_NAME!);
    const file = bucket.file(filePath); // 生成预签名 URL 的配置

    const expires = Number(GCP_SIGN_URL_EXPIRES);
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write', // 表示允许上传
      expires: Date.now() + (isNaN(expires) ? 15 * 60 * 1000 : expires), // URL 有效期，例如 15 分钟
      contentType: fileType, // 指定文件类型
    });
    return { uploadUrl, filePath: `${GCP_BUCKET_NAME}/${filePath}` };
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate video URL');
  }
}
