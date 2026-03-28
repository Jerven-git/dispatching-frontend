import { useState, FormEvent } from 'react';
import { ApiError } from '@/lib/api';

interface UseFormSubmitReturn {
  errors: Record<string, string[]>;
  generalError: string;
  submitting: boolean;
  handleSubmit: (e: FormEvent, submitFn: () => Promise<void>) => Promise<void>;
  clearFieldError: (field: string) => void;
  clearErrors: () => void;
}

export function useFormSubmit(): UseFormSubmitReturn {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent, submitFn: () => Promise<void>) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSubmitting(true);

    try {
      await submitFn();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors);
        setGeneralError(err.message);
      } else if (err instanceof Error) {
        setGeneralError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const clearErrors = () => {
    setErrors({});
    setGeneralError('');
  };

  return { errors, generalError, submitting, handleSubmit, clearFieldError, clearErrors };
}
