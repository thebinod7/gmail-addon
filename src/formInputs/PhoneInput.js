export default function PhoneInput(input) {
	const { id, title, value } = input;
	let phoneInput = CardService.newTextInput().setFieldName(id).setTitle(title);
	if (value) phoneInput.setValue(value);
	return phoneInput;
}
