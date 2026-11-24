import type { SubjectDefinition } from '../types/platform';

interface SubjectIllustrationProps {
  iconKey: SubjectDefinition['iconKey'];
  className?: string;
}

export function SubjectIllustration({ iconKey, className = 'w-12 h-12' }: SubjectIllustrationProps) {
  switch (iconKey) {
    case 'math':
    case 'algebra':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#EFF6FF" />
          <polygon points="16,46 32,16 48,46" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinejoin="round" />
          <circle cx="44" cy="22" r="7" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2.5" />
          <path d="M18 22 H28 M23 17 V27" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'geometry':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#EEF2FF" />
          <polygon points="16,46 16,18 46,46" fill="#C7D2FE" stroke="#4F46E5" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="16" y="38" width="8" height="8" fill="none" stroke="#4338CA" strokeWidth="2" />
          <circle cx="42" cy="22" r="8" fill="none" stroke="#1E293B" strokeWidth="2.5" strokeDasharray="3 3" />
        </svg>
      );
    case 'physics':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F0F9FF" />
          <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(30 32 32)" fill="none" stroke="#0284C7" strokeWidth="2.5" />
          <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(-30 32 32)" fill="none" stroke="#0284C7" strokeWidth="2.5" />
          <ellipse cx="32" cy="32" rx="20" ry="8" transform="rotate(90 32 32)" fill="none" stroke="#38BDF8" strokeWidth="2" />
          <circle cx="32" cy="32" r="4.5" fill="#0369A1" />
        </svg>
      );
    case 'chemistry':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#ECFDF5" />
          <path d="M26 14 H38 M28 14 V26 L18 46 C17 48 18.5 50 21 50 H43 C45.5 50 47 48 46 46 L36 26 V14" fill="#D1FAE5" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M22 39 H42" stroke="#047857" strokeWidth="2.5" />
          <circle cx="29" cy="44" r="2" fill="#059669" />
          <circle cx="36" cy="42" r="2.5" fill="#10B981" />
        </svg>
      );
    case 'biology':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F0FDF4" />
          <path d="M32 50 V26" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
          <path d="M32 34 C20 34 16 24 18 16 C26 16 32 22 32 34 Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M32 28 C44 28 48 18 46 12 C38 12 32 18 32 28 Z" fill="#BBF7D0" stroke="#15803D" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="32" cy="50" r="3" fill="#166534" />
        </svg>
      );
    case 'geography':
    case 'world':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#ECFEFF" />
          <circle cx="32" cy="30" r="16" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
          <ellipse cx="32" cy="30" rx="8" ry="16" fill="none" stroke="#0369A1" strokeWidth="2" />
          <line x1="16" y1="30" x2="48" y2="30" stroke="#0369A1" strokeWidth="2" />
          <path d="M22 50 H42 M32 46 V50" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'history_kz':
    case 'history_world':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#FFFBEB" />
          <path d="M20 16 H46 C49 16 50 22 46 22 H22 V44 C22 47 18 48 16 45 V20 C16 17.5 18 16 20 16 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M22 22 H44 V46 C44 48 41 49 38 49 H20" fill="#FEF3C7" stroke="#B45309" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="27" y1="29" x2="39" y2="29" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <line x1="27" y1="36" x2="37" y2="36" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'informatics':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F1F5F9" />
          <rect x="14" y="16" width="36" height="24" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <path d="M24 25 L20 28 L24 31 M40 25 L44 28 L40 31 M34 23 L30 33" stroke="#38BDF8" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 40 L24 47 H40 L38 40" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'literature':
    case 'alphabet':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#FEF2F2" />
          <path d="M14 20 C22 18 28 20 32 24 C36 20 42 18 50 20 V46 C42 44 36 46 32 49 C28 46 22 44 14 46 Z" fill="#FFFFFF" stroke="#DC2626" strokeWidth="2.5" strokeLinejoin="round" />
          <line x1="32" y1="24" x2="32" y2="49" stroke="#DC2626" strokeWidth="2" />
          <line x1="19" y1="28" x2="27" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="37" y1="28" x2="45" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="19" y1="35" x2="27" y2="35" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'kazakh':
    case 'russian':
    case 'english':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F5F3FF" />
          <rect x="14" y="16" width="24" height="18" rx="6" fill="#DDD6FE" stroke="#6D28D9" strokeWidth="2.2" />
          <rect x="26" y="29" width="24" height="18" rx="6" fill="#FFFFFF" stroke="#5B21B6" strokeWidth="2.2" />
          <line x1="32" y1="36" x2="44" y2="36" stroke="#6D28D9" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="32" y1="41" x2="40" y2="41" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'law':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F8FAFC" />
          <line x1="32" y1="14" x2="32" y2="48" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="18" y1="22" x2="46" y2="22" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 22 L13 34 H23 Z M46 22 L41 34 H51 Z" fill="#E2E8F0" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
          <line x1="22" y1="48" x2="42" y2="48" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'music':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#FFF1F2" />
          <path d="M26 42 V20 L44 16 V38" fill="none" stroke="#E11D48" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="43" r="5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="2.5" />
          <circle cx="40" cy="39" r="5" fill="#FDA4AF" stroke="#E11D48" strokeWidth="2.5" />
        </svg>
      );
    case 'art_craft':
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#FFF7ED" />
          <path d="M32 15 C42 15 48 22 48 31 C48 39 42 46 33 46 C28 46 26 43 26 40 C26 37 22 36 19 36 C15 36 14 32 16 27 C19 19 25 15 32 15 Z" fill="#FFEDD5" stroke="#EA580C" strokeWidth="2.5" />
          <circle cx="26" cy="25" r="2.8" fill="#EF4444" />
          <circle cx="35" cy="23" r="2.8" fill="#2563EB" />
          <circle cx="40" cy="30" r="2.8" fill="#16A34A" />
        </svg>
      );
    case 'nvtp':
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
          <rect width="64" height="64" rx="14" fill="#F0FDF4" />
          <path d="M32 14 L46 20 V32 C46 41 39 47 32 50 C25 47 18 41 18 32 V20 Z" fill="#DCFCE7" stroke="#15803D" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M26 32 L30 36 L38 27" fill="none" stroke="#166534" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}
