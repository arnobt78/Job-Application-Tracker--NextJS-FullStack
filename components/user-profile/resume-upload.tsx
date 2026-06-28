'use client';

/**
 * ResumeUpload — PDF drag-drop / file input for /profile page.
 *
 * Calls uploadResumeAction → pdfjs-dist server-side extraction.
 * On success, invalidates userProfile() query so UserProfileForm
 * auto-refreshes its resumeText textarea (form uses `values:` prop).
 */

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { queryKeys } from '@/lib/query-keys';
import { uploadResumeAction } from '@/utils/actions';
import { cn } from '@/lib/utils';

type UploadState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; charCount: number }
  | { status: 'error'; message: string };

export function ResumeUpload() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: 'idle' });
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    if (state.status === 'loading') return;
    setState({ status: 'loading' });

    const formData = new FormData();
    formData.append('resume', file);

    const result = await uploadResumeAction(formData);

    if (result.success) {
      // Bust userProfile cache → UserProfileForm auto-updates its resumeText
      await queryClient.invalidateQueries({ queryKey: queryKeys.userProfile() });
      setState({ status: 'success', charCount: result.text.length });
    } else {
      setState({ status: 'error', message: result.error });
    }
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Import from PDF
      </p>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 cursor-pointer transition-colors',
          dragging
            ? 'border-primary/60 bg-primary/5'
            : 'border-border hover:border-primary/40 hover:bg-white/[0.02]',
          state.status === 'loading' && 'pointer-events-none opacity-60'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
        />

        {state.status === 'loading' ? (
          <>
            <FileText className="h-6 w-6 animate-pulse text-primary" />
            <p className="text-xs text-muted-foreground">Extracting text…</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground text-center">
              Drop your PDF resume here<br />
              <span className="text-[10px] opacity-60">or click to browse · max 5 MB</span>
            </p>
          </>
        )}
      </div>

      {state.status === 'success' && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-400">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Extracted {state.charCount.toLocaleString()} characters — resume text updated below.
          </span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-400">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {(state.status === 'success' || state.status === 'error') && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start text-xs h-7 text-muted-foreground"
          onClick={() => setState({ status: 'idle' })}
        >
          Try another file
        </Button>
      )}
    </div>
  );
}
