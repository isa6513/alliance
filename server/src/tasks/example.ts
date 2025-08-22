// example.ts
import { defineForm, ResponseOf } from './schema';

export const onboarding = defineForm({
  slug: 'onboarding',
  version: 1,
  title: 'New Member',
  pages: [
    {
      id: 'basic',
      title: 'Basics',
      fields: [
        {
          id: 'name',
          kind: 'text',
          label: 'Full name',
          required: true,
        } as const,
        { id: 'email', kind: 'email', label: 'Email', required: true } as const,
        {
          id: 'role',
          kind: 'select',
          label: 'Role',
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Professional', value: 'pro' },
          ],
          required: true,
        } as const,
        {
          id: 'school',
          kind: 'text',
          label: 'School',
          visibleIf: { when: 'role', equals: 'student' },
        } as const,
        {
          id: 'newsletter',
          kind: 'checkbox',
          label: 'Subscribe to newsletter?',
          defaultValue: false,
        } as const,
        {
          id: 'areas',
          kind: 'multiselect',
          label: 'Areas of interest',
          options: [
            { label: 'AI', value: 'ai' },
            { label: 'Design', value: 'design' },
            { label: 'Product', value: 'product' },
          ],
        } as const,
      ],
    },
  ],
  submit: { label: 'Create Account' },
} as const);

export type OnboardingResponse = ResponseOf<typeof onboarding>;
