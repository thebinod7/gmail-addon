export default function Person(input, boardUsers) {
	const { id, title, value } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id);

	if (boardUsers && boardUsers.length) {
		for (let b of boardUsers) {
			const isSelected = value && value.length && b.id.toString() == value[0].value ? true : false;
			dropdown.addItem(b.name, b.id.toString(), isSelected);
		}
	} else {
		dropdown.addItem('--Select--', '', true);
	}

	return dropdown;
}
