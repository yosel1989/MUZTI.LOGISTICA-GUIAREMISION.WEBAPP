import { FormArray, ValidatorFn, AbstractControl } from '@angular/forms';

export function minItemsValidator(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    if (control instanceof FormArray) {
      return control.length >= min ? null : { minItems: { required: min, actual: control.length } };
    }
    return null;
  };
}