import { BadRequestException } from '@nestjs/common';

export function asTrimmedText(
  value: unknown,
  fieldName: string,
  maxLength = 255,
): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(`${fieldName} must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new BadRequestException(`${fieldName} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new BadRequestException(
      `${fieldName} must be at most ${maxLength} characters long.`,
    );
  }

  return trimmed;
}

export function asEmail(value: unknown, fieldName: string): string {
  const email = asTrimmedText(value, fieldName, 255).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new BadRequestException(
      `${fieldName} must be a valid email address.`,
    );
  }

  return email;
}

export function asPositiveInteger(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new BadRequestException(`${fieldName} must be a positive integer.`);
  }

  return value;
}
