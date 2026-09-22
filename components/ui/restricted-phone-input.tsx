// // src/components/ui/restricted-phone-input.tsx
// import * as React from 'react';
// import PhoneInput, { isValidPhoneNumber, type Country } from 'react-phone-number-input';
// import 'react-phone-number-input/style.css';
// import { cn } from '@/lib/utils';
// import { Label } from '@/components/ui/label';

// export interface RestrictedPhoneInputProps {
//   /** Current value in E.164 format (e.g. "+2348012345678") */
//   value: string;
//   /** Called with the new E.164 value ('' if cleared) */
//   onChange: (val: string) => void;
//   /** ISO country code to default to, e.g. 'NG' */
//   defaultCountry?: Country;
//   /** Optional label rendered above the input */
//   label?: string;
//   /** Marks the label with a required asterisk */
//   required?: boolean;
//   /** Disables the field */
//   disabled?: boolean;
//   /** How long the red "blocked" state stays visible, in ms */
//   blockFlashDuration?: number;
//   /** Message shown under the field when max length is hit */
//   overLimitMessage?: string;
//   /** Extra classes for the outer wrapper */
//   className?: string;
//   /** Extra classes for the input itself */
//   inputClassName?: string;
//   /** id, useful for associating with the Label */
//   id?: string;
// }

// /**
//  * A phone number input that hard-blocks further digit entry (typed or pasted)
//  * once the current value is already a complete, valid number for the selected
//  * country — and flashes a red border + message on the blocked attempt.
//  *
//  * Backspace, arrow keys, and deleting/editing existing digits always work.
//  */
// export const RestrictedPhoneInput = React.forwardRef<
//   HTMLInputElement,
//   RestrictedPhoneInputProps
// >(function RestrictedPhoneInput(
//   {
//     value,
//     onChange,
//     defaultCountry = 'NG',
//     label,
//     required,
//     disabled,
//     blockFlashDuration = 1200,
//     overLimitMessage = 'Maximum digits reached for this number',
//     className,
//     inputClassName,
//     id,
//   },
//   ref
// ) {
//   const [overLimit, setOverLimit] = React.useState(false);
//   const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

//   React.useEffect(() => {
//     return () => {
//       if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     };
//   }, []);

//   const triggerOverLimit = () => {
//     setOverLimit(true);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => setOverLimit(false), blockFlashDuration);
//   };

//   const isComplete = Boolean(value) && isValidPhoneNumber(value);

//   // Block any additional digit once the number is already complete
//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const isDigit = /^[0-9]$/.test(e.key);
//     if (isDigit && isComplete) {
//       e.preventDefault();
//       triggerOverLimit();
//     }
//   };

//   // Block pasting extra digits into an already-complete number
//   const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
//     if (isComplete) {
//       e.preventDefault();
//       triggerOverLimit();
//     }
//   };

//   const showInvalid =
//     overLimit || (value.length > 4 && value.length > 13 && !isValidPhoneNumber(value));

//   return (
//     <div className={cn('space-y-2', className)}>
//       {label && (
//         <Label htmlFor={id}>
//           {label} {required && <span className="text-destructive">*</span>}
//         </Label>
//       )}
//       <PhoneInput
//         ref={ref as any}
//         id={id}
//         international
//         defaultCountry={defaultCountry}
//         limitMaxLength
//         disabled={disabled}
//         value={value}
//         onChange={(val: any) => onChange(val || '')}
//         onKeyDown={handleKeyDown}
//         onPaste={handlePaste}
//         className={cn(
//           'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background',
//           'file:border-0 file:bg-transparent file:text-sm file:font-medium',
//           'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
//           'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
//           showInvalid
//             ? 'border-red-500 ring-2 ring-red-500/40 focus-visible:ring-red-500'
//             : 'border-input focus-visible:ring-ring',
//           inputClassName
//         )}
//       />
//       {overLimit && (
//         <p className="text-xs text-red-500 font-medium">{overLimitMessage}</p>
//       )}
//     </div>
//   );
// });

// src/components/ui/restricted-phone-input.tsx
import * as React from 'react';
import PhoneInput, { isValidPhoneNumber, type Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export interface RestrictedPhoneInputProps {
  /** Current value in E.164 format (e.g. "+2348012345678") */
  value: string;
  /** Called with the new E.164 value ('' if cleared) */
  onChange: (val: string) => void;
  /** Called whenever the field's validity changes (true = complete & valid, or empty & not required) */
  onValidityChange?: (isValid: boolean) => void;
  /** ISO country code to default to, e.g. 'NG' */
  defaultCountry?: Country;
  /** Optional label rendered above the input */
  label?: string;
  /** Marks the label with a required asterisk */
  required?: boolean;
  /** Disables the field */
  disabled?: boolean;
  /** How long the red "blocked" state stays visible, in ms */
  blockFlashDuration?: number;
  /** Message shown under the field when max length is hit */
  overLimitMessage?: string;
  /** Message shown under the field when the number is too short to be valid */
  incompleteMessage?: string;
  /** Message shown under the field when required and empty */
  requiredMessage?: string;
  /** Extra classes for the outer wrapper */
  className?: string;
  /** Extra classes for the input itself */
  inputClassName?: string;
  /** id, useful for associating with the Label */
  id?: string;
}

/**
 * A phone number input that:
 *  - hard-blocks further digit entry (typed or pasted) once the current value
 *    is already a complete, valid number for the selected country, flashing a
 *    red border + message on the blocked attempt.
 *  - flags the field as invalid (red border + message) once the user has
 *    interacted with it and the number is non-empty but too short/incomplete,
 *    so the parent form can prevent submission via `onValidityChange`.
 *
 * Backspace, arrow keys, and deleting/editing existing digits always work.
 */
export const RestrictedPhoneInput = React.forwardRef<
  HTMLInputElement,
  RestrictedPhoneInputProps
>(function RestrictedPhoneInput(
  {
    value,
    onChange,
    onValidityChange,
    defaultCountry = 'NG',
    label,
    required,
    disabled,
    blockFlashDuration = 1200,
    overLimitMessage = 'Maximum digits reached for this number',
    incompleteMessage = 'This phone number looks incomplete',
    requiredMessage = 'Phone number is required',
    className,
    inputClassName,
    id,
  },
  ref
) {
  const [overLimit, setOverLimit] = React.useState(false);
  const [touched, setTouched] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const triggerOverLimit = () => {
    setOverLimit(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setOverLimit(false), blockFlashDuration);
  };

  const isEmpty = value.length === 0;
  const isComplete = !isEmpty && isValidPhoneNumber(value);
  // Non-empty but doesn't parse as a valid, complete number for the country -> incomplete/short
  const isIncomplete = !isEmpty && !isComplete;
  const isMissingRequired = Boolean(required) && isEmpty;

  // Overall validity the parent form should gate submission on
  const isFieldValid = required ? isComplete : isEmpty || isComplete;

  // Report validity changes to the parent (e.g. to disable a submit button)
  const onValidityChangeRef = React.useRef(onValidityChange);
  onValidityChangeRef.current = onValidityChange;
  React.useEffect(() => {
    onValidityChangeRef.current?.(isFieldValid);
  }, [isFieldValid]);

  // Block any additional digit once the number is already complete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const isDigit = /^[0-9]$/.test(e.key);
    if (isDigit && isComplete) {
      e.preventDefault();
      triggerOverLimit();
    }
  };

  // Block pasting extra digits into an already-complete number
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isComplete) {
      e.preventDefault();
      triggerOverLimit();
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  // Only start showing "incomplete"/"required" errors after the user has
  // interacted with the field (blurred it at least once), so we don't flag
  // errors while they're still mid-typing on first entry.
  const showIncomplete = touched && isIncomplete;
  const showRequired = touched && isMissingRequired;
  const showInvalid = overLimit || showIncomplete || showRequired;

  const errorMessage = overLimit
    ? overLimitMessage
    : showRequired
    ? requiredMessage
    : showIncomplete
    ? incompleteMessage
    : null;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <PhoneInput
        ref={ref as any}
        id={id}
        international
        defaultCountry={defaultCountry}
        limitMaxLength
        disabled={disabled}
        value={value}
        onChange={(val: any) => onChange(val || '')}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={handleBlur}
        className={cn(
          'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
          showInvalid
            ? 'border-red-500 ring-2 ring-red-500/40 focus-visible:ring-red-500'
            : 'border-input focus-visible:ring-ring',
          inputClassName
        )}
      />
      {errorMessage && (
        <p className="text-xs text-red-500 font-medium">{errorMessage}</p>
      )}
    </div>
  );
});