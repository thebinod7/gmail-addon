export default function EmailInput(input) {
	const { id, title, value } = input;
	let emailInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	if (value) emailInput.setValue(value);

	return emailInput;
}
