export default function DropdownInput(input) {
	let dropdownOptions = [];

	if (input.settings_str) {
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
	let checkboxGroup = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.CHECK_BOX)
		.setTitle(input.title)
		.setFieldName(input.id);
	for (let d of dropdownOptions) {
		checkboxGroup.addItem(d.label, d.value, false);
	}

	return checkboxGroup;
}
