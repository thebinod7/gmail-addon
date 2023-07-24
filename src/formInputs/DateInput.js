export default function DateInput(input) {
	const { id, title, value } = input;
	let msSinceEpoch;
	if (value) {
		const dateObj = new Date(value);
		msSinceEpoch = dateObj.getTime();
	}
	let dateTimePicker = CardService.newDatePicker().setTitle(title).setFieldName(id);
	if (msSinceEpoch) dateTimePicker.setValueInMsSinceEpoch(msSinceEpoch);

	return dateTimePicker;
}
