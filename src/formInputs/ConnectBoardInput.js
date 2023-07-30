import { fetchBoardColumns } from '../services/monday';
import { SELECT_NULL } from '../constants';

export default function ConnectBoardInput(input) {
	console.log('Connect_Col==>', input);
	const { settings_str } = input;
	const boardIds = getBoardIDsFromSettingStr(settings_str);
	const res = fetchBoardColumns(boardIds);
	const { boards } = res.data;
	console.log('Boards==>', boards);

	return renderUI({ input, boards });
}

function renderUI({ input, boards }) {
	const { id, title, value } = input;

	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle(title)
		.setFieldName(id)
		.addItem('--Select Board--', SELECT_NULL, true);

	if (boards.length) {
		for (let b of boards) {
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
