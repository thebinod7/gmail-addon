export default function NumberInput(input) {
	const { id, title, value } = input;
	let numberInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	if (value) numberInput.setValue(value);

	return numberInput;
}
