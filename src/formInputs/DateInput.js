export default function DateInput(input) {
	const { id, title } = input;
	const dateTimePicker = CardService.newDatePicker()
		.setTitle(title)
		.setFieldName(id)
		// Set default value as Jan 1, 2018 UTC. Either a number or string is acceptable.
		.setValueInMsSinceEpoch(1514775600);

	return dateTimePicker;
}
