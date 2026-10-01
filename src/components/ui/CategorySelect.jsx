import Select from './Select';

export default function CategorySelect({ value, onChange, categories, disabled }) {
  const options = categories.map((c) => ({
    value: c._id,
    label: c.name,
    color: c.color,
    hint: !c.isActive ? 'Inactive' : undefined
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select a category…"
      disabled={disabled}
    />
  );
}