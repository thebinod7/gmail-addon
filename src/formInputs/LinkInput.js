export default function LinkInput(input) {
	const { id, title, value } = input;
	let linkInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	if (value) linkInput.setValue(value);

	return linkInput;
}
