import { SELECT_NULL } from '../../constants';

export default function BoardColumnSelector() {
	let options = [
		{ label: 'A', id: '1' },
		{ label: 'B', id: '2' },
		{ label: 'C', id: '3' }
	];

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle('')
		.setFieldName('id');

	if (options.length) {
		dropdown.addItem('--Select--', SELECT_NULL, false);
		for (let b of options) {
			const stringId = b.id.toString();
			dropdown.addItem(b.label, stringId, false);
		}
	} else dropdown.addItem('--Select--', SELECT_NULL, true);
	return dropdown;
}
