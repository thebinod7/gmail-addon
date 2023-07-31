import { SELECT_NULL } from '../constants';
import { getBoardItemsFromSettingStr } from '../utils/misc';

export default function ConnectBoardInput(input) {
	const { rowItems, boardId } = getBoardItemsFromSettingStr(input);
	return renderUI({ input, rowItems });
}

function renderUI({ input, rowItems }) {
	const { id, title, value } = input;
	let dropdown = CardService.newSelectionInput()
		.setType(CardService.SelectionInputType.DROPDOWN)
		.setTitle('')
		.setFieldName(id);

	if (rowItems.length) {
		dropdown.addItem('--Select Item--', SELECT_NULL, false);
		for (let b of rowItems) {
			console.log(b.id, value);
			const selected = b.id === value ? true : false;
			console.log({ selected });
			dropdown.addItem(b.name, b.id, selected);
		}
	} else dropdown.addItem('--Select Item--', SELECT_NULL, true);

	return dropdown;
}
