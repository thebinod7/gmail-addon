import { SELECT_NULL } from '../../constants';

export default function BoardColumnSelector({ options, col, existingAllowedFields = [] }) {
	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(col.title)
		.setFieldName(col.id);

	if (options.length) {
		dropdown.addItem('--Select--', SELECT_NULL, false);
		const found = existingAllowedFields.find(a => a.id === col.id);
		for (let b of options) {
			const selected = found && b.id === col.id ? true : false;
			dropdown.addItem(b.label, b.id, selected);
		}
	} else dropdown.addItem('--Select--', SELECT_NULL, true);
	return dropdown;
}
