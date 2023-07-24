export default function TextInput(input) {
	const { id, title, value } = input;

	let textInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	if (value) textInput.setValue(value);

	return textInput;
}
