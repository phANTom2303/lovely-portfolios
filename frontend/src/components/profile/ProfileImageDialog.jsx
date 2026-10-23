import styles from "./ProfileImageDialog.module.css";
import { useState, useRef } from "react";

function ProfileImageDialog({ currentImage, onSave, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileSelection(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  }

  function handleRemoveSelection() {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({ file: selectedFile, previewUrl });
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <div className={styles.dialogHeader}>
            <h2>Upload profile photo</h2>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={!selectedFile && previewUrl === currentImage}
              >
                Save
              </button>
            </div>
          </div>

          <div className={styles.formBody}>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.fileInput}
              accept="image/*"
              onChange={handleFileChange}
            />

            {!previewUrl ? (
              <div
                className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <p className={styles.dropzoneText}>
                  Select a file or drag to upload
                </p>
                <button
                  type="button"
                  className={styles.selectFileButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Select a file
                </button>
                <span className={styles.fileHint}>
                  Supports PNG, JPG, JPEG, WEBP
                </span>
              </div>
            ) : (
              <div className={styles.previewContainer}>
                <div className={styles.previewImageWrapper}>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className={styles.previewImage}
                  />
                </div>
                <div className={styles.previewInfo}>
                  {selectedFile && (
                    <span className={styles.fileName}>
                      {selectedFile.name}
                    </span>
                  )}
                  <div className={styles.previewActions}>
                    <button
                      type="button"
                      className={styles.changeButton}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change file
                    </button>
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={handleRemoveSelection}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileImageDialog;
