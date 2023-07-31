import { fetchColumnValues } from '../services/monday';
import { SELECT_NULL } from '../constants';

// Move data fetching part in save contact?
export default function ConnectBoardInput(input) {
	console.log('Connect_Col==>', input);
	const { settings_str } = input;
	const boardIds = getBoardIDsFromSettingStr(settings_str);
	const res = fetchColumnValues(boardIds);
	const { boards } = res.data;
	const rowItems = boards.length ? boards[0].items : [];

	return renderUI({ input, rowItems });
}

function renderUI({ input, rowItems }) {
	const { id, title, value } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle('')
		.setFieldName(id)
		.addItem('--Select Item--', SELECT_NULL, true);

	if (rowItems.length) {
		for (let b of rowItems) {
			// const isSelected = value && b.id === value.toString() ? true : false;
			dropdown.addItem(b.name, b.id, false);
		}
	}

	return dropdown;
}

function getBoardIDsFromSettingStr(settings_str) {
	const jsonData = JSON.parse(settings_str);
	return jsonData?.boardIds || [];
}
