import { HttpErrorResponse } from '@angular/common/http';

export type ApplicationError = {
  description: string;
};

export function toApplicationError(
  error: unknown,
  fallbackDescription = 'Something went wrong. Please try again.'
): ApplicationError {
  if (error instanceof HttpErrorResponse) {
    return {
      description: getErrorDescription(error.error) ?? fallbackDescription,
    };
  }

  return {
    description: fallbackDescription,
  };
}

function getErrorDescription(errorBody: unknown): string | null {
  if (
    errorBody &&
    typeof errorBody === 'object' &&
    'description' in errorBody &&
    typeof errorBody.description === 'string'
  ) {
    return errorBody.description;
  }

  return typeof errorBody === 'string' ? errorBody : null;
}
