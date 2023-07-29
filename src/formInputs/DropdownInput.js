export default function DropdownInput(input, currentDropdowCols) {
	let dropdownOptions = [];

	if (currentDropdowCols) {
		const opts = JSON.parse(currentDropdowCols.settings_str);
		dropdownOptions =
			opts && opts.labels
				? opts.labels.map(d => {
						return {
							label: d.name,
							value: d.id
						};
				  })
				: [];
	} else {
		const opts = JSON.parse(input.settings_str);
		dropdownOptions =
			opts && opts.labels
				? opts.labels.map(d => {
						return {
							label: d.name,
							value: d.id
						};
				  })
				: [];
	}

	if (!dropdownOptions.length) return '';
	return renderDropdown({ input, dropdownOptions });
}

function renderDropdown({ input, dropdownOptions }) {
	const savedValues = input.text ? input.text.split(',') : []; // ['A','B']
	let checkboxGroup = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.CHECK_BOX)
		.setTitle(input.title)
		.setFieldName(input.id);

	const foundValues = getSavedValuesFromOptions({ savedValues, dropdownOptions });
	for (let d of dropdownOptions) {
		const value = d.value.toString();
		const selected = foundValues.includes(value);
		checkboxGroup.addItem(d.label, value, selected);
	}

	return checkboxGroup;
}

function getSavedValuesFromOptions({ savedValues, dropdownOptions }) {
	const foundValues = [];
	for (let i = 0; i < savedValues.length; i++) {
		const savedLabel = savedValues[i].trim();
		const found = dropdownOptions.find(f => f.label === savedLabel);
		if (found) foundValues.push(found.value.toString());
	}
	return foundValues;
}
