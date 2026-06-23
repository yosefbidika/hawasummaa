'use client';

import { useState } from 'react';
import { uploadImage, previewImage } from '@/services/storage';

export default function ImageUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Max size is 5MB.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const previewUrl = await previewImage(file);
      setPreview(previewUrl);

      const result = await uploadImage(file);

      if (result.success) {
        onUpload(result.imageUrl, result.imageId);
      } else {
        setError(result.error || 'Upload failed');
        setPreview(null);
      }
    } catch (err) {
      setError('Upload error occurred');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    setError('');
  };

  return (
    <div style={{ marginTop: '12px' }}>

      {/* TITLE / LABEL */}
      <div style={{ marginBottom: '6px' }}>
        <p style={{ fontSize: '13px', color: '#ccc', margin: 0 }}>
          Add image (optional)
        </p>
      </div>

      {/* UPLOAD BOX */}
      {!preview ? (
        <div
          onClick={() => document.getElementById('fileInput').click()}
          style={{
            width: '90px',
            height: '90px',
            border: '2px dashed #555',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: '#111',
            color: '#aaa',
            fontSize: '22px',
            transition: '0.2s',
            flexDirection: 'column',
          }}
        >
          +
          <span style={{ fontSize: '10px', marginTop: '4px' }}>
            upload
          </span>

          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        // PREVIEW
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={preview}
            alt="preview"
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '10px',
              objectFit: 'cover',
            }}
          />

          <button
            onClick={clearImage}
            style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              border: 'none',
              background: '#ef4444',
              color: '#fff',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* STATUS */}
      {uploading && (
        <p style={{ fontSize: '11px', color: '#aaa', marginTop: '5px' }}>
          Uploading...
        </p>
      )}

      {error && (
        <p style={{ color: '#f87171', fontSize: '11px', marginTop: '5px' }}>
          {error}
        </p>
      )}
    </div>
  );
}