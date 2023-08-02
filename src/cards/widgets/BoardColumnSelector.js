import { SELECT_NULL } from '../../constants';

export default function BoardColumnSelector(options, title) {
	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName('id');

	if (options.length) {
		dropdown.addItem('--Select--', SELECT_NULL, false);
		for (let b of options) {
			dropdown.addItem(b.label, b.id, false);
		}
	} else dropdown.addItem('--Select--', SELECT_NULL, true);
	return dropdown;
}
