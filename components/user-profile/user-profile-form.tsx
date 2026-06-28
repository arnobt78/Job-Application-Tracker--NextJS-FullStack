'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { useState, KeyboardEvent } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, User, Briefcase, FileText, Sparkles } from 'lucide-react';
import { queryKeys } from '@/lib/query-keys';
import { getUserProfileAction } from '@/utils/actions';
import { useUserProfileMutation } from '@/hooks/useUserProfileMutation';

// Experience level options — mirrors Prisma UserProfile experienceLevel field
const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 yrs)' },
  { value: 'mid', label: 'Mid Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5-10 yrs)' },
  { value: 'staff', label: 'Staff / Lead (10+ yrs)' },
  { value: 'principal', label: 'Principal / Director' },
] as const;

const userProfileSchema = z.object({
  skillsInput: z.string(),
  targetRolesInput: z.string(),
  experienceLevel: z.string().nullable(),
  resumeText: z.string().nullable(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;

/** Tag pill — shows a skill or role with remove button */
function TagPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 pr-1 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-white/20 transition"
        aria-label={`Remove ${label}`}
      >
        <X className="h-2.5 w-2.5" />
      </button>
    </Badge>
  );
}

/** Tag input — press Enter or comma to add a tag */
function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
  inputValue,
  onInputChange,
}: {
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder?: string;
  inputValue: string;
  onInputChange: (value: string) => void;
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = inputValue.trim().replace(/,$/, '');
      if (trimmed && !tags.includes(trimmed)) {
        onAdd(trimmed);
        onInputChange('');
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-background/50 p-2 min-h-[2.5rem] focus-within:ring-1 focus-within:ring-ring">
      {tags.map((tag, i) => (
        <TagPill key={`${tag}-${i}`} label={tag} onRemove={() => onRemove(i)} />
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Commit remaining text on blur
          const trimmed = inputValue.trim().replace(/,$/, '');
          if (trimmed && !tags.includes(trimmed)) {
            onAdd(trimmed);
            onInputChange('');
          }
        }}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

/** UserProfile form — skills, target roles, experience level, resume paste */
export function UserProfileForm() {
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: getUserProfileAction,
    staleTime: 60_000,
  });

  const { mutate, isPending } = useUserProfileMutation();

  // Local tag state — converted to arrays on submit
  const [skills, setSkills] = useState<string[]>(() => profile?.skills ?? []);
  const [targetRoles, setTargetRoles] = useState<string[]>(() => profile?.targetRoles ?? []);
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    values: {
      skillsInput: '',
      targetRolesInput: '',
      experienceLevel: profile?.experienceLevel ?? null,
      resumeText: profile?.resumeText ?? null,
    },
  });

  // Sync tags from loaded profile when query resolves
  const profileSkills = profile?.skills ?? [];
  const profileRoles = profile?.targetRoles ?? [];
  if (profileSkills.length > 0 && skills.length === 0) setSkills(profileSkills);
  if (profileRoles.length > 0 && targetRoles.length === 0) setTargetRoles(profileRoles);

  function onSubmit(values: UserProfileFormValues) {
    // Commit any uncommitted input text before saving
    const finalSkills = skillInput.trim()
      ? [...skills, skillInput.trim()]
      : skills;
    const finalRoles = roleInput.trim()
      ? [...targetRoles, roleInput.trim()]
      : targetRoles;

    mutate({
      skills: finalSkills,
      targetRoles: finalRoles,
      experienceLevel: values.experienceLevel || null,
      resumeText: values.resumeText || null,
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading profile…
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Skills */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Skills
          </label>
          <TagInput
            tags={skills}
            inputValue={skillInput}
            onInputChange={setSkillInput}
            onAdd={(v) => setSkills((prev) => [...prev, v])}
            onRemove={(i) => setSkills((prev) => prev.filter((_, idx) => idx !== i))}
            placeholder="Type a skill and press Enter (e.g. TypeScript, React)"
          />
          <p className="text-xs text-muted-foreground">Press Enter or comma to add each skill.</p>
        </div>

        {/* Target Roles */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-violet-400" />
            Target Roles
          </label>
          <TagInput
            tags={targetRoles}
            inputValue={roleInput}
            onInputChange={setRoleInput}
            onAdd={(v) => setTargetRoles((prev) => [...prev, v])}
            onRemove={(i) => setTargetRoles((prev) => prev.filter((_, idx) => idx !== i))}
            placeholder="e.g. Senior Frontend Engineer, Staff Engineer"
          />
          <p className="text-xs text-muted-foreground">Roles the AI will optimise your cover letters for.</p>
        </div>

        {/* Experience Level */}
        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-400" />
                Experience Level
              </FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v)}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder="Select your level…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Resume Text */}
        <FormField
          control={form.control}
          name="resumeText"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-amber-400" />
                Resume / CV Text
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste your resume text here — the AI uses this to personalise fit scores and cover letters…"
                  className="glass-input min-h-[180px] resize-y text-sm"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Plain text only — no formatting needed. This stays in your account and is never shared.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full sm:w-auto sm:self-end"
          disabled={isPending}
        >
          {isPending ? 'Saving…' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  );
}
