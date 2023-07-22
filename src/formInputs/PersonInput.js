export default function Person(input, boardUsers) {
	const { id, title } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id);

	if (boardUsers.length) {
		for (let b of boardUsers) {
			dropdown.addItem(b.name, b.id.toString(), false);
		}
	} else {
		dropdown.addItem('--Select--', '', true);
	}

	return dropdown;
}
