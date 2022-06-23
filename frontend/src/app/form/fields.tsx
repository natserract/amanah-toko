import React, { FC, useEffect, useRef } from 'react';
import { useField, FieldMetaProps } from 'formik';
import {
  FieldWrapperProps,
  InputField,
  SelectField,
  SelectFieldOption,
  DataListField,
  TextAreaField,
  AutoCompleteField,
} from './index';
import NumberFormat, { NumberFormatProps } from 'react-number-format'

import MUICheckbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import MUIAutocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const FieldWrapper = ({
  inline,
  idOrName,
  label,
  required,
  children,
  hidden = false,
}: FieldWrapperProps) => {
  const classes = inline
    ? { div: 'col-auto', label: 'visually-hidden' }
    : { div: 'mb-3', label: 'form-label' };

  if (hidden) return <React.Fragment />;

  return (
    <div className={classes.div}>
      <label className={classes.label} htmlFor={idOrName}>
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
    </div>
  );
};

const ErrorMessage = ({ meta }: { meta: FieldMetaProps<any> }) => {
  const { touched, error } = meta;

  return (
    <>
      {touched && error && (
        <div className="form-text text-danger text-md-start" key={error}>
          <span>{error}</span>
        </div>
      )}
    </>
  );
};

const fieldClassName = (
  meta: FieldMetaProps<any>,
  value: string | number | readonly string[] = '',
  validation = true
) => {
  const { touched, error } = meta;

  let classes = 'form-control rounded-0';

  if (validation) {
    if (touched && error) {
      classes += ' is-invalid';
    }
    if (touched && !error) {
      classes += ' is-valid';
    }
  }
  return classes;
};

const Input: FC<InputField> = ({
  label,
  inline = false,
  validation,
  hidden,
  ...props
}) => {
  const [field, meta] = useField(props);

  return (
    <FieldWrapper
      hidden={hidden}
      inline={inline}
      idOrName={props.id || props.name}
      label={label}
      required={props.required}
    >
      <input
        className={fieldClassName(meta, props.value, validation)}
        {...field}
        {...props}
      />
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  );
};

const CurrencyInput: FC<InputField & Partial<NumberFormatProps>> = ({
  label,
  inline = false,
  validation,
  hidden,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <FieldWrapper
      hidden={hidden}
      inline={inline}
      idOrName={props.id || props.name}
      label={label}
      required={props.required}
    >
      <NumberFormat
        className={fieldClassName(meta, props.value, validation)}
        prefix="Rp. "
        thousandSeparator="."
        decimalSeparator=","
        allowNegative={false}
        {...(field)}
        {...props}
      />
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  );
};

const Checkbox: FC<InputField> = ({
  label,
  inline = false,
  validation,
  ...props
}) => {
  const [field, meta] = useField(props);

  const checkBox = (
    <div className="mt-3 mb-3 form-check">
      <input
        className="form-check-input"
        type="checkbox"
        {...field}
        {...props}
      />
      <label className="form-check-label" htmlFor={props.id || props.name}>
        {label}
        {props.required && <span className="text-danger"> *</span>}
      </label>
      <ErrorMessage meta={meta} />
    </div>
  );

  if (inline) {
    return <div className="col-auto">{checkBox}</div>;
  }
  return checkBox;
};

const Select: FC<SelectField> = ({
  label,
  inline = false,
  validation,
  options,
  children,
  hidden,
  ...props
}) => {
  const [field, meta] = useField(props);

  const selectOptions = (() => {
    if (options?.length) {
      return options.map((option: SelectFieldOption) => {
        if (typeof option === 'string') {
          return (
            <option key={option} value={option}>
              {option}
            </option>
          );
        }
        return (
          <option key={`${option.value}`} value={option.value}>
            {option.label}
          </option>
        );
      });
    }
  })();

  return (
    <FieldWrapper
      inline={inline}
      idOrName={props.name}
      label={label}
      required={props.required}
      hidden={hidden}
    >
      <select
        className={fieldClassName(meta, props.value, validation)}
        hidden={hidden}
        {...field}
        {...props}
      >
        <>
          {children}
          {selectOptions}
        </>
      </select>
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  );
};

const DataList: FC<DataListField> = ({
  label,
  inline = false,
  validation,
  options,
  ...props
}) => {
  const [field, meta] = useField(props);

  const dataList = (
    <datalist id={`${props.name}-list`}>
      {options?.length &&
        options.map((option) => {
          return <option key={option}> {option.toString()} </option>;
        })}
    </datalist>
  );

  return (
    <FieldWrapper
      inline={inline}
      idOrName={props.name}
      label={label}
      required={props.required}
    >
      <input
        className={fieldClassName(meta, props.value, validation)}
        {...field}
        {...props}
        list={`${props.name}-list`}
      />
      {dataList}
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  );
};

const TextArea: FC<TextAreaField> = ({
  label,
  inline = false,
  validation,
  ...props
}) => {
  const [field, meta] = useField(props);

  return (
    <FieldWrapper
      inline={inline}
      idOrName={props.name}
      label={label}
      required={props.required}
    >
      <textarea
        className={fieldClassName(meta, props.value, validation)}
        rows={5}
        {...field}
        {...props}
      >
        {props.value}
      </textarea>
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  );
};

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const AutoComplete: FC<AutoCompleteField> = ({
  label,
  inline = false,
  validation,
  hidden,
  options,
  multiple = false,
  ...props
}) => {
  const [ field, meta, helpers] = useField(props);
  const { setValue } = helpers

  const values = useRef<Set<string>>(new Set())

  return (
    <FieldWrapper
      inline={inline}
      idOrName={props.name}
      label={label}
      required={props.required}
    >
      <MUIAutocomplete
        multiple={multiple}
        options={options}
        disableCloseOnSelect
        getOptionLabel={(option) => option.label}
        renderInput={(params) => (
          <TextField {...params} {...field} label={label} placeholder={label} />
        )}
        onChange={(e, value) => {
          if (value && Array.isArray(value)) {
            let selectedValues: string[] = []

            // :: Add values
            value.length > 0 && value.forEach(val => {
              values.current.add(val.value)
              selectedValues = [...Array.from(values.current.values())]
            })

            // :: Remove values
            selectedValues = selectedValues.filter(val2 => value.some(val => val.value === val2))

            // :: Formik only accept string value, so we must stringify it!
            if (selectedValues.length > 0) {
              setValue(JSON.stringify(selectedValues), false)
            } else {
              setValue(null)
            }
          } else {
            if (value) setValue(value?.value)
          }
        }}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <MUICheckbox
              icon={icon}
              checkedIcon={checkedIcon}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option.label}
          </li>
        )}
        sx={{
          marginTop: 1,
        }}
      />
      <ErrorMessage meta={meta} />
    </FieldWrapper>
  )
}

export { Input, CurrencyInput, Checkbox, Select, DataList, TextArea, AutoComplete };
