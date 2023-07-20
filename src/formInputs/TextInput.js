export default function TextInput(input) {
	const { id, title, type, value } = input;
	const defaultValue = type === 'name' ? value : '';
	const textInput = CardService.newTextInput().setFieldName(id).setTitle(title).setValue(defaultValue);
	return textInput;
}
