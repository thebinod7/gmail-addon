export default function Person(input, boardUsers) {
	const { id, title } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id)
		.addItem('--Select User--', null, true);

	if (boardUsers.length) {
		for (let b of boardUsers) {
			dropdown.addItem(b.name, b.id.toString(), false);
		}
	}

	return dropdown;
}
