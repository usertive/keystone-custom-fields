export function validateVectorImageUpload({file, validity}: {file: File; validity: ValidityState}): string | undefined {
  if(!validity.valid) {
    return 'Something went wrong, please reload and try again.';
  }

  if(!file.type.includes('image') || file.type !== 'image/svg+xml') {
    return 'Only vector images (.svg) are allowed. Please pick another file.';
  }
}
