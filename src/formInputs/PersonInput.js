import { SELECT_NULL } from '../constants';

export default function Person(input, boardUsers) {
	const { id, title, value } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id);

	if (boardUsers && boardUsers.length) {
		dropdown.addItem('--Select--', SELECT_NULL, false);
		for (let b of boardUsers) {
			const isSelected = value && value.length && b.id.toString() == value[0].value ? true : false;
			dropdown.addItem(b.name, b.id.toString(), isSelected);
		}
	} else dropdown.addItem('--Select--', SELECT_NULL, true);

	return dropdown;
}
