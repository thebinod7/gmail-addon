export default function LinkInput(input) {
	const { id, title } = input;
	const textInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	return textInput;
}