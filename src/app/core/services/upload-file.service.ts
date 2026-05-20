import { Injectable, inject } from '@angular/core';

import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class UploadFileService {
  private storage = inject(Storage);

  async uploadFile(file: File, folder: string): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    const fileRef = ref(this.storage, filePath);

    const uploadTask = uploadBytesResumable(fileRef, file);

    return new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',

        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          console.log(`Upload Progress: ${progress}%`);
        },

        (error) => {
          console.error('Upload Error:', error);

          reject(error);
        },

        async () => {
          try {
            const downloadURL = await getDownloadURL(fileRef);

            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        },
      );
    });
  }
}
