import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Building2,
  Clock,
  Link,
  MapPin,
} from 'lucide-react';

/** Shared copy + field metadata for Create/Edit job forms */
export const JOB_FORM_COPY = {
  create: {
    title: 'New Application',
    subtitle:
      'Track a role in your pipeline — enrichment runs when you add an apply URL',
  },
  edit: {
    title: 'Edit Application',
    subtitle: 'Update details for this tracked role',
  },
  footer: {
    cancel: 'Cancel',
    submitCreate: 'Add Application',
    submitEdit: 'Save Application',
    pendingCreate: 'Adding…',
    pendingEdit: 'Saving…',
  },
  fields: {
    position: {
      label: 'Position',
      icon: Briefcase,
      iconClass: 'text-sky-400',
    },
    company: {
      label: 'Company',
      icon: Building2,
      iconClass: 'text-violet-400',
    },
    location: {
      label: 'Location',
      icon: MapPin,
      iconClass: 'text-emerald-400',
    },
    status: {
      label: 'Job Status',
      icon: Clock,
      iconClass: 'text-amber-400',
    },
    mode: {
      label: 'Job Mode',
      icon: Briefcase,
      iconClass: 'text-sky-400',
    },
    applyUrl: {
      label: 'Apply URL (optional)',
      icon: Link,
      iconClass: 'text-muted-foreground',
    },
  },
} as const satisfies {
  create: { title: string; subtitle: string };
  edit: { title: string; subtitle: string };
  footer: Record<string, string>;
  fields: Record<
    string,
    { label: string; icon: LucideIcon; iconClass: string }
  >;
};
