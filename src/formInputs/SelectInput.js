export default function SelectInput(input, currentSelectInput) {
	const { id, title } = input;

	let options = [];

	if (currentSelectInput) {
		const opts = JSON.parse(currentSelectInput.settings_str);
		const keys = Object.keys(opts.labels);
		const values = Object.values(opts.labels);
		if (keys.length) {
			for (let k of keys) {
				let opt = {
					id: keys[k],
					label: values[k]
				};
				options.push(opt);
			}
		}
	}

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id);

	if (options.length) {
		for (let b of options) {
			dropdown.addItem(b.label, b.id, false);
		}
	} else {
		dropdown.addItem('--Select--', '', true);
	}

	return dropdown;
}
