export default function StatusInput(input) {
	const { id, title } = input;
	const dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id)
		.addItem('Option 1', 'option_1', true)
		.addItem('Option 2', 'option_2', false);

	return dropdown;
}
