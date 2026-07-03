'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/ui/Modal';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import type { Word } from '@/shared/lib/types';

const difficultyOptions = [
  { value: 'INICIAL', label: 'Inicial' },
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
  { value: 'EXPERTO', label: 'Experto' },
];

const wordSchema = z.object({
  text: z.string().min(1, 'Falta la palabra').max(15, 'Máximo 15 caracteres').regex(/^[a-zA-ZáéíóúüñÑ0-9\s\-]+$/, 'Solo letras, números y espacios'),
  difficultyLabel: z.enum(['INICIAL', 'BASICO', 'INTERMEDIO', 'AVANZADO', 'EXPERTO'], {
    message: 'Selecciona una dificultad',
  }),
  isActive: z.boolean().optional(),
});

export type WordFormData = z.infer<typeof wordSchema>;

interface WordFormProps {
  onSubmit: (data: WordFormData, imageFile?: File, audioFile?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  word?: Word | null;
}

export function WordForm({ onSubmit, onCancel, isLoading, word }: WordFormProps) {
  const isEdit = !!word;
  const { addToast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Audio: modo exclusivo — upload O grabación
  const [audioMode, setAudioMode] = useState<'upload' | 'record' | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const existingImageUrl = word?.imageUrl ?? null;
  const existingAudioUrl = word?.audioUrl ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WordFormData>({
    resolver: zodResolver(wordSchema),
    mode: 'onChange',
    defaultValues: {
      text: word?.text ?? '',
      difficultyLabel: (word?.difficultyLabel as WordFormData['difficultyLabel']) ?? 'BASICO',
      isActive: word?.isActive ?? true,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSelectUpload = () => {
    setAudioMode('upload');
    setRecordedBlob(null);
    setRecordingStatus('idle');
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const handleSelectRecord = () => {
    setAudioMode('record');
    setAudioFile(null);
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioFile(e.target.files?.[0] ?? null);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        setRecordingStatus('preview');
        setRecordingDuration(0);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setRecordingStatus('recording');

      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
    } catch {
      setRecordingStatus('idle');
      addToast('error', 'Error de micrófono', 'No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleResetRecording = () => {
    setRecordedBlob(null);
    setRecordingStatus('idle');
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  // Cleanup media resources on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const onInvalid = () => {
    addToast('error', 'El formulario se llenó incorrectamente');
    for (const [, error] of Object.entries(errors)) {
      if (error?.message && typeof error.message === 'string') {
        addToast('error', error.message);
      }
    }
  };

  const handleFormSubmit = (data: WordFormData) => {
    const hasImage = isEdit ? !!existingImageUrl || !!imageFile : !!imageFile;
    const hasExistingAudio = isEdit && !!existingAudioUrl;
    const hasNewAudio = hasExistingAudio || audioFile || recordedBlob;
    // En create, el usuario debe elegir explícitamente upload o record
    const audioChosen = isEdit ? hasNewAudio : audioMode !== null;
    const hasAnyAudio = isEdit ? audioChosen : audioMode !== null && (!!audioFile || !!recordedBlob);

    if (!hasImage) {
      addToast('error', 'Falta la imagen');
      return;
    }
    if (!hasAnyAudio) {
      addToast('error', 'Falta el audio', isEdit ? 'Selecciona subir archivo o grabar audio.' : 'Elige subir un archivo de audio o grabarlo con el micrófono.');
      return;
    }

    let finalAudioFile: File | undefined;
    if (audioMode === 'record' && recordedBlob) {
      finalAudioFile = new File([recordedBlob], 'grabacion.webm', { type: recordedBlob.type });
    } else if (audioMode === 'upload' && audioFile) {
      finalAudioFile = audioFile;
    }
    // En edit, si no hay archivo nuevo pero existe audio previo, no mandamos archivo (se conserva)

    onSubmit(data, imageFile ?? undefined, finalAudioFile);
  };

  const imageSrc = imagePreview ?? existingImageUrl;

  return (
    <Modal>
      <div className="modal-content max-w-[520px] w-full">
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Editar Palabra' : 'Crear Palabra'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit(handleFormSubmit, onInvalid)}>
          <div className="modal-body flex flex-col gap-[16px]">
            <Input
              label="Palabra"
              placeholder="Ej: sol, luna, pez"
              disabled={isLoading}
              error={errors.text?.message}
              maxLength={15}
              {...register('text')}
            />

            <div className="w-full flex flex-col">
              <label className="label">Dificultad</label>
              <select
                disabled={isLoading}
                className={`input ${errors.difficultyLabel ? 'input-error' : ''}`}
                {...register('difficultyLabel')}
              >
                {difficultyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.difficultyLabel && (
                <span className="error-message">{errors.difficultyLabel.message}</span>
              )}
            </div>

            <div className="w-full flex flex-col">
              <label className="label-auth">
                Imagen <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-[12px]">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt="Vista previa"
                    className="w-[64px] h-[64px] rounded-[12px] object-cover border border-secondary-200"
                  />
                ) : (
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">image</span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                    onChange={handleImageChange}
                    className="text-[14px] text-secondary-700 file:mr-[12px] file:py-[8px] file:px-[16px] file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-primary-100 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-200"
                  />
                  <p className="text-[11px] text-secondary-500 mt-[6px]">PNG, JPG o WEBP. Se redimensionará a 400x400px.</p>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col">
              <label className="label-auth">
                Audio <span className="text-red-500">*</span>
              </label>

              {/* Selector de modo: upload o record */}
              {!existingAudioUrl && (
                <div className="flex gap-[8px] mb-[12px]">
                  <button
                    type="button"
                    onClick={handleSelectUpload}
                    className={`btn btn-sm ${audioMode === 'upload' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-[6px]`}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectRecord}
                    className={`btn btn-sm ${audioMode === 'record' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-[6px]`}
                    disabled={isLoading}
                  >
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                    Grabar audio
                  </button>
                </div>
              )}

              {/* Audio existente en edición */}
              {existingAudioUrl && !audioFile && !recordedBlob && (
                <div className="flex items-center gap-[12px]">
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">mic</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-primary-600">Audio existente</p>
                    <div className="flex gap-[8px] mt-[8px]">
                      <button
                        type="button"
                        onClick={handleSelectUpload}
                        className={`btn btn-sm ${audioMode === 'upload' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-[6px]`}
                        disabled={isLoading}
                      >
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Reemplazar
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectRecord}
                        className={`btn btn-sm ${audioMode === 'record' ? 'btn-primary' : 'btn-secondary'} inline-flex items-center gap-[6px]`}
                        disabled={isLoading}
                      >
                        <span className="material-symbols-outlined text-[18px]">mic</span>
                        Grabar nuevo
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload mode */}
              {audioMode === 'upload' && (
                <div className="flex items-center gap-[12px]">
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">mic</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="audio/*"
                      disabled={isLoading}
                      onChange={handleAudioChange}
                      className="text-[14px] text-secondary-700 file:mr-[12px] file:py-[8px] file:px-[16px] file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-primary-100 file:text-primary-700 file:cursor-pointer hover:file:bg-primary-200"
                    />
                    {audioFile && (
                      <p className="text-[12px] text-primary-600 mt-[6px]">{audioFile.name}</p>
                    )}
                    <p className="text-[11px] text-secondary-500 mt-[6px]">MP3, WAV o OGG.</p>
                  </div>
                </div>
              )}

              {/* Record mode */}
              {audioMode === 'record' && (
                <div className="flex items-center gap-[12px]">
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">mic</span>
                  </div>
                  <div className="flex-1">
                    {recordingStatus === 'idle' && (
                      <div>
                        <button
                          type="button"
                          onClick={handleStartRecording}
                          className="btn btn-secondary btn-sm inline-flex items-center gap-[6px]"
                          disabled={isLoading}
                        >
                          <span className="material-symbols-outlined text-[18px]">mic</span>
                          Empezar grabación
                        </button>
                        <p className="text-[11px] text-secondary-500 mt-[6px]">Graba audio directamente desde el navegador.</p>
                      </div>
                    )}
                    {recordingStatus === 'recording' && (
                      <div className="flex items-center gap-[12px]">
                        <span className="w-[12px] h-[12px] rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[14px] font-mono text-red-600">
                          {String(Math.floor(recordingDuration / 60)).padStart(2, '0')}:
                          {String(recordingDuration % 60).padStart(2, '0')}
                        </span>
                        <button
                          type="button"
                          onClick={handleStopRecording}
                          className="btn btn-secondary btn-sm"
                        >
                          Detener
                        </button>
                      </div>
                    )}
                    {recordingStatus === 'preview' && recordedBlob && (
                      <div className="flex flex-col gap-[8px]">
                        <audio
                          src={URL.createObjectURL(recordedBlob)}
                          controls
                          className="w-full max-w-[280px]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleResetRecording();
                            handleSelectRecord();
                          }}
                          className="text-[13px] text-primary-600 hover:text-primary-700 font-medium self-start"
                        >
                          Volver a grabar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Estado inicial: ningún modo seleccionado */}
              {!audioMode && !existingAudioUrl && (
                <div className="flex items-center gap-[12px]">
                  <div className="w-[64px] h-[64px] rounded-[12px] bg-secondary-100 border border-secondary-200 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[28px] text-secondary-400">mic</span>
                  </div>
                  <p className="text-[13px] text-secondary-500">Elegí cómo agregar el audio.</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-[8px]">
              <input
                type="checkbox"
                id="isActiveEdit"
                disabled={isLoading}
                {...register('isActive')}
                className="w-[16px] h-[16px] rounded border-secondary-300"
              />
              <label htmlFor="isActiveEdit" className="text-[14px] text-secondary-700 cursor-pointer">
                Palabra activa
              </label>
            </div>
          </div>

          <div className="modal-footer flex justify-end gap-[12px]">
            <Button variant="secondary" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
