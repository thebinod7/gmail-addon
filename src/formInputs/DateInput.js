export default function DateInput(input) {
	const { id, title } = input;
	const dateTimePicker = CardService.newDatePicker().setTitle(title).setFieldName(id);

	return dateTimePicker;
}
