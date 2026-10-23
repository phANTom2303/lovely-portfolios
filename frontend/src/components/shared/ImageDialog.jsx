import styles from "./ImageDialog.module.css";
import { useState, useRef } from "react";

function ImageDialog({ image, titleText, onSave, onDelete, onClose }) {
  const [formData, setFormData] = useState({
    title: image?.title || "",
    description: image?.description || "",
    url: image?.url || "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  function handleFileSelection(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFormData((previous) => ({
      ...previous,
      url: objectUrl,
    }));
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

  function handleRemoveImage() {
    setSelectedFile(null);
    setFormData((previous) => ({ ...previous, url: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!formData.url) return;
    onSave({
      id: image?.id || crypto.randomUUID(),
      title: formData.title.trim() || "Image",
      description: formData.description.trim(),
      url: formData.url,
      file: selectedFile,
    });
  }

  const defaultTitle = image ? "Edit Image" : "Add Image";

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.dialog}
        onClick={(event) => event.stopPropagation()}
      >
        <form className={styles.dialogForm} onSubmit={handleSubmit}>
          <div className={styles.dialogHeader}>
            <h2>{titleText || defaultTitle}</h2>
            <div className={styles.headerActions}>
              {image && onDelete && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => onDelete(image.id)}
                >
                  Delete
                </button>
              )}
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
                disabled={!formData.url}
              >
                {image ? "Save" : "Add"}
              </button>
            </div>
          </div>

          <div className={styles.formBody}>
            <div className={styles.formField}>
              <label htmlFor="sharedImgTitle">Title</label>
              <input
                id="sharedImgTitle"
                type="text"
                placeholder="e.g. Architecture Diagram, Demo Screenshot"
                value={formData.title}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formField}>
              <label htmlFor="sharedImgDesc">Description (optional)</label>
              <input
                id="sharedImgDesc"
                type="text"
                placeholder="Brief explanation"
                value={formData.description}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
              />
            </div>

            <div className={styles.formField}>
              <label>Image</label>
              <input
                type="file"
                ref={fileInputRef}
                className={styles.fileInput}
                accept="image/*"
                onChange={handleFileChange}
              />

              {!formData.url ? (
                <div
                  className={`${styles.dropzone} ${
                    isDragging ? styles.dropzoneActive : ""
                  }`}
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
                </div>
              ) : (
                <div className={styles.previewContainer}>
                  <div className={styles.previewImageWrapper}>
                    <img
                      src={formData.url}
                      alt="Preview"
                      className={styles.previewImage}
                    />
                  </div>
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
                      onClick={handleRemoveImage}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ImageDialog;
