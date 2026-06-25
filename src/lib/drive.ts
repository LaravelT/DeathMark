// drive.ts - Client-side Google Drive API integrations

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

/**
 * Searches for a file by name in the appDataFolder.
 */
export async function findFileInAppData(accessToken: string, filename: string): Promise<DriveFile | null> {
  const query = encodeURIComponent(`name = '${filename}' and 'appDataFolder' in parents`);
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,mimeType)`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Google Drive API Search Error:", errorText);
    throw new Error(`Failed to search for file in appDataFolder: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files && data.files.length > 0 ? data.files[0] : null;
}

/**
 * Creates file metadata in the appDataFolder.
 */
export async function createFileMetadata(accessToken: string, name: string): Promise<string> {
  const url = "https://www.googleapis.com/drive/v3/files";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      parents: ["appDataFolder"],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Google Drive API Create Metadata Error:", errorText);
    throw new Error(`Failed to create file metadata: ${res.statusText}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Uploads file content (overwrites or updates) using PATCH media upload.
 */
export async function uploadFileContent(accessToken: string, fileId: string, content: string): Promise<void> {
  const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "text/plain",
    },
    body: content,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Google Drive API Upload Media Error:", errorText);
    throw new Error(`Failed to upload file content: ${res.statusText}`);
  }
}

/**
 * Helper to download raw file content from Drive by fileId.
 */
export async function downloadFileContent(accessToken: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("404");
    }
    const errorText = await res.text();
    console.error("Google Drive API Download Error:", errorText);
    throw new Error(`Failed to download file: ${res.statusText}`);
  }

  return res.text();
}

/**
 * Deletes a file from Google Drive.
 */
export async function deleteFileFromDrive(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Google Drive API Delete Error:", errorText);
    throw new Error(`Failed to delete file: ${res.statusText}`);
  }
}
