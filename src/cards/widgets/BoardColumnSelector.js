import { SELECT_NULL } from '../../constants';
import { getSettingsAllowedFields } from '../../utils/localStorage';

export default function BoardColumnSelector(options, col) {
	const allowed = getSettingsAllowedFields();
	console.log('ALLOWED==>', allowed);

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(col.title)
		.setFieldName(col.id);

	if (options.length) {
		dropdown.addItem('--Select--', SELECT_NULL, false);
		for (let b of options) {
			const found = allowed.find(a => a.id === col.id);
			const selected = found ? true : false;
			dropdown.addItem(b.label, b.id, selected);
		}
	} else dropdown.addItem('--Select--', SELECT_NULL, true);
	return dropdown;
}
