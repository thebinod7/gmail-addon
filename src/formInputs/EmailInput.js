export default function EmailInput(input) {
	const { id, title, value } = input;
	const textInput = CardService.newTextInput()
		.setFieldName(id)
		.setTitle(title)
		.setValue(value || '');
	return textInput;
}
