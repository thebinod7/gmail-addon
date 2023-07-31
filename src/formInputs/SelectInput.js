import { SELECT_NULL } from '../constants';

export default function SelectInput(input, currentSelectInput) {
	const { id, title, value } = input;

	let options = [];

	if (currentSelectInput) {
		const opts = JSON.parse(currentSelectInput.settings_str);
		const keys = Object.keys(opts.labels);
		const values = Object.values(opts.labels);
		if (keys.length && values.length) {
			for (let i = 0; i < keys.length; i++) {
				const val = values[i];
				if (val) {
					let opt = {
						id: keys[i],
						label: val
					};
					options.push(opt);
				}
			}
		}
	}

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id)
		.addItem('--Select--', SELECT_NULL, true);

	if (options.length) {
		for (let b of options) {
			const isSelected = value && b.id === value.toString() ? true : false;
			dropdown.addItem(b.label, b.id, isSelected);
		}
	}
	return dropdown;
}
