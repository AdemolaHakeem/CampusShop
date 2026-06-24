export const emailRules = [
  { required: true, message: 'Please enter your email' },
  { type: 'email', message: 'Please enter a valid email' },
];

export const passwordConfirmRule = (fieldName = 'password', errorMessage = 'Passwords do not match!') => ({
  validator(_, value) {
    return ({ getFieldValue }) => {
      if (!value || getFieldValue(fieldName) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(errorMessage));
    };
  },
});

export const createPasswordConfirmRules = (fieldName = 'password', requiredMessage = 'Please confirm your password', mismatchMessage = 'Passwords do not match!') => [
  { required: true, message: requiredMessage },
  ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue(fieldName) === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error(mismatchMessage));
    },
  }),
];
